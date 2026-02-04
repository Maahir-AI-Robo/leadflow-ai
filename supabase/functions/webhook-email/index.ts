import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

// Resend webhook event types
type ResendEventType = 
  | "email.sent"
  | "email.delivered"
  | "email.delivery_delayed"
  | "email.complained"
  | "email.bounced"
  | "email.opened"
  | "email.clicked";

interface ResendWebhookPayload {
  type: ResendEventType;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    // For click events
    click?: {
      link: string;
      timestamp: string;
    };
    // For bounce events
    bounce?: {
      message: string;
    };
  };
}

// Verify Resend webhook signature (Svix)
async function verifyResendSignature(
  payload: string,
  headers: Headers,
  secret: string
): Promise<boolean> {
  const svixId = headers.get("svix-id");
  const svixTimestamp = headers.get("svix-timestamp");
  const svixSignature = headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.log("Missing Svix headers");
    return false;
  }

  // Check timestamp is within 5 minutes
  const timestamp = parseInt(svixTimestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) {
    console.log("Timestamp too old");
    return false;
  }

  // Verify signature
  const signedContent = `${svixId}.${svixTimestamp}.${payload}`;
  
  // Extract the secret (remove "whsec_" prefix if present)
  const secretBytes = secret.startsWith("whsec_") 
    ? Uint8Array.from(atob(secret.slice(6)), c => c.charCodeAt(0))
    : new TextEncoder().encode(secret);

  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedContent)
  );

  const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  // Compare with provided signatures (comma-separated)
  const providedSignatures = svixSignature.split(",").map(s => s.trim().split(" ")[1]);
  
  return providedSignatures.some(sig => sig === expectedSignature);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const payload = await req.text();
    
    // Verify signature if secret is configured
    if (webhookSecret) {
      const isValid = await verifyResendSignature(payload, req.headers, webhookSecret);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return new Response("Invalid signature", { status: 401, headers: corsHeaders });
      }
    }

    const event: ResendWebhookPayload = JSON.parse(payload);
    console.log("Received Resend webhook:", event.type, event.data.email_id);

    // Map Resend event types to our status
    const statusMap: Record<ResendEventType, string> = {
      "email.sent": "sent",
      "email.delivered": "delivered",
      "email.delivery_delayed": "delayed",
      "email.complained": "complained",
      "email.bounced": "bounced",
      "email.opened": "opened",
      "email.clicked": "clicked",
    };

    const newStatus = statusMap[event.type] || event.type;
    const emailId = event.data.email_id;

    // Find the message log by external_id
    const { data: messageLog, error: fetchError } = await supabase
      .from("message_logs")
      .select("id, opens_count, clicks_count, first_opened_at")
      .eq("external_id", emailId)
      .single();

    if (fetchError || !messageLog) {
      console.log("Message not found for email_id:", emailId);
      // Return 200 to acknowledge receipt even if we can't find the message
      return new Response(JSON.stringify({ received: true, found: false }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prepare update data based on event type
    const updateData: Record<string, unknown> = {};

    switch (event.type) {
      case "email.delivered":
        updateData.status = "delivered";
        updateData.delivered_at = event.created_at;
        break;

      case "email.opened":
        updateData.opens_count = (messageLog.opens_count || 0) + 1;
        if (!messageLog.first_opened_at) {
          updateData.first_opened_at = event.created_at;
          updateData.read_at = event.created_at;
        }
        // Also record in tracking events
        await supabase.from("email_tracking_events").insert({
          message_log_id: messageLog.id,
          event_type: "open",
          user_agent: "Resend Webhook",
        });
        break;

      case "email.clicked":
        updateData.clicks_count = (messageLog.clicks_count || 0) + 1;
        // Record click event
        await supabase.from("email_tracking_events").insert({
          message_log_id: messageLog.id,
          event_type: "click",
          url: event.data.click?.link || null,
          user_agent: "Resend Webhook",
        });
        break;

      case "email.bounced":
        updateData.status = "bounced";
        updateData.error_message = event.data.bounce?.message || "Email bounced";
        break;

      case "email.complained":
        updateData.status = "complained";
        updateData.error_message = "Recipient marked as spam";
        break;

      case "email.delivery_delayed":
        updateData.status = "delayed";
        break;

      default:
        updateData.status = newStatus;
    }

    // Update message log
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from("message_logs")
        .update(updateData)
        .eq("id", messageLog.id);

      if (updateError) {
        console.error("Error updating message log:", updateError);
      }
    }

    console.log("Processed webhook for message:", messageLog.id, "status:", newStatus);

    return new Response(
      JSON.stringify({ received: true, processed: true, status: newStatus }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
