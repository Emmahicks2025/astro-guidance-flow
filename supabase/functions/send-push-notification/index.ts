import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Build JWT for APNs authentication
async function createAPNsJWT(teamId: string, keyId: string, p8Key: string): Promise<string> {
  const header = { alg: "ES256", kid: keyId };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: teamId, iat: now };

  const encode = (obj: any) => {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    return btoa(String.fromCharCode(...bytes)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  };

  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const signingInput = `${headerB64}.${payloadB64}`;

  // Import the P8 key
  const pemContents = p8Key
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(signingInput)
  );

  // Convert DER signature to raw r||s format expected by JWT
  const sigArray = new Uint8Array(signature);
  let sigB64: string;
  
  if (sigArray.length === 64) {
    // Already raw format
    sigB64 = btoa(String.fromCharCode(...sigArray)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  } else {
    // DER format - extract r and s
    const r = extractDERInt(sigArray, 3);
    const s = extractDERInt(sigArray, 3 + 1 + sigArray[3] + 1);
    const rawSig = new Uint8Array(64);
    rawSig.set(padTo32(r), 0);
    rawSig.set(padTo32(s), 32);
    sigB64 = btoa(String.fromCharCode(...rawSig)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  }

  return `${headerB64}.${payloadB64}.${sigB64}`;
}

function extractDERInt(buf: Uint8Array, offset: number): Uint8Array {
  const len = buf[offset + 1];
  return buf.slice(offset + 2, offset + 2 + len);
}

function padTo32(arr: Uint8Array): Uint8Array {
  if (arr.length === 32) return arr;
  if (arr.length === 33 && arr[0] === 0) return arr.slice(1);
  if (arr.length < 32) {
    const padded = new Uint8Array(32);
    padded.set(arr, 32 - arr.length);
    return padded;
  }
  return arr.slice(arr.length - 32);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientUserId, title, body, data } = await req.json();

    if (!recipientUserId || !body) {
      return new Response(JSON.stringify({ error: "recipientUserId and body required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get device tokens for recipient
    const { data: tokens, error: tokenErr } = await supabase
      .from("device_tokens")
      .select("token")
      .eq("user_id", recipientUserId);

    if (tokenErr || !tokens?.length) {
      console.log("No device tokens for user:", recipientUserId);
      return new Response(JSON.stringify({ sent: 0, reason: "no_tokens" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const teamId = Deno.env.get("APNS_TEAM_ID")!;
    const keyId = Deno.env.get("APNS_KEY_ID")!;
    const p8Key = Deno.env.get("APNS_KEY_P8")!;
    const bundleId = "app.lovable.530494d644ff476c873c028405b2170d";

    const jwt = await createAPNsJWT(teamId, keyId, p8Key);

    let sent = 0;
    const errors: string[] = [];

    for (const { token } of tokens) {
      try {
        const apnsPayload = {
          aps: {
            alert: { title: title || "New Message", body },
            sound: "default",
            badge: 1,
          },
          ...(data || {}),
        };

        const resp = await fetch(
          `https://api.push.apple.com/3/device/${token}`,
          {
            method: "POST",
            headers: {
              authorization: `bearer ${jwt}`,
              "apns-topic": bundleId,
              "apns-push-type": "alert",
              "apns-priority": "10",
              "content-type": "application/json",
            },
            body: JSON.stringify(apnsPayload),
          }
        );

        if (resp.ok) {
          sent++;
        } else {
          const errText = await resp.text();
          console.error(`APNs error for token ${token.slice(0, 8)}...:`, resp.status, errText);
          errors.push(errText);
          // Remove invalid tokens
          if (resp.status === 410 || resp.status === 400) {
            await supabase.from("device_tokens").delete().eq("token", token);
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        console.error("Push send error:", msg);
        errors.push(msg);
      }
    }

    return new Response(JSON.stringify({ sent, total: tokens.length, errors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
