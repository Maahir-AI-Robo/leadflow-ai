import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface FollowUp {
  id: string;
  user_id: string;
  lead_id: string | null;
  title: string;
  description: string | null;
  scheduled_at: string;
  reminder_at: string | null;
  status: "pending" | "completed" | "cancelled" | "overdue";
  priority: "low" | "normal" | "high" | "urgent";
  channel: "email" | "whatsapp" | "linkedin" | "call" | "meeting" | "other" | null;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  lead?: {
    id: string;
    name: string;
    company: string | null;
    avatar_url: string | null;
  };
}

interface CreateFollowUpParams {
  lead_id?: string;
  title: string;
  description?: string;
  scheduled_at: string;
  reminder_at?: string;
  priority?: FollowUp["priority"];
  channel?: FollowUp["channel"];
  notes?: string;
}

interface UpdateFollowUpParams {
  id: string;
  updates: Partial<Omit<FollowUp, "id" | "user_id" | "created_at" | "updated_at" | "lead">>;
}

export function useFollowUps(leadId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const followUps = useQuery({
    queryKey: ["follow-ups", leadId],
    queryFn: async () => {
      let query = supabase
        .from("follow_ups")
        .select(`
          *,
          lead:leads(id, name, company, avatar_url)
        `)
        .order("scheduled_at", { ascending: true });

      if (leadId) {
        query = query.eq("lead_id", leadId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as FollowUp[];
    },
    enabled: !!user,
  });

  const upcomingFollowUps = useQuery({
    queryKey: ["follow-ups", "upcoming"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("follow_ups")
        .select(`
          *,
          lead:leads(id, name, company, avatar_url)
        `)
        .in("status", ["pending", "overdue"])
        .gte("scheduled_at", now)
        .order("scheduled_at", { ascending: true })
        .limit(10);

      if (error) throw error;
      return data as FollowUp[];
    },
    enabled: !!user,
  });

  const overdueFollowUps = useQuery({
    queryKey: ["follow-ups", "overdue"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("follow_ups")
        .select(`
          *,
          lead:leads(id, name, company, avatar_url)
        `)
        .eq("status", "pending")
        .lt("scheduled_at", now)
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      return data as FollowUp[];
    },
    enabled: !!user,
  });

  const createFollowUp = useMutation({
    mutationFn: async (params: CreateFollowUpParams) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("follow_ups")
        .insert({
          user_id: user.id,
          ...params,
        })
        .select(`
          *,
          lead:leads(id, name, company, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data as FollowUp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
      toast.success("Follow-up scheduled");
    },
    onError: (error) => {
      toast.error("Failed to schedule follow-up", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  const updateFollowUp = useMutation({
    mutationFn: async ({ id, updates }: UpdateFollowUpParams) => {
      const { data, error } = await supabase
        .from("follow_ups")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          lead:leads(id, name, company, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data as FollowUp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
    },
  });

  const completeFollowUp = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("follow_ups")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
      toast.success("Follow-up completed");
    },
  });

  const deleteFollowUp = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("follow_ups")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
      toast.success("Follow-up deleted");
    },
  });

  return {
    followUps: followUps.data ?? [],
    upcomingFollowUps: upcomingFollowUps.data ?? [],
    overdueFollowUps: overdueFollowUps.data ?? [],
    isLoading: followUps.isLoading,
    createFollowUp: createFollowUp.mutateAsync,
    updateFollowUp: updateFollowUp.mutateAsync,
    completeFollowUp: completeFollowUp.mutateAsync,
    deleteFollowUp: deleteFollowUp.mutateAsync,
    isCreating: createFollowUp.isPending,
  };
}
