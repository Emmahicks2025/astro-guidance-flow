import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LIFE_REPORT_PROMPT = `You are an expert Vedic Astrologer creating a personalized life report. Based on the provided Kundli data, create a comprehensive but concise reading.

Analyze the following aspects and provide insights:
1. D1 (Lagna) Chart: For personality, physical traits, and general life path
2. D9 (Navamsa) Chart implications: For marriage and spiritual growth  
3. D2 (Hora) Chart implications: For wealth and prosperity

Provide your analysis in EXACTLY this JSON format:
{
  "generalVibe": {
    "title": "Your Cosmic Personality",
    "content": "2-3 paragraphs about personality, strengths, challenges based on Lagna, Moon, and Sun positions"
  },
  "careerWealth": {
    "title": "Career & Prosperity Path",
    "content": "2-3 paragraphs about career potential, wealth indicators, 10th house, 2nd house analysis"
  },
  "loveMarriage": {
    "title": "Love, Marriage & Relationships",
    "content": "2-3 paragraphs about 7th house, Venus, marriage prospects, relationship karma"
  },
  "generatedAt": "current date string"
}

Use a warm, supportive tone like a wise elder astrologer. Include specific planetary references.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { kundliData, userName, dateOfBirth } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userContext = `
User Name: ${userName}
Date of Birth: ${dateOfBirth}

Kundli Data:
- Lagna (Ascendant): ${kundliData.lagnaSign}
- Moon Nakshatra: ${kundliData.nakshatras?.moon || 'Unknown'} (Pada ${kundliData.nakshatras?.pada || 1})
- Current Maha Dasha: ${kundliData.dashaInfo?.currentMahaDasha || 'Unknown'}

Planetary Positions:
${kundliData.planets?.map((p: any) => `- ${p.planet}: ${p.sign} (House ${p.house})${p.isRetrograde ? ' [R]' : ''}`).join('\n') || 'No planetary data'}
`;

    console.log("Generating life report for:", userName);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: LIFE_REPORT_PROMPT },
          { role: "user", content: userContext }
        ],
        max_tokens: 2000,
        temperature: 0.7,
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
    
    console.log("Life report generated successfully");
    
    // Parse JSON response
    let report;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        report = JSON.parse(jsonMatch[1].trim());
      } else {
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          report = JSON.parse(content.substring(jsonStart, jsonEnd + 1));
        } else {
          report = JSON.parse(content);
        }
      }
      
      // Add generated date if not present
      if (!report.generatedAt) {
        report.generatedAt = new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch (parseError) {
      console.error("Failed to parse report JSON:", parseError);
      // Return a fallback report
      report = {
        generalVibe: {
          title: "Your Cosmic Personality",
          content: `As a ${kundliData.lagnaSign} Ascendant, you possess unique qualities that shape your life journey. Your Moon in ${kundliData.nakshatras?.moon || 'your birth star'} adds emotional depth to your personality.`
        },
        careerWealth: {
          title: "Career & Prosperity Path",
          content: "Your planetary placements indicate potential for success through dedicated effort. The current dasha period is important for making key career decisions."
        },
        loveMarriage: {
          title: "Love, Marriage & Relationships",
          content: "Your relationship karma is influenced by your 7th house placements. Understanding your emotional needs and those of your partner will be key to happiness."
        },
        generatedAt: new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
    }

    return new Response(
      JSON.stringify({ success: true, report }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-life-report:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Report generation failed",
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
