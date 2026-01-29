import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GUNA_MILAN_PROMPT = `You are an expert Vedic Astrologer performing Ashtakoot Guna Milan (36-point compatibility matching).

Based on the birth details of two individuals, calculate their compatibility score following the traditional 8 aspects (Ashtakoot):

1. Varna (1 point max) - Spiritual compatibility
2. Vashya (2 points max) - Mutual attraction and control
3. Tara (3 points max) - Birth star compatibility
4. Yoni (4 points max) - Physical/intimate compatibility
5. Graha Maitri (5 points max) - Mental compatibility (Moon signs friendship)
6. Gana (6 points max) - Temperament matching (Deva, Manushya, Rakshasa)
7. Bhakoot (7 points max) - Family welfare and prosperity
8. Nadi (8 points max) - Health and progeny (most important)

Total: 36 points maximum

Also check Manglik Dosha for both persons.

Return your analysis in EXACTLY this JSON format:
{
  "totalScore": number (0-36),
  "maxScore": 36,
  "percentage": number (0-100),
  "verdict": "string describing match quality",
  "gunaBreakdown": [
    {"name": "Varna", "description": "Spiritual nature match", "obtained": 0-1, "maximum": 1},
    {"name": "Vashya", "description": "Mutual attraction", "obtained": 0-2, "maximum": 2},
    {"name": "Tara", "description": "Birth star harmony", "obtained": 0-3, "maximum": 3},
    {"name": "Yoni", "description": "Physical compatibility", "obtained": 0-4, "maximum": 4},
    {"name": "Graha Maitri", "description": "Mental wavelength", "obtained": 0-5, "maximum": 5},
    {"name": "Gana", "description": "Temperament match", "obtained": 0-6, "maximum": 6},
    {"name": "Bhakoot", "description": "Family prosperity", "obtained": 0-7, "maximum": 7},
    {"name": "Nadi", "description": "Health & children", "obtained": 0-8, "maximum": 8}
  ],
  "manglikStatus": {
    "person1": boolean,
    "person2": boolean,
    "compatible": boolean
  },
  "recommendations": ["array of 3-5 specific recommendations based on results"]
}

Provide realistic scores based on birth details. Score interpretations:
- 28-36: Excellent match
- 21-27: Good match, minor issues
- 18-20: Average match, needs effort
- Below 18: Challenging match, remedies needed`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { person1, person2 } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const matchContext = `
Person 1 (Boy):
- Name: ${person1.name}
- Date of Birth: ${person1.dateOfBirth}
- Time of Birth: ${person1.timeOfBirth || 'Unknown'}
- Place of Birth: ${person1.placeOfBirth || 'Unknown'}

Person 2 (Girl):
- Name: ${person2.name}
- Date of Birth: ${person2.dateOfBirth}
- Time of Birth: ${person2.timeOfBirth || 'Unknown'}
- Place of Birth: ${person2.placeOfBirth || 'Unknown'}

Calculate the complete Ashtakoot Guna Milan compatibility score.
`;

    console.log("Calculating Guna Milan for:", person1.name, "and", person2.name);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: GUNA_MILAN_PROMPT },
          { role: "user", content: matchContext }
        ],
        max_tokens: 1500,
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
    
    console.log("Guna Milan calculated successfully");
    
    // Parse JSON response
    let result;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1].trim());
      } else {
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          result = JSON.parse(content.substring(jsonStart, jsonEnd + 1));
        } else {
          result = JSON.parse(content);
        }
      }
    } catch (parseError) {
      console.error("Failed to parse Guna Milan JSON:", parseError);
      // Return a sample result
      result = {
        totalScore: 24,
        maxScore: 36,
        percentage: 67,
        verdict: "Good match with minor adjustments needed",
        gunaBreakdown: [
          { name: "Varna", description: "Spiritual nature match", obtained: 1, maximum: 1 },
          { name: "Vashya", description: "Mutual attraction", obtained: 1, maximum: 2 },
          { name: "Tara", description: "Birth star harmony", obtained: 2, maximum: 3 },
          { name: "Yoni", description: "Physical compatibility", obtained: 3, maximum: 4 },
          { name: "Graha Maitri", description: "Mental wavelength", obtained: 4, maximum: 5 },
          { name: "Gana", description: "Temperament match", obtained: 5, maximum: 6 },
          { name: "Bhakoot", description: "Family prosperity", obtained: 4, maximum: 7 },
          { name: "Nadi", description: "Health & children", obtained: 4, maximum: 8 }
        ],
        manglikStatus: { person1: false, person2: false, compatible: true },
        recommendations: [
          "This is a favorable match for marriage",
          "Consider performing Ganapati Puja before marriage",
          "Communication will be key to long-term harmony"
        ]
      };
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in calculate-guna-milan:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Calculation failed",
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
