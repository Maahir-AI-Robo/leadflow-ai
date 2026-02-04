import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const sendMessage = useMutation({
    mutationFn: async (params: SendWhatsAppParams): Promise<WhatsAppResponse> => {
      const { data, error } = await supabase.functions.invoke("whatsapp-send", {
        body: params,
      });

      if (error) throw error;
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
