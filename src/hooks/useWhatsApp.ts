import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

interface SendWhatsAppParams {
  to: string;
  message: string;
  leadId?: string;
  leadName?: string;
}

interface WhatsAppResponse {
  success: boolean;
  demo?: boolean;
  message?: string;
  messageId?: string;
  recipient?: string;
  preview?: string;
  error?: string;
}

export function useWhatsApp() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const sendMessage = useMutation({
    mutationFn: async (params: SendWhatsAppParams): Promise<WhatsAppResponse> => {
      const { data, error } = await supabase.functions.invoke("whatsapp-send", {
        body: params,
      });

      if (error) throw error;

      // Log the message
      if (user && params.leadId) {
        await supabase.from("message_logs").insert({
          user_id: user.id,
          lead_id: params.leadId,
          channel: "whatsapp",
          recipient: params.to,
          body: params.message,
          status: data.success ? "sent" : "failed",
          external_id: data.messageId,
          error_message: data.error,
        });
        queryClient.invalidateQueries({ queryKey: ["message-logs"] });
      }

      return data as WhatsAppResponse;
    },
    onSuccess: (data) => {
      if (data.demo) {
        toast.info("Demo Mode", {
          description: "WhatsApp credentials not configured. Message simulated.",
        });
      } else {
        toast.success("Message sent!", {
          description: `WhatsApp message delivered to ${data.recipient}`,
        });
      }
    },
    onError: (error) => {
      toast.error("Failed to send", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  return {
    sendMessage: sendMessage.mutateAsync,
    isSending: sendMessage.isPending,
  };
}
