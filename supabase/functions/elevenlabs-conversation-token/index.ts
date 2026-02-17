import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getApiKey } from "../_shared/get-api-key.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Get or create a shared ElevenLabs Conversational AI agent.
 * The agent has overrides enabled so we can dynamically set prompt, voice, etc. per call.
 */
async function getOrCreateAgent(apiKey: string): Promise<string> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Check if we already have an agent ID stored
  const { data: existing } = await supabase
    .from("api_keys")
    .select("key_value")
    .eq("key_name", "ELEVENLABS_SHARED_AGENT_ID")
    .maybeSingle();

  if (existing?.key_value) {
    return existing.key_value;
  }

  // Create a new agent with overrides enabled
  console.log("Creating shared ElevenLabs agent...");
  const response = await fetch("https://api.elevenlabs.io/v1/convai/agents/create", {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      conversation_config: {
        agent: {
          prompt: {
            prompt: "You are a helpful spiritual consultant. Be warm, conversational, and keep responses short (1-3 sentences).",
          },
          first_message: "Namaste! How can I help you today?",
          language: "en",
        },
        asr: {
          quality: "high",
          provider: "elevenlabs",
          model_id: "scribe_v2",
        },
        tts: {
          model_id: "eleven_turbo_v2_5",
          voice_id: "JBFqnCBsd6RMkjVDRZzb",
          optimize_streaming_latency: 4,
        },
        conversation: {
          max_duration_seconds: 1800,
        },
      },
      platform_settings: {
        overrides: {
          conversation_config: {
            agent: {
              prompt: { prompt: true },
              first_message: true,
              language: true,
            },
            tts: {
              voice_id: true,
            },
          },
        },
      },
      name: "AstroGuru Shared Agent",
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Agent creation failed:", response.status, errText);
    throw new Error(`Failed to create ElevenLabs agent: ${response.status}`);
  }

  const agentData = await response.json();
  const agentId = agentData.agent_id;

  console.log("Created agent:", agentId);

  // Store agent ID for reuse
  await supabase.from("api_keys").upsert({
    key_name: "ELEVENLABS_SHARED_AGENT_ID",
    key_value: agentId,
  }, { onConflict: "key_name" });

  return agentId;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = await getApiKey("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    // Get or create shared agent
    const agentId = await getOrCreateAgent(ELEVENLABS_API_KEY);

    console.log("Getting conversation token for agent:", agentId);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agentId}`,
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs token error:", response.status, errorText);
      throw new Error(`Failed to get conversation token: ${response.status}`);
    }

    const data = await response.json();
    console.log("ElevenLabs token obtained successfully");

    return new Response(JSON.stringify({ token: data.token, agentId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Conversation token error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
