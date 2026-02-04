import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface TrackingEvent {
  id: string;
  message_log_id: string;
  event_type: "open" | "click";
  url: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
}

interface MessageWithTracking {
  id: string;
  recipient: string;
  subject: string | null;
  status: string;
  sent_at: string;
  opens_count: number;
  clicks_count: number;
  first_opened_at: string | null;
  tracking_id: string | null;
}

interface CampaignTrackingStats {
  totalSent: number;
  totalOpens: number;
  totalClicks: number;
  uniqueOpens: number;
  uniqueClicks: number;
  openRate: number;
  clickRate: number;
  clickToOpenRate: number;
}

export function useMessageTrackingEvents(messageLogId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["email-tracking-events", messageLogId],
    queryFn: async (): Promise<TrackingEvent[]> => {
      if (!messageLogId) return [];

      const { data, error } = await supabase
        .from("email_tracking_events")
        .select("*")
        .eq("message_log_id", messageLogId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TrackingEvent[];
    },
    enabled: !!user && !!messageLogId,
  });
}

export function useMessagesWithTracking(campaignId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["messages-with-tracking", campaignId],
    queryFn: async (): Promise<MessageWithTracking[]> => {
      let query = supabase
        .from("message_logs")
        .select("id, recipient, subject, status, sent_at, opens_count, clicks_count, first_opened_at, tracking_id")
        .eq("channel", "email")
        .order("sent_at", { ascending: false });

      if (campaignId) {
        query = query.eq("campaign_id", campaignId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as MessageWithTracking[];
    },
    enabled: !!user,
  });
}

export function useCampaignTrackingStats(campaignId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["campaign-tracking-stats", campaignId],
    queryFn: async (): Promise<CampaignTrackingStats> => {
      if (!campaignId) {
        return {
          totalSent: 0,
          totalOpens: 0,
          totalClicks: 0,
          uniqueOpens: 0,
          uniqueClicks: 0,
          openRate: 0,
          clickRate: 0,
          clickToOpenRate: 0,
        };
      }

      const { data: messages, error } = await supabase
        .from("message_logs")
        .select("id, opens_count, clicks_count, first_opened_at, status")
        .eq("campaign_id", campaignId)
        .eq("channel", "email");

      if (error) throw error;

      const sentMessages = (messages || []).filter((m) => m.status === "sent" || m.status === "delivered");
      const totalSent = sentMessages.length;
      const totalOpens = sentMessages.reduce((sum, m) => sum + (m.opens_count || 0), 0);
      const totalClicks = sentMessages.reduce((sum, m) => sum + (m.clicks_count || 0), 0);
      const uniqueOpens = sentMessages.filter((m) => m.first_opened_at).length;
      const uniqueClicks = sentMessages.filter((m) => (m.clicks_count || 0) > 0).length;

      return {
        totalSent,
        totalOpens,
        totalClicks,
        uniqueOpens,
        uniqueClicks,
        openRate: totalSent > 0 ? (uniqueOpens / totalSent) * 100 : 0,
        clickRate: totalSent > 0 ? (uniqueClicks / totalSent) * 100 : 0,
        clickToOpenRate: uniqueOpens > 0 ? (uniqueClicks / uniqueOpens) * 100 : 0,
      };
    },
    enabled: !!user && !!campaignId,
  });
}
