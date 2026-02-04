import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-twilio-signature",
};

// Twilio WhatsApp webhook status values
type TwilioMessageStatus = 
  | "queued"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "undelivered";

interface TwilioWebhookPayload {
  MessageSid: string;
  MessageStatus: TwilioMessageStatus;
  To: string;
  From: string;
  ErrorCode?: string;
  ErrorMessage?: string;
  // For incoming messages
  Body?: string;
  NumMedia?: string;
}

// Verify Twilio signature
async function verifyTwilioSignature(
  url: string,
  params: URLSearchParams,
  signature: string,
  authToken: string
): Promise<boolean> {
  // Sort params and concatenate
  const sortedParams = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}${value}`)
    .join("");

  const data = url + sortedParams;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(authToken),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );

  const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));
  
  return signature === expectedSignature;
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
  const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const contentType = req.headers.get("content-type") || "";
    let payload: TwilioWebhookPayload;

    // Twilio sends form-urlencoded data
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.text();
      const params = new URLSearchParams(formData);
      
      // Verify signature if auth token is configured
      if (twilioAuthToken) {
        const twilioSignature = req.headers.get("x-twilio-signature");
        if (twilioSignature) {
          const requestUrl = req.url;
          const isValid = await verifyTwilioSignature(requestUrl, params, twilioSignature, twilioAuthToken);
          if (!isValid) {
            console.error("Invalid Twilio signature");
            return new Response("Invalid signature", { status: 401, headers: corsHeaders });
          }
        }
      }

      payload = Object.fromEntries(params.entries()) as unknown as TwilioWebhookPayload;
    } else {
      // Fallback to JSON
      payload = await req.json();
    }

    console.log("Received WhatsApp webhook:", payload.MessageStatus, payload.MessageSid);

    const messageSid = payload.MessageSid;
    const status = payload.MessageStatus;

    // Check if this is an incoming message (has Body)
    if (payload.Body && !payload.MessageStatus) {
      console.log("Incoming WhatsApp message from:", payload.From);
      // Handle incoming messages - could create a notification or update lead
      // For now, just log it
      return new Response(
        JSON.stringify({ received: true, type: "incoming" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the message log by external_id (MessageSid)
    const { data: messageLog, error: fetchError } = await supabase
      .from("message_logs")
      .select("id, lead_id, user_id")
      .eq("external_id", messageSid)
      .single();

    if (fetchError || !messageLog) {
      console.log("Message not found for MessageSid:", messageSid);
      return new Response(
        JSON.stringify({ received: true, found: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map Twilio status to our status
    const statusMap: Record<TwilioMessageStatus, string> = {
      queued: "queued",
      sent: "sent",
      delivered: "delivered",
      read: "read",
      failed: "failed",
      undelivered: "failed",
    };

    const newStatus = statusMap[status] || status;
    const updateData: Record<string, unknown> = { status: newStatus };

    switch (status) {
      case "delivered":
        updateData.delivered_at = new Date().toISOString();
        break;

      case "read":
        updateData.read_at = new Date().toISOString();
        // Mark as responded since they saw it
        break;

      case "failed":
      case "undelivered":
        updateData.status = "failed";
        updateData.error_message = payload.ErrorMessage || `Error code: ${payload.ErrorCode || "unknown"}`;
        break;
    }

    // Update message log
    const { error: updateError } = await supabase
      .from("message_logs")
      .update(updateData)
      .eq("id", messageLog.id);

    if (updateError) {
      console.error("Error updating message log:", updateError);
    }

    // If message was read, update lead's last activity
    if (status === "read" && messageLog.lead_id) {
      await supabase
        .from("leads")
        .update({ last_activity: "Replied to WhatsApp" })
        .eq("id", messageLog.lead_id);
    }

    // Create notification for important status changes
    if ((status === "read" || status === "failed") && messageLog.user_id) {
      const notifTitle = status === "read" 
        ? "WhatsApp message read" 
        : "WhatsApp delivery failed";
      
      const notifDesc = status === "read"
        ? `Your WhatsApp message to ${payload.To} was read`
        : `Failed to deliver WhatsApp message: ${payload.ErrorMessage || "Unknown error"}`;

      await supabase.from("notifications").insert({
        user_id: messageLog.user_id,
        lead_id: messageLog.lead_id,
        title: notifTitle,
        description: notifDesc,
        type: status === "read" ? "engagement" : "alert",
        priority: status === "failed" ? "high" : "normal",
      });
    }

    console.log("Processed WhatsApp webhook for message:", messageLog.id, "status:", newStatus);

    // Return TwiML response (empty for status callbacks)
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/xml" } 
      }
    );
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
