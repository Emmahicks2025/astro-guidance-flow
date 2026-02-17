import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getApiKey } from "../_shared/get-api-key.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const PANCHANG_SYSTEM_PROMPT = `You are an expert Vedic astrologer and Panchang calculator with deep knowledge of Hindu astronomy (Jyotish Shastra). You provide accurate daily Panchang data based on traditional calculations.

Your role is to generate the EXACT Panchang details for a given date and location. You must:

1. Calculate the correct Tithi (lunar day) including:
   - Name (e.g., Shukla Pratipada, Krishna Ashtami)
   - End time in local timezone

2. Determine the Nakshatra (lunar mansion) including:
   - Name (one of 27 nakshatras)
   - End time in local timezone

3. Calculate the Yoga (auspicious period) including:
   - Name (one of 27 yogas)
   - End time

4. Determine the Karana (half of tithi) including:
   - Name
   - End time

5. Identify the Paksha (lunar fortnight): Shukla (waxing) or Krishna (waning)

6. Determine the Hindu month (e.g., Magha, Phalguna, Chaitra)

7. Calculate sun/moon timings for the location:
   - Sunrise and Sunset times
   - Moonrise and Moonset times

8. Calculate inauspicious periods:
   - Rahu Kaal (varies by weekday)
   - Yamagandam
   - Gulika Kaal

9. Calculate auspicious period:
   - Abhijit Muhurta (most auspicious time)
   - Brahma Muhurta (pre-dawn spiritual time)

IMPORTANT: Base your calculations on:
- The Hindu lunisolar calendar (Vikram/Saka Samvat)
- The user's geographical location for accurate sunrise/sunset
- The current weekday for Rahu Kaal calculations

Respond ONLY with a valid JSON object in this exact format:
{
  "tithi": { "name": "string", "end": "HH:MM AM/PM" },
  "nakshatra": { "name": "string", "end": "HH:MM AM/PM" },
  "yoga": { "name": "string", "end": "HH:MM AM/PM" },
  "karana": { "name": "string", "end": "HH:MM AM/PM" },
  "paksha": "Shukla Paksha" or "Krishna Paksha",
  "month": "string",
  "sunrise": "HH:MM AM/PM",
  "sunset": "HH:MM AM/PM",
  "moonrise": "HH:MM AM/PM",
  "moonset": "HH:MM AM/PM",
  "rahukaal": "HH:MM AM/PM - HH:MM AM/PM",
  "yamagandam": "HH:MM AM/PM - HH:MM AM/PM",
  "gulika": "HH:MM AM/PM - HH:MM AM/PM",
  "abhijit": "HH:MM AM/PM - HH:MM AM/PM",
  "brahmaMuhurta": "HH:MM AM/PM - HH:MM AM/PM",
  "samvat": "string",
  "ayanamsa": "string"
}`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = await getApiKey("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const { date, location, timezone } = await req.json();
    
    const userPrompt = `Generate accurate Panchang for:
- Date: ${date || new Date().toISOString().split('T')[0]}
- Location: ${location || "New Delhi, India"}
- Timezone: ${timezone || "Asia/Kolkata"}
- Weekday: ${new Date(date || Date.now()).toLocaleDateString('en-US', { weekday: 'long' })}

Provide the complete Panchang data in JSON format only.`;

    console.log("Generating Panchang for:", { date, location, timezone });

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: PANCHANG_SYSTEM_PROMPT + "\n\n" + userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.1, // Low temperature for accuracy
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Gemini response received");

    // Extract the text content from Gemini response
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      throw new Error("No content in Gemini response");
    }

    // Parse JSON from the response (handle markdown code blocks)
    let panchangData;
    try {
      // Remove markdown code blocks if present
      const jsonStr = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      panchangData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse Panchang JSON:", textContent);
      throw new Error("Failed to parse Panchang data");
    }

    return new Response(JSON.stringify(panchangData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Panchang generation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        fallback: true 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
