import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Get an API key - checks the api_keys table first, falls back to env var.
 */
export async function getApiKey(keyName: string): Promise<string | null> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data } = await supabase
        .from("api_keys")
        .select("key_value")
        .eq("key_name", keyName)
        .maybeSingle();
      
      if (data?.key_value) {
        return data.key_value;
      }
    }
  } catch (err) {
    console.error(`Failed to fetch ${keyName} from DB, falling back to env:`, err);
  }
  
  return Deno.env.get(keyName) || null;
}
