import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  leadId?: string;
  leadName?: string;
}

interface EmailResponse {
  success: boolean;
  demo?: boolean;
  message?: string;
  messageId?: string;
  recipient?: string;
  error?: string;
}

export function useEmail() {
  const sendEmail = useMutation({
    mutationFn: async (params: SendEmailParams): Promise<EmailResponse> => {
      const { data, error } = await supabase.functions.invoke("email-send", {
        body: params,
      });

      if (error) throw error;
      return data as EmailResponse;
    },
    onSuccess: (data) => {
      if (data.demo) {
        toast.info("Demo Mode", {
          description: "Resend API not configured. Email simulated.",
        });
      } else {
        toast.success("Email sent!", {
          description: `Email delivered to ${data.recipient}`,
        });
      }
    },
    onError: (error) => {
      toast.error("Failed to send email", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  return {
    sendEmail: sendEmail.mutateAsync,
    isSending: sendEmail.isPending,
  };
}
