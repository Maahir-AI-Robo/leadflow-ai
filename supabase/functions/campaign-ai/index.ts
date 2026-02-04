import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Lead {
  name: string;
  role: string | null;
  company: string | null;
  score: string;
}

interface GenerateSequenceRequest {
  campaignName: string;
  campaignType: string;
  channel: string;
  leads: Lead[];
  numberOfSteps: number;
  tone: string;
  goal: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { campaignName, campaignType, channel, leads, numberOfSteps, tone, goal }: GenerateSequenceRequest = await req.json();

    // Build lead context
    const leadSummary = leads.slice(0, 5).map(l => 
      `${l.name} (${l.role || 'Unknown Role'} at ${l.company || 'Unknown Company'}, ${l.score} lead)`
    ).join(", ");

    const systemPrompt = `You are an expert B2B sales copywriter specializing in ${channel} outreach sequences. 
You write personalized, human-sounding messages that get responses.

Guidelines:
- Keep messages concise and scannable
- Use personalization placeholders: {{name}}, {{company}}, {{role}}
- Each step should have a different angle/approach
- Include clear but soft CTAs
- Sound like a real person, not a template
- For follow-ups, reference the previous message naturally`;

    const userPrompt = `Create a ${numberOfSteps}-step ${channel} outreach sequence for this campaign:

Campaign: "${campaignName}"
Type: ${campaignType}
Goal: ${goal}
Tone: ${tone}
Target leads: ${leadSummary}

Generate exactly ${numberOfSteps} messages. For each step, provide:
1. A compelling subject line (for email) or opening hook
2. The full message body with personalization placeholders
3. Suggested delay in days before sending (0 for first message)

Format your response as a JSON array with this structure:
[
  {
    "step": 1,
    "subject": "Subject line here",
    "body": "Message body with {{name}} and {{company}} placeholders",
    "delay_days": 0
  }
]`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "generate_sequence",
              description: "Generate an email/message sequence for the campaign",
              parameters: {
                type: "object",
                properties: {
                  sequence: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        step: { type: "number" },
                        subject: { type: "string" },
                        body: { type: "string" },
                        delay_days: { type: "number" }
                      },
                      required: ["step", "subject", "body", "delay_days"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["sequence"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_sequence" } }
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
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the sequence from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call response from AI");
    }

    const sequenceData = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sequence: sequenceData.sequence 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Campaign AI error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
