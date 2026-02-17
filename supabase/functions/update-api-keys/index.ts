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
    // Verify the user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, key_name, key_value } = await req.json();

    if (action === "get_status") {
      // Return which keys are set (not the values)
      const geminiKey = Deno.env.get("GEMINI_API_KEY");
      const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");
      
      return new Response(JSON.stringify({
        keys: {
          GEMINI_API_KEY: geminiKey ? `${geminiKey.slice(0, 6)}...${geminiKey.slice(-4)}` : null,
          ELEVENLABS_API_KEY: elevenLabsKey ? `${elevenLabsKey.slice(0, 6)}...${elevenLabsKey.slice(-4)}` : null,
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "test_key") {
      if (key_name === "GEMINI_API_KEY") {
        const testKey = key_value || Deno.env.get("GEMINI_API_KEY");
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
        const testKey = key_value || Deno.env.get("ELEVENLABS_API_KEY");
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

    // Note: Actually updating Supabase secrets requires the Management API which
    // isn't accessible from edge functions. Instead, we inform the admin they need 
    // to update via the platform settings.
    return new Response(JSON.stringify({ 
      error: "To update API keys, please use the platform's secret management. This endpoint can only test existing keys." 
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
