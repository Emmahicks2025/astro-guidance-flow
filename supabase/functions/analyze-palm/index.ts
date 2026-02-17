import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PALM_ANALYSIS_PROMPT = `You are an expert palmist with deep knowledge of Vedic and Western palmistry. Analyze the palm image provided and give a comprehensive, detailed reading.

You must analyze:
1. **Life Line** — Length, depth, curvature, breaks. Health, vitality, life changes.
2. **Heart Line** — Emotional nature, relationships, love life.
3. **Head Line** — Intellect, thinking style, decision-making.
4. **Fate Line** — Career path, destiny, life direction.
5. **Sun Line (Apollo)** — Fame, success, creativity.
6. **Marriage Lines** — Number, depth, relationship patterns.
7. **Mount Analysis** — Jupiter, Saturn, Apollo, Mercury, Venus, Moon, Mars mounts.
8. **Finger Analysis** — Shape, length proportions, fingertip patterns.
9. **Special Markings** — Stars, crosses, triangles, islands, chains on lines.

Respond ONLY with a valid JSON object in this exact format:
{
  "overall_summary": "2-3 sentence overview of the person's palm",
  "life_line": {
    "rating": "Strong/Moderate/Weak",
    "description": "Detailed 2-3 sentence analysis",
    "predictions": ["prediction 1", "prediction 2"]
  },
  "heart_line": {
    "rating": "Strong/Moderate/Weak",
    "description": "Detailed analysis",
    "predictions": ["prediction 1", "prediction 2"]
  },
  "head_line": {
    "rating": "Strong/Moderate/Weak",
    "description": "Detailed analysis",
    "predictions": ["prediction 1", "prediction 2"]
  },
  "fate_line": {
    "rating": "Strong/Moderate/Weak/Absent",
    "description": "Detailed analysis",
    "predictions": ["prediction 1", "prediction 2"]
  },
  "marriage_lines": {
    "count": 1,
    "description": "Analysis of marriage/relationship lines",
    "predictions": ["prediction 1"]
  },
  "mounts": [
    {"name": "Jupiter", "status": "Prominent/Normal/Flat", "meaning": "brief meaning"},
    {"name": "Saturn", "status": "Prominent/Normal/Flat", "meaning": "brief meaning"},
    {"name": "Apollo", "status": "Prominent/Normal/Flat", "meaning": "brief meaning"},
    {"name": "Mercury", "status": "Prominent/Normal/Flat", "meaning": "brief meaning"},
    {"name": "Venus", "status": "Prominent/Normal/Flat", "meaning": "brief meaning"},
    {"name": "Moon", "status": "Prominent/Normal/Flat", "meaning": "brief meaning"}
  ],
  "special_markings": [
    {"type": "Star/Cross/Triangle/Island/Chain", "location": "on which line/mount", "meaning": "what it indicates"}
  ],
  "personality_traits": ["trait 1", "trait 2", "trait 3", "trait 4", "trait 5"],
  "career_guidance": "2-3 sentences on career potential",
  "health_indicators": "2-3 sentences on health indications",
  "relationship_outlook": "2-3 sentences on love and relationships",
  "lucky_elements": {
    "color": "Lucky color",
    "number": "Lucky number",
    "day": "Lucky day",
    "gemstone": "Recommended gemstone"
  },
  "remedies": [
    {"issue": "What it addresses", "remedy": "Specific remedy", "type": "Mantra/Gemstone/Ritual"}
  ],
  "confidence_score": 85
}

Be specific, detailed, and insightful. Use traditional palmistry terminology with simple explanations. Always be encouraging while being honest about challenges.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided", success: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing palm image with Gemini Pro Vision...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: PALM_ANALYSIS_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this palm image in detail. Provide a complete palmistry reading. Return ONLY the JSON object as specified." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            ],
          },
        ],
        max_tokens: 8192,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let analysisResult;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[1].trim());
      } else {
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          analysisResult = JSON.parse(content.substring(jsonStart, jsonEnd + 1));
        } else {
          analysisResult = JSON.parse(content);
        }
      }
    } catch (parseError) {
      console.error("JSON parsing failed:", parseError);
      analysisResult = { error: "Analysis partially completed. Please try again with a clearer image." };
    }

    return new Response(
      JSON.stringify({ success: true, analysis: analysisResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-palm:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed", success: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
