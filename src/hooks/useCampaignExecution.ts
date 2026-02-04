import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Lead } from "./useLeads";

interface SendBulkParams {
  leads: Lead[];
  messageTemplate: string;
  channel: "whatsapp" | "email";
  subjectTemplate?: string;
}

interface SendResult {
  leadId: string;
  leadName: string;
  success: boolean;
  demo?: boolean;
  error?: string;
}

export function useCampaignExecution() {
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<SendResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const personalizeText = (template: string, lead: Lead) => {
    return template
      .replace(/\{\{name\}\}/g, lead.name.split(" ")[0])
      .replace(/\{\{company\}\}/g, lead.company || "your company")
      .replace(/\{\{role\}\}/g, lead.role || "");
  };

  const executeCampaign = useMutation({
    mutationFn: async ({ leads, messageTemplate, channel, subjectTemplate }: SendBulkParams) => {
      setIsExecuting(true);
      setProgress(0);
      setResults([]);

      const newResults: SendResult[] = [];
      const eligibleLeads = leads.filter((lead) => {
        if (channel === "whatsapp") return lead.phone && lead.phone.trim() !== "";
        if (channel === "email") return lead.email && lead.email.trim() !== "";
        return false;
      });

      if (eligibleLeads.length === 0) {
        throw new Error(`No leads with ${channel === "whatsapp" ? "phone numbers" : "email addresses"} found`);
      }

      for (let i = 0; i < eligibleLeads.length; i++) {
        const lead = eligibleLeads[i];
        const personalizedMessage = personalizeText(messageTemplate, lead);

        try {
          if (channel === "whatsapp") {
            const { data, error } = await supabase.functions.invoke("whatsapp-send", {
              body: {
                to: lead.phone!,
                message: personalizedMessage,
                leadId: lead.id,
                leadName: lead.name,
              },
            });

            if (error) throw error;

            newResults.push({
              leadId: lead.id,
              leadName: lead.name,
              success: data.success,
              demo: data.demo,
            });
          } else if (channel === "email") {
            const personalizedSubject = subjectTemplate 
              ? personalizeText(subjectTemplate, lead) 
              : `Message for ${lead.name.split(" ")[0]}`;

            const { data, error } = await supabase.functions.invoke("email-send", {
              body: {
                to: lead.email!,
                subject: personalizedSubject,
                body: personalizedMessage,
                leadId: lead.id,
                leadName: lead.name,
              },
            });

            if (error) throw error;

            newResults.push({
              leadId: lead.id,
              leadName: lead.name,
              success: data.success,
              demo: data.demo,
            });
          }
        } catch (error) {
          newResults.push({
            leadId: lead.id,
            leadName: lead.name,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }

        setProgress(((i + 1) / eligibleLeads.length) * 100);
        setResults([...newResults]);

        // Rate limiting delay
        if (i < eligibleLeads.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }

      setIsExecuting(false);

      const successCount = newResults.filter((r) => r.success).length;
      const demoCount = newResults.filter((r) => r.demo).length;

      if (demoCount > 0) {
        toast.info(`Demo mode: ${successCount} messages simulated`, {
          description: `Configure ${channel === "whatsapp" ? "WhatsApp" : "Resend"} credentials for real delivery`,
        });
      } else if (successCount > 0) {
        toast.success(`${successCount}/${eligibleLeads.length} messages sent successfully`);
      }

      return {
        total: eligibleLeads.length,
        success: successCount,
        failed: eligibleLeads.length - successCount,
        demo: demoCount > 0,
      };
    },
  });

  return {
    executeCampaign,
    progress,
    results,
    isExecuting,
    reset: () => {
      setProgress(0);
      setResults([]);
      setIsExecuting(false);
    },
  };
}
