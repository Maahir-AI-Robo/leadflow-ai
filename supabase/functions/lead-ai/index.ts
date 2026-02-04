import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface LeadData {
  name: string;
  role?: string;
  company?: string;
  email?: string;
  notes?: string;
  score?: string;
  score_value?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);

    if (claimsError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, lead } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "generate_summary") {
      systemPrompt = `You are an expert sales AI assistant. Generate a brief, insightful summary about a lead based on the available information. Focus on:
- Their potential as a customer
- Key engagement signals
- Best approach for outreach
- Suggested next steps
Keep the summary to 2-3 sentences maximum. Write in a natural, human tone.`;

      userPrompt = `Generate a sales summary for this lead:
Name: ${lead.name}
Role: ${lead.role || "Unknown"}
Company: ${lead.company || "Unknown"}
Email: ${lead.email || "Not provided"}
Current Score: ${lead.score} (${lead.score_value}/100)
Notes: ${lead.notes || "No notes"}`;
    } else if (type === "score_lead") {
      systemPrompt = `You are an expert lead scoring AI. Analyze the lead information and determine a score from 0-100 and a category (hot, warm, or cold).

Scoring criteria:
- Hot (80-100): Decision maker, active engagement, clear buying signals
- Warm (50-79): Moderate interest, some engagement, potential opportunity
- Cold (0-49): Low engagement, early stage, needs nurturing

Return only valid JSON with exactly this format: {"score": number, "category": "hot"|"warm"|"cold", "reasoning": "brief explanation"}`;

      userPrompt = `Score this lead:
Name: ${lead.name}
Role: ${lead.role || "Unknown"}
Company: ${lead.company || "Unknown"}
Notes: ${lead.notes || "No notes"}`;
    } else if (type === "suggest_outreach") {
      systemPrompt = `You are an expert sales copywriter. Generate a personalized, compelling outreach message for a lead. The message should be:
- Concise (under 100 words)
- Personalized based on their role and company
- Professional but friendly
- Include a clear call to action
Return only the message text, no subject line.`;

      userPrompt = `Write an outreach message for:
Name: ${lead.name}
Role: ${lead.role || "Professional"}
Company: ${lead.company || "their company"}`;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid type. Use: generate_summary, score_lead, or suggest_outreach" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate AI response");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let result: any = { content };

    // Parse JSON response for score_lead
    if (type === "score_lead") {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        }
      } catch {
        result = { content };
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("lead-ai error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
