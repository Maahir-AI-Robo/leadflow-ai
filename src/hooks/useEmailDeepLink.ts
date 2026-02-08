/**
 * Email Deep Link Hook
 * Opens user's default email client with pre-filled message
 * Uses mailto: links which work on mobile and desktop
 */

import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useQueryClient } from "@tanstack/react-query";

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  leadId?: string;
  leadName?: string;
}

export function useEmailDeepLink() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const openEmail = async ({ to, subject, body, leadId, leadName }: SendEmailParams) => {
    if (!to.trim()) {
      toast.error("Invalid email address");
      return false;
    }

    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const mailtoUrl = `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;

    // Log the message attempt
    if (user && leadId) {
      try {
        await supabase.from("message_logs").insert({
          user_id: user.id,
          lead_id: leadId,
          channel: "email",
          recipient: to,
          subject,
          body,
          status: "pending",
          external_id: `deeplink-${Date.now()}`,
        });
        queryClient.invalidateQueries({ queryKey: ["message-logs"] });
      } catch (err) {
        console.error("Failed to log message:", err);
      }
    }

    window.open(mailtoUrl, "_blank");

    toast.success("Opening email app", {
      description: leadName
        ? `Compose your email to ${leadName}`
        : "Compose your email in your email app",
    });

    return true;
  };

  return { openEmail };
}
