import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getApiKey } from "../_shared/get-api-key.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, expertId, expertName, expertPersonality } = await req.json();
    
    console.log("Expert chat request:", { expertId, expertName, messageCount: messages?.length });

    const GEMINI_API_KEY = await getApiKey("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Build system prompt based on expert personality
    const defaultPersonality = `You are ${expertName || 'an experienced spiritual consultant'}, a wise and compassionate expert in Vedic astrology and spiritual guidance. You provide thoughtful, personalized advice based on ancient wisdom while being approachable and understanding. Speak with warmth and authority, offering practical guidance while maintaining spiritual depth.`;
    
    const systemPrompt = expertPersonality 
      ? `${expertPersonality}\n\nYou are ${expertName}. Respond as this expert would, maintaining their unique personality and expertise.`
      : defaultPersonality;

    // Convert messages to Gemini format
    const contents = [];
    
    // Add system as first user message
    if (messages.length > 0 && messages[0].role === 'system') {
      contents.push({
        role: 'user',
        parts: [{ text: systemPrompt + '\n\n' + messages[0].content }]
      });
      messages.shift(); // remove system
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: systemPrompt }]
      });
    }

    // Add conversation history
    for (const msg of messages) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: contents,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("Gemini API error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI API error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Transform Gemini SSE to OpenAI-like SSE
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6);
              if (jsonStr.trim() === '') continue;
              
              try {
                const data = JSON.parse(jsonStr);
                if (data.candidates && data.candidates[0]?.content?.parts) {
                  const text = data.candidates[0].content.parts.map((p: any) => p.text).join('');
                  if (text) {
                    const openaiChunk = `data: {"choices":[{"delta":{"content":"${text.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"}}]}\n\n`;
                    await writer.write(new TextEncoder().encode(openaiChunk));
                  }
                }
              } catch (e) {
                console.error('Error parsing Gemini response:', e);
              }
            }
          }
        }
        await writer.write(new TextEncoder().encode('data: [DONE]\n\n'));
      } catch (error) {
        console.error('Stream error:', error);
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Expert chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
