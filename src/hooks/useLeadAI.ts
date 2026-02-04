import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LeadData {
  name: string;
  role?: string | null;
  company?: string | null;
  email?: string | null;
  notes?: string | null;
  score?: string;
  score_value?: number;
}

interface AIResponse {
  content?: string;
  score?: number;
  category?: "hot" | "warm" | "cold";
  reasoning?: string;
  error?: string;
}

export function useGenerateLeadSummary() {
  return useMutation({
    mutationFn: async (lead: LeadData): Promise<string> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lead-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ type: "generate_summary", lead }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate summary");
      }

      const data: AIResponse = await response.json();
      return data.content || "";
    },
  });
}

export function useScoreLead() {
  return useMutation({
    mutationFn: async (lead: LeadData): Promise<{ score: number; category: "hot" | "warm" | "cold"; reasoning: string }> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lead-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ type: "score_lead", lead }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to score lead");
      }

      const data: AIResponse = await response.json();
      
      return {
        score: data.score || 50,
        category: data.category || "warm",
        reasoning: data.reasoning || "",
      };
    },
  });
}

export function useSuggestOutreach() {
  return useMutation({
    mutationFn: async (lead: LeadData): Promise<string> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lead-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ type: "suggest_outreach", lead }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate outreach message");
      }

      const data: AIResponse = await response.json();
      return data.content || "";
    },
  });
}
