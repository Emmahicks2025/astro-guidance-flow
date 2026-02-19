import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { expertId, transcript, conversationId } = await req.json();

    if (!expertId) {
      throw new Error("expertId is required");
    }

    // Get user from auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate user token
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userError || !user) throw new Error("Unauthorized");

    // Try to get transcript from ElevenLabs API if conversationId provided and no client transcript
    let finalTranscript = transcript || "";

    if (!finalTranscript && conversationId) {
      console.log("Fetching transcript from ElevenLabs for conversation:", conversationId);
      const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
      if (ELEVENLABS_API_KEY) {
        try {
          // Wait a moment for ElevenLabs to process the conversation
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const historyResp = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
            {
              headers: { "xi-api-key": ELEVENLABS_API_KEY },
            }
          );
          if (historyResp.ok) {
            const historyData = await historyResp.json();
            const turns = historyData.transcript || [];
            finalTranscript = turns
              .map((t: any) => `${t.role === "user" ? "User" : "Expert"}: ${t.message}`)
              .join("\n");
            console.log("Got transcript from ElevenLabs API, turns:", turns.length);
          } else {
            console.error("ElevenLabs history fetch failed:", historyResp.status);
          }
        } catch (e) {
          console.error("Failed to fetch ElevenLabs history:", e);
        }
      }
    }

    if (!finalTranscript) {
      console.warn("No transcript available — saving call count only");
    }

    // Use LLM to extract key points from transcript
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Fetch existing memories
    const { data: existing } = await supabase
      .from("conversation_memories")
      .select("*")
      .eq("user_id", user.id)
      .eq("expert_id", expertId)
      .maybeSingle();

    const existingPoints = existing?.key_points || [];
    const existingCount = existing?.total_calls || 0;

    // If no transcript, just update call count
    if (!finalTranscript || !LOVABLE_API_KEY) {
      await supabase.from("conversation_memories").upsert({
        user_id: user.id,
        expert_id: expertId,
        key_points: existingPoints,
        total_calls: existingCount + 1,
        last_call_at: new Date().toISOString(),
      }, { onConflict: "user_id,expert_id" });

      return new Response(
        JSON.stringify({ success: true, extracted: false, reason: !finalTranscript ? "no_transcript" : "no_api_key" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const extractionPrompt = `You are analyzing a voice conversation between an astrology expert and a user. Extract the most important key points about the USER (not the expert).

Focus on:
- Personal life events mentioned (marriage, job change, health issues)
- Specific questions or concerns raised
- Birth details or astrological details discussed
- Remedies suggested and whether user agreed to try them
- Emotional state or mood
- Any follow-up items or promises made

${
  existingPoints.length > 0
    ? `Existing key points from previous calls:\n${
      existingPoints.map((p: string) => `- ${p}`).join("\n")
    }\n\nDo NOT repeat existing points. Only add NEW information.`
    : ""
}

Return a JSON object with:
- "new_points": array of 3-8 concise new key points (strings)
- "summary": a 1-2 sentence overall summary of the user's situation including past context

Transcript:
${finalTranscript}`;

    const llmResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "user", content: extractionPrompt }],
          tools: [{
            type: "function",
            function: {
              name: "save_memory",
              description: "Save extracted key points and summary",
              parameters: {
                type: "object",
                properties: {
                  new_points: { type: "array", items: { type: "string" } },
                  summary: { type: "string" },
                },
                required: ["new_points", "summary"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "save_memory" } },
        }),
      },
    );

    if (!llmResponse.ok) {
      console.error("LLM extraction failed:", llmResponse.status);
      await supabase.from("conversation_memories").upsert({
        user_id: user.id,
        expert_id: expertId,
        key_points: existingPoints,
        total_calls: existingCount + 1,
        last_call_at: new Date().toISOString(),
      }, { onConflict: "user_id,expert_id" });

      return new Response(
        JSON.stringify({ success: true, extracted: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const llmData = await llmResponse.json();
    let newPoints: string[] = [];
    let summary = "";

    try {
      const toolCall = llmData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        const args = JSON.parse(toolCall.function.arguments);
        newPoints = args.new_points || [];
        summary = args.summary || "";
      }
    } catch (e) {
      console.error("Failed to parse LLM extraction:", e);
    }

    // Merge points, keep max 30
    const allPoints = [...existingPoints, ...newPoints].slice(-30);

    await supabase.from("conversation_memories").upsert({
      user_id: user.id,
      expert_id: expertId,
      key_points: allPoints,
      summary,
      total_calls: existingCount + 1,
      last_call_at: new Date().toISOString(),
    }, { onConflict: "user_id,expert_id" });

    return new Response(
      JSON.stringify({
        success: true,
        extracted: true,
        newPoints: newPoints.length,
        source: transcript ? "client" : "elevenlabs_api",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Save memory error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
