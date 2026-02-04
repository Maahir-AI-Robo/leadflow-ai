import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface MessageLog {
  id: string;
  user_id: string;
  lead_id: string | null;
  campaign_id: string | null;
  channel: "whatsapp" | "email" | "linkedin";
  recipient: string;
  subject: string | null;
  body: string;
  status: "pending" | "sent" | "delivered" | "read" | "failed" | "responded";
  external_id: string | null;
  error_message: string | null;
  sent_at: string;
  delivered_at: string | null;
  read_at: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  lead?: {
    name: string;
    company: string | null;
    avatar_url: string | null;
  };
  campaign?: {
    name: string;
  };
}

interface CreateMessageLogParams {
  lead_id?: string;
  campaign_id?: string;
  channel: "whatsapp" | "email" | "linkedin";
  recipient: string;
  subject?: string;
  body: string;
  status?: "pending" | "sent" | "delivered" | "read" | "failed" | "responded";
  external_id?: string;
  error_message?: string;
}

export function useMessageLogs(leadId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const messageLogs = useQuery({
    queryKey: ["message-logs", leadId],
    queryFn: async () => {
      let query = supabase
        .from("message_logs")
        .select(`
          *,
          lead:leads(name, company, avatar_url),
          campaign:campaigns(name)
        `)
        .order("sent_at", { ascending: false });

      if (leadId) {
        query = query.eq("lead_id", leadId);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      return data as MessageLog[];
    },
    enabled: !!user,
  });

  const createLog = useMutation({
    mutationFn: async (params: CreateMessageLogParams) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("message_logs")
        .insert({
          user_id: user.id,
          ...params,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-logs"] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      delivered_at,
      read_at,
      responded_at,
    }: {
      id: string;
      status: MessageLog["status"];
      delivered_at?: string;
      read_at?: string;
      responded_at?: string;
    }) => {
      const { data, error } = await supabase
        .from("message_logs")
        .update({
          status,
          delivered_at,
          read_at,
          responded_at,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-logs"] });
    },
  });

  return {
    messageLogs: messageLogs.data ?? [],
    isLoading: messageLogs.isLoading,
    createLog: createLog.mutateAsync,
    updateStatus: updateStatus.mutateAsync,
    refetch: messageLogs.refetch,
  };
}
