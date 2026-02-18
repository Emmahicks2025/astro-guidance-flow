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
    const { expertId, transcript } = await req.json();

    if (!transcript || !expertId) {
      throw new Error("expertId and transcript are required");
    }

    // Get user from auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    // Use LLM to extract key points from transcript
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Fetch existing memories
    const { data: existing } = await supabase
      .from("conversation_memories")
      .select("*")
      .eq("user_id", user.id)
      .eq("expert_id", expertId)
      .maybeSingle();

    const existingPoints = existing?.key_points || [];
    const existingCount = existing?.total_calls || 0;

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
    ? `Existing key points from previous calls:\\n${
      existingPoints.map((p: string) => `- ${p}`).join("\\n")
    }\\n\\nDo NOT repeat existing points. Only add NEW information.`
    : ""
}

Return a JSON object with:
- "new_points": array of 3-8 concise new key points (strings)
- "summary": a 1-2 sentence overall summary of the user's situation including past context

Transcript:
${transcript}`;

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
      // Still save a basic memory even if extraction fails
      await supabase.from("conversation_memories").upsert({
        user_id: user.id,
        expert_id: expertId,
        key_points: existingPoints,
        total_calls: existingCount + 1,
        last_call_at: new Date().toISOString(),
      }, { onConflict: "user_id,expert_id" });

      return new Response(
        JSON.stringify({ success: true, extracted: false }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
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
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
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
