import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { lead } = await req.json();
    if (!lead?.id) {
      return new Response(JSON.stringify({ error: "Lead ID required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `You are a B2B sales intelligence AI. Based on this lead's information, generate a comprehensive enrichment profile.

Lead:
- Name: ${lead.name}
- Role: ${lead.role || "Unknown"}
- Company: ${lead.company || "Unknown"}
- Email: ${lead.email || "Unknown"}
- Notes: ${lead.notes || "None"}

Generate enrichment data as a JSON object with these fields. Be realistic and inference-based:`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a B2B sales intelligence AI. Return structured data." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "enrich_lead",
            description: "Return enrichment data for a B2B lead",
            parameters: {
              type: "object",
              properties: {
                company_description: { type: "string", description: "2-3 sentence company overview" },
                potential_tech_stack: { type: "array", items: { type: "string" }, description: "Likely technologies used" },
                business_challenges: { type: "array", items: { type: "string" }, description: "Key business challenges" },
                estimated_budget_range: { type: "string", description: "e.g. $10K-$50K/year" },
                best_outreach_channel: { type: "string", enum: ["email", "whatsapp", "linkedin"], description: "Best channel to reach this lead" },
                recommended_tone: { type: "string", enum: ["formal", "professional", "casual", "friendly"], description: "Recommended message tone" },
                pain_points: { type: "array", items: { type: "string" }, description: "Specific pain points to address" },
                enrichment_reasoning: { type: "string", description: "Why these conclusions were reached" },
              },
              required: ["company_description", "potential_tech_stack", "business_challenges", "estimated_budget_range", "best_outreach_channel", "recommended_tone", "pain_points", "enrichment_reasoning"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "enrich_lead" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI error:", errText);
      throw new Error("AI enrichment failed");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No enrichment data returned");

    const enrichment = JSON.parse(toolCall.function.arguments);

    // Upsert into ai_lead_profiles
    const { error: upsertError } = await supabaseClient
      .from("ai_lead_profiles")
      .upsert({
        lead_id: lead.id,
        user_id: user.id,
        ...enrichment,
      }, { onConflict: "lead_id" });

    if (upsertError) throw upsertError;

    return new Response(JSON.stringify({ success: true, enrichment }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("lead-enrich error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
