import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt based on expert personality
    const conversationalRules = `

CRITICAL RULES FOR ALL RESPONSES:
- You are having a REAL-TIME VOICE CONVERSATION. Behave like a real human on a phone call.
- Keep responses SHORT — 1 to 3 sentences max. Never give long monologues.
- LISTEN and RESPOND to what the user just said. Don't ignore their questions.
- Ask follow-up questions. Show curiosity. Make it a two-way conversation.
- Use casual, warm language. Say things like "Hmm, interesting...", "Tell me more about that", "Accha, I see..."
- Don't dump all information at once. Share one insight, then pause and let them respond.
- If they ask a question, answer IT directly first, then maybe add one small insight.
- Use natural filler words occasionally: "So...", "Well...", "You know..."
- Never start with a greeting if the conversation is already ongoing.
- Match the user's energy — if they're brief, be brief. If they're curious, engage more.
- Remember: this is a CONVERSATION, not a lecture. Short turns, back and forth.`;

    const defaultPersonality = `You are ${expertName || 'an experienced spiritual consultant'}, a wise and compassionate expert in Vedic astrology and spiritual guidance. You're warm, approachable, and talk like a real person — not a textbook.`;
    
    const systemPrompt = expertPersonality 
      ? `${expertPersonality}\n\nYou are ${expertName}. Respond as this expert would, maintaining their unique personality and expertise.\n${conversationalRules}`
      : `${defaultPersonality}\n${conversationalRules}`;

    // Build messages array for OpenAI-compatible API
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.filter((m: any) => m.role !== 'system'),
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: apiMessages,
        max_tokens: 4096,
        stream: true,
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
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI API error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream the response directly — gateway already uses OpenAI SSE format
    return new Response(response.body, {
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
