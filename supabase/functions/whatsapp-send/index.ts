import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendMessageRequest {
  to: string; // Phone number in international format
  message: string;
  leadId?: string;
  leadName?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

    const { to, message, leadId, leadName }: SendMessageRequest = await req.json();

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: "Phone number and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean phone number - remove spaces, dashes, and ensure it starts with country code
    const cleanPhone = to.replace(/[\s\-\(\)]/g, "").replace(/^\+/, "");

    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      // Demo mode - return mock success
      console.log(`[DEMO MODE] Would send WhatsApp to ${cleanPhone}: ${message.substring(0, 50)}...`);
      
      return new Response(
        JSON.stringify({
          success: true,
          demo: true,
          message: "Demo mode - WhatsApp credentials not configured",
          messageId: `demo-${Date.now()}`,
          recipient: cleanPhone,
          preview: message.substring(0, 100),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send via WhatsApp Business API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanPhone,
          type: "text",
          text: { body: message },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("WhatsApp API error:", errorData);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to send WhatsApp message",
          details: errorData.error?.message || "Unknown error"
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({
        success: true,
        messageId: data.messages?.[0]?.id,
        recipient: cleanPhone,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("WhatsApp send error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
