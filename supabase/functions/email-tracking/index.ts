import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// 1x1 transparent GIF
const TRACKING_PIXEL = Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), c => c.charCodeAt(0));

serve(async (req) => {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Expected paths:
    // /email-tracking/open/{trackingId} - for open tracking pixel
    // /email-tracking/click/{trackingId}?url=encodedUrl - for click tracking
    
    const action = pathParts[1]; // 'open' or 'click'
    const trackingId = pathParts[2];
    
    if (!trackingId) {
      return new Response("Missing tracking ID", { status: 400 });
    }

    // Get message log by tracking_id
    const { data: messageLog, error: fetchError } = await supabase
      .from("message_logs")
      .select("id, opens_count, clicks_count, first_opened_at")
      .eq("tracking_id", trackingId)
      .single();

    if (fetchError || !messageLog) {
      console.error("Message not found:", trackingId, fetchError);
      // Still return valid response to not break email display
      if (action === "open") {
        return new Response(TRACKING_PIXEL, {
          headers: { "Content-Type": "image/gif", "Cache-Control": "no-cache, no-store" },
        });
      }
      return new Response("Not found", { status: 404 });
    }

    const userAgent = req.headers.get("user-agent") || "";
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() || "unknown";

    if (action === "open") {
      // Record open event
      await supabase.from("email_tracking_events").insert({
        message_log_id: messageLog.id,
        event_type: "open",
        user_agent: userAgent,
        ip_address: ipAddress,
      });

      // Update message_logs counters
      await supabase
        .from("message_logs")
        .update({
          opens_count: (messageLog.opens_count || 0) + 1,
          first_opened_at: messageLog.first_opened_at || new Date().toISOString(),
          read_at: messageLog.first_opened_at || new Date().toISOString(),
        })
        .eq("id", messageLog.id);

      console.log("Open tracked:", trackingId);

      // Return tracking pixel
      return new Response(TRACKING_PIXEL, {
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
    }

    if (action === "click") {
      const redirectUrl = url.searchParams.get("url");
      
      if (!redirectUrl) {
        return new Response("Missing redirect URL", { status: 400 });
      }

      const decodedUrl = decodeURIComponent(redirectUrl);

      // Record click event
      await supabase.from("email_tracking_events").insert({
        message_log_id: messageLog.id,
        event_type: "click",
        url: decodedUrl,
        user_agent: userAgent,
        ip_address: ipAddress,
      });

      // Update message_logs click counter
      await supabase
        .from("message_logs")
        .update({
          clicks_count: (messageLog.clicks_count || 0) + 1,
        })
        .eq("id", messageLog.id);

      console.log("Click tracked:", trackingId, decodedUrl);

      // Redirect to original URL
      return new Response(null, {
        status: 302,
        headers: {
          Location: decodedUrl,
          "Cache-Control": "no-cache, no-store",
        },
      });
    }

    return new Response("Invalid action", { status: 400 });
  } catch (error) {
    console.error("Tracking error:", error);
    
    // For open requests, still return pixel to not break email
    if (url.pathname.includes("/open/")) {
      return new Response(TRACKING_PIXEL, {
        headers: { "Content-Type": "image/gif" },
      });
    }
    
    return new Response("Error", { status: 500 });
  }
});
