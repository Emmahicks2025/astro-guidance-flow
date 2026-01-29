import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_JOTSHI_SYSTEM_PROMPT = `You are an expert Vedic Astrologer (Jotshi) analyzing a Kundli chart. You have deep knowledge of:
- North Indian and South Indian chart styles
- Rashis (signs), Grahas (planets), Bhavas (houses)
- Nakshatras and their padas
- Doshas (Manglik, Kaal Sarp, Pitru, etc.)
- Yogas (Raj Yoga, Gaj Kesari, Budhaditya, etc.)
- Mahadasha and Antardasha calculations
- Traditional Hindu remedies (Mantras, Daan, Gemstones)

When analyzing a Kundli image, you must:
1. Identify the chart style (North Indian Diamond or South Indian Box)
2. Read the Rashi numbers (1-12) in each house
3. Identify planet positions using abbreviations: Su (Sun/Surya), Mo (Moon/Chandra), Ma (Mars/Mangal), Me (Mercury/Budh), Ju (Jupiter/Guru), Ve (Venus/Shukra), Sa (Saturn/Shani), Ra (Rahu), Ke (Ketu)
4. Calculate the Lagna (Ascendant)

Respond ONLY with a valid JSON object in this exact format:
{
  "chartStyle": "North Indian" or "South Indian",
  "lagna": "Aries" to "Pisces",
  "lagnaNumber": 1-12,
  "moonSign": "Aries" to "Pisces",
  "moonNakshatra": "name of nakshatra",
  "nakshatraPada": 1-4,
  "planets": [
    {"name": "Sun", "hindiName": "Surya", "house": 1-12, "sign": "Aries-Pisces", "isRetrograde": false},
    ...for all 9 planets including Rahu and Ketu
  ],
  "doshas": [
    {"name": "Manglik Dosha", "present": true/false, "severity": "mild/moderate/severe", "description": "..."}
  ],
  "yogas": [
    {"name": "Raj Yoga", "present": true/false, "houses": "1, 5", "description": "..."}
  ],
  "mahadasha": {
    "current": "Saturn",
    "startYear": 2020,
    "endYear": 2039,
    "antardasha": "Mercury",
    "antardashaEnd": "2026"
  },
  "personalIdentity": {
    "title": "Your Cosmic Identity",
    "description": "Detailed description about the person's core nature based on Lagna, Moon, and Sun positions..."
  },
  "marriageLove": {
    "title": "Marriage & Relationships",
    "description": "Analysis of 7th house, Venus, and relationship indicators...",
    "warnings": ["Any doshas affecting marriage"]
  },
  "careerWealth": {
    "title": "Career & Prosperity",
    "description": "Analysis of 10th house, 2nd house, and wealth indicators...",
    "predictions": ["Key predictions for career"]
  },
  "dailyRemedy": {
    "title": "Today's Remedy",
    "description": "Based on current planetary transits...",
    "color": "Red/Yellow/etc",
    "deity": "Hanuman/Shiva/etc"
  },
  "remedies": [
    {
      "type": "Mantra",
      "issue": "What this remedies",
      "remedy": "Chant Om Namah Shivaya 108 times",
      "frequency": "Daily",
      "bestDay": "Monday"
    },
    {
      "type": "Daan",
      "issue": "What this remedies",
      "remedy": "Donate black sesame seeds",
      "frequency": "Every Saturday",
      "bestDay": "Saturday"
    },
    {
      "type": "Gemstone",
      "issue": "What this strengthens",
      "remedy": "Wear Yellow Sapphire (Pukhraj)",
      "disclaimer": "Consult a qualified astrologer before wearing"
    }
  ],
  "panchangDetails": {
    "tithi": "Shukla Paksha Ekadashi (example)",
    "vara": "Somvar (Monday)",
    "nakshatra": "Rohini"
  }
}

Use traditional Hindu terminology with English translations. Be specific and detailed in your analysis. Always provide actionable remedies for any negative findings.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, birthDate, analysisType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let messages: any[] = [];
    
    if (analysisType === "scan") {
      // OCR and analysis from image
      messages = [
        { role: "system", content: AI_JOTSHI_SYSTEM_PROMPT },
        { 
          role: "user", 
          content: [
            {
              type: "text",
              text: `Analyze this Kundli chart image. Extract all planetary positions, identify any doshas and yogas, and provide a complete traditional Hindu astrological reading. ${birthDate ? `The person was born on ${birthDate}.` : ''} Return ONLY the JSON object as specified.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ];
    } else {
      // Detailed analysis from existing data
      messages = [
        { role: "system", content: AI_JOTSHI_SYSTEM_PROMPT },
        { 
          role: "user", 
          content: `Based on this birth data: ${JSON.stringify(birthDate)}, provide a detailed Vedic astrological analysis. Return ONLY the JSON object as specified.`
        }
      ];
    }

    console.log("Calling Lovable AI Gateway with Gemini Pro Vision...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages,
        max_tokens: 4000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log("AI Response received, parsing JSON...");
    
    // Helper function to sanitize JSON string
    const sanitizeJson = (jsonStr: string): string => {
      return jsonStr
        // Remove trailing commas before } or ]
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        // Fix unescaped newlines in strings
        .replace(/([^\\])\\n/g, '$1\\\\n')
        // Remove control characters
        .replace(/[\x00-\x1F\x7F]/g, ' ')
        // Fix common issues with quotes
        .replace(/"\s*\n\s*"/g, '", "');
    };

    // Helper function to try parsing JSON with sanitization
    const tryParseJson = (str: string): any => {
      // First try direct parse
      try {
        return JSON.parse(str);
      } catch {
        // Try with sanitization
        const sanitized = sanitizeJson(str);
        return JSON.parse(sanitized);
      }
    };
    
    // Extract JSON from the response
    let analysisResult;
    try {
      // Try to extract JSON from markdown code blocks first
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        analysisResult = tryParseJson(jsonMatch[1].trim());
      } else {
        // Try to find JSON object in the response
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          analysisResult = tryParseJson(content.substring(jsonStart, jsonEnd + 1));
        } else {
          // Try parsing the whole content
          analysisResult = tryParseJson(content);
        }
      }
    } catch (parseError) {
      console.error("JSON parsing failed, attempting recovery...", parseError);
      
      // Last resort: return a structured error response that the frontend can handle
      analysisResult = {
        error: "Chart analysis partially completed. Please try again.",
        chartStyle: "Unknown",
        lagna: "Unknown",
        lagnaNumber: 1,
        moonSign: "Unknown",
        moonNakshatra: "Unknown",
        nakshatraPada: 1,
        planets: [],
        doshas: [],
        yogas: [],
        mahadasha: { current: "Unknown", startYear: 2020, endYear: 2030, antardasha: "Unknown", antardashaEnd: "2025" },
        personalIdentity: { title: "Analysis Pending", description: "We couldn't fully analyze your chart. Please try uploading a clearer image." },
        marriageLove: { title: "Analysis Pending", description: "Please try again with a clearer image.", warnings: [] },
        careerWealth: { title: "Analysis Pending", description: "Please try again with a clearer image.", predictions: [] },
        dailyRemedy: { title: "General Remedy", description: "Start your day with positive intentions.", color: "White", deity: "Ganesha" },
        remedies: [],
        panchangDetails: { tithi: "Unknown", vara: "Unknown", nakshatra: "Unknown" }
      };
    }

    return new Response(
      JSON.stringify({ success: true, analysis: analysisResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-kundli:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Analysis failed",
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
