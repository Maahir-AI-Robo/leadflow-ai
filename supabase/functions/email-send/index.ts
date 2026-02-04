import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  leadId?: string;
  leadName?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, body, leadId, leadName }: EmailRequest = await req.json();

    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: to, subject, body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("EMAIL_FROM_ADDRESS") || "onboarding@resend.dev";

    // Demo mode if no API key configured
    if (!resendApiKey) {
      console.log("Demo mode: Email not configured. Would send to:", to);
      console.log("Subject:", subject);
      console.log("Body preview:", body.substring(0, 100));

      return new Response(
        JSON.stringify({
          success: true,
          demo: true,
          message: "Demo mode: Email simulated (no RESEND_API_KEY configured)",
          recipient: to,
          subject: subject,
          preview: body.substring(0, 100),
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send real email via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subject,
        html: body.replace(/\n/g, "<br>"),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", result);
      return new Response(
        JSON.stringify({
          success: false,
          error: result.message || "Failed to send email",
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email sent successfully:", {
      messageId: result.id,
      to,
      leadId,
      leadName,
    });

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.id,
        recipient: to,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in email-send function:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
