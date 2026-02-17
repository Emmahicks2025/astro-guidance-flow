import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, key_name, key_value } = await req.json();

    // Helper: get key value from DB first, fallback to env
    const getKey = async (name: string): Promise<string | null> => {
      const { data } = await supabase.from("api_keys").select("key_value").eq("key_name", name).maybeSingle();
      if (data?.key_value) return data.key_value;
      return Deno.env.get(name) || null;
    };

    if (action === "get_status") {
      const geminiKey = await getKey("GEMINI_API_KEY");
      const elevenLabsKey = await getKey("ELEVENLABS_API_KEY");

      return new Response(JSON.stringify({
        keys: {
          GEMINI_API_KEY: geminiKey ? `${geminiKey.slice(0, 6)}...${geminiKey.slice(-4)}` : null,
          ELEVENLABS_API_KEY: elevenLabsKey ? `${elevenLabsKey.slice(0, 6)}...${elevenLabsKey.slice(-4)}` : null,
        }
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update_key") {
      if (!key_name || !key_value) {
        return new Response(JSON.stringify({ error: "key_name and key_value are required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const allowedKeys = ["GEMINI_API_KEY", "ELEVENLABS_API_KEY"];
      if (!allowedKeys.includes(key_name)) {
        return new Response(JSON.stringify({ error: "Invalid key name" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase.from("api_keys").upsert(
        { key_name, key_value, updated_by: user.id, updated_at: new Date().toISOString() },
        { onConflict: "key_name" }
      );

      if (error) {
        console.error("Failed to save key:", error);
        return new Response(JSON.stringify({ error: "Failed to save key" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "test_key") {
      if (key_name === "GEMINI_API_KEY") {
        const testKey = key_value || await getKey("GEMINI_API_KEY");
        if (!testKey) {
          return new Response(JSON.stringify({ success: false, error: "No key configured" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        try {
          const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${testKey}`);
          return new Response(JSON.stringify({ success: resp.ok }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch {
          return new Response(JSON.stringify({ success: false, error: "Connection failed" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      if (key_name === "ELEVENLABS_API_KEY") {
        const testKey = key_value || await getKey("ELEVENLABS_API_KEY");
        if (!testKey) {
          return new Response(JSON.stringify({ success: false, error: "No key configured" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        try {
          const resp = await fetch("https://api.elevenlabs.io/v1/user", {
            headers: { "xi-api-key": testKey },
          });
          return new Response(JSON.stringify({ success: resp.ok }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch {
          return new Response(JSON.stringify({ success: false, error: "Connection failed" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
