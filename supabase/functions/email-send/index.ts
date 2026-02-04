import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  campaignId?: string;
  enableTracking?: boolean;
}

// Wrap links with tracking URLs
function wrapLinksWithTracking(html: string, trackingId: string, baseUrl: string): string {
  const trackingBaseUrl = `${baseUrl}/functions/v1/email-tracking/click/${trackingId}`;
  
  // Match href attributes in anchor tags
  return html.replace(
    /href=["']([^"']+)["']/gi,
    (match, url) => {
      // Don't wrap mailto: or tel: links
      if (url.startsWith("mailto:") || url.startsWith("tel:") || url.startsWith("#")) {
        return match;
      }
      const encodedUrl = encodeURIComponent(url);
      return `href="${trackingBaseUrl}?url=${encodedUrl}"`;
    }
  );
}

// Add tracking pixel to email body
function addTrackingPixel(html: string, trackingId: string, baseUrl: string): string {
  const pixelUrl = `${baseUrl}/functions/v1/email-tracking/open/${trackingId}`;
  const pixel = `<img src="${pixelUrl}" width="1" height="1" style="display:none;visibility:hidden;" alt="" />`;
  
  // Try to add before </body> if exists, otherwise append
  if (html.includes("</body>")) {
    return html.replace("</body>", `${pixel}</body>`);
  }
  return html + pixel;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { to, subject, body, leadId, leadName, campaignId, enableTracking = true }: EmailRequest = await req.json();

    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: to, subject, body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Generate a unique tracking ID
    const trackingId = crypto.randomUUID();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("EMAIL_FROM_ADDRESS") || "onboarding@resend.dev";

    // Demo mode if no API key configured
    if (!resendApiKey) {
      console.log("Demo mode: Email not configured. Would send to:", to);
      console.log("Subject:", subject);
      console.log("Body preview:", body.substring(0, 100));

      // Create message log even in demo mode for tracking purposes
      if (userId) {
        await supabase.from("message_logs").insert({
          user_id: userId,
          lead_id: leadId || null,
          campaign_id: campaignId || null,
          channel: "email",
          recipient: to,
          subject: subject,
          body: body,
          status: "demo",
          tracking_id: trackingId,
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          demo: true,
          message: "Demo mode: Email simulated (no RESEND_API_KEY configured)",
          recipient: to,
          subject: subject,
          preview: body.substring(0, 100),
          trackingId,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare email HTML
    let emailHtml = body.replace(/\n/g, "<br>");
    
    // Add tracking if enabled
    if (enableTracking) {
      emailHtml = wrapLinksWithTracking(emailHtml, trackingId, supabaseUrl);
      emailHtml = addTrackingPixel(emailHtml, trackingId, supabaseUrl);
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
        html: emailHtml,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", result);
      
      // Log failed attempt
      if (userId) {
        await supabase.from("message_logs").insert({
          user_id: userId,
          lead_id: leadId || null,
          campaign_id: campaignId || null,
          channel: "email",
          recipient: to,
          subject: subject,
          body: body,
          status: "failed",
          error_message: result.message || "Failed to send",
          tracking_id: trackingId,
        });
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: result.message || "Failed to send email",
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log successful send
    if (userId) {
      await supabase.from("message_logs").insert({
        user_id: userId,
        lead_id: leadId || null,
        campaign_id: campaignId || null,
        channel: "email",
        recipient: to,
        subject: subject,
        body: body,
        status: "sent",
        external_id: result.id,
        tracking_id: trackingId,
        delivered_at: new Date().toISOString(),
      });
    }

    console.log("Email sent successfully:", {
      messageId: result.id,
      to,
      leadId,
      leadName,
      trackingId,
    });

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.id,
        recipient: to,
        trackingId,
        trackingEnabled: enableTracking,
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
