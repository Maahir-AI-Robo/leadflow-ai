import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  tags: string[];
  is_favorite: boolean;
  use_count: number;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export type CreateEmailTemplate = Omit<EmailTemplate, "id" | "user_id" | "created_at" | "updated_at" | "use_count">;

export function useEmailTemplates(category?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["email-templates", category],
    queryFn: async (): Promise<EmailTemplate[]> => {
      let query = supabase
        .from("email_templates")
        .select("*")
        .order("is_favorite", { ascending: false })
        .order("use_count", { ascending: false })
        .order("updated_at", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EmailTemplate[];
    },
    enabled: !!user,
  });
}

export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (template: CreateEmailTemplate) => {
      if (!user) throw new Error("User not authenticated");

      // Extract variables from body (e.g., {{name}}, {{company}})
      const variableRegex = /\{\{(\w+)\}\}/g;
      const foundVariables: string[] = [];
      let match;
      while ((match = variableRegex.exec(template.body)) !== null) {
        if (!foundVariables.includes(match[0])) {
          foundVariables.push(match[0]);
        }
      }
      // Also check subject
      while ((match = variableRegex.exec(template.subject)) !== null) {
        if (!foundVariables.includes(match[0])) {
          foundVariables.push(match[0]);
        }
      }

      const { data, error } = await supabase
        .from("email_templates")
        .insert({
          ...template,
          user_id: user.id,
          variables: foundVariables,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Template created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EmailTemplate> }) => {
      // Re-extract variables if body or subject changed
      let variables = updates.variables;
      if (updates.body || updates.subject) {
        const variableRegex = /\{\{(\w+)\}\}/g;
        const foundVariables: string[] = [];
        let match;
        const textToSearch = (updates.body || "") + (updates.subject || "");
        while ((match = variableRegex.exec(textToSearch)) !== null) {
          if (!foundVariables.includes(match[0])) {
            foundVariables.push(match[0]);
          }
        }
        variables = foundVariables;
      }

      const { data, error } = await supabase
        .from("email_templates")
        .update({ ...updates, variables })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Template updated");
    },
    onError: (error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });
}

export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("email_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Template deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });
}

export function useIncrementTemplateUseCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: current } = await supabase
        .from("email_templates")
        .select("use_count")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("email_templates")
        .update({ use_count: (current?.use_count || 0) + 1 })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
  });
}

export function useToggleTemplateFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { error } = await supabase
        .from("email_templates")
        .update({ is_favorite: isFavorite })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
  });
}

// Helper to apply template variables
export function applyTemplateVariables(
  template: { subject: string; body: string },
  variables: Record<string, string>
): { subject: string; body: string } {
  let subject = template.subject;
  let body = template.body;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    subject = subject.replace(regex, value);
    body = body.replace(regex, value);
  });

  return { subject, body };
}
