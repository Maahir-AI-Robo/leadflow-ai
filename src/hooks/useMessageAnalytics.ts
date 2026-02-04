import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface MessageAnalytics {
  // Overall stats
  totalMessages: number;
  totalDelivered: number;
  totalRead: number;
  totalResponded: number;
  totalFailed: number;
  
  // Rates
  deliveryRate: number;
  readRate: number;
  responseRate: number;
  failureRate: number;
  
  // By channel
  byChannel: {
    channel: string;
    total: number;
    delivered: number;
    read: number;
    responded: number;
    failed: number;
    deliveryRate: number;
    responseRate: number;
  }[];
  
  // By day (last 7 days)
  byDay: {
    date: string;
    sent: number;
    delivered: number;
    read: number;
    responded: number;
  }[];
  
  // Top performing leads
  topLeads: {
    leadId: string;
    leadName: string;
    company: string | null;
    messageCount: number;
    responseCount: number;
    responseRate: number;
  }[];
}

export function useMessageAnalytics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["message-analytics", user?.id],
    queryFn: async (): Promise<MessageAnalytics> => {
      if (!user) throw new Error("Not authenticated");

      // Fetch all message logs with lead info
      const { data: messages, error } = await supabase
        .from("message_logs")
        .select(`
          id,
          channel,
          status,
          sent_at,
          delivered_at,
          read_at,
          responded_at,
          lead_id,
          lead:leads(name, company)
        `)
        .order("sent_at", { ascending: false })
        .limit(500);

      if (error) throw error;

      const msgs = messages || [];
      
      // Calculate overall stats
      const totalMessages = msgs.length;
      const totalDelivered = msgs.filter(m => 
        m.status === "delivered" || m.status === "read" || m.status === "responded" || m.delivered_at
      ).length;
      const totalRead = msgs.filter(m => 
        m.status === "read" || m.status === "responded" || m.read_at
      ).length;
      const totalResponded = msgs.filter(m => 
        m.status === "responded" || m.responded_at
      ).length;
      const totalFailed = msgs.filter(m => 
        m.status === "failed" || m.status === "bounced"
      ).length;

      const deliveryRate = totalMessages > 0 ? (totalDelivered / totalMessages) * 100 : 0;
      const readRate = totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0;
      const responseRate = totalMessages > 0 ? (totalResponded / totalMessages) * 100 : 0;
      const failureRate = totalMessages > 0 ? (totalFailed / totalMessages) * 100 : 0;

      // Group by channel
      const channelMap = new Map<string, typeof msgs>();
      msgs.forEach(m => {
        const existing = channelMap.get(m.channel) || [];
        existing.push(m);
        channelMap.set(m.channel, existing);
      });

      const byChannel = Array.from(channelMap.entries()).map(([channel, channelMsgs]) => {
        const total = channelMsgs.length;
        const delivered = channelMsgs.filter(m => 
          m.status === "delivered" || m.status === "read" || m.status === "responded" || m.delivered_at
        ).length;
        const read = channelMsgs.filter(m => 
          m.status === "read" || m.status === "responded" || m.read_at
        ).length;
        const responded = channelMsgs.filter(m => 
          m.status === "responded" || m.responded_at
        ).length;
        const failed = channelMsgs.filter(m => 
          m.status === "failed" || m.status === "bounced"
        ).length;

        return {
          channel,
          total,
          delivered,
          read,
          responded,
          failed,
          deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
          responseRate: total > 0 ? (responded / total) * 100 : 0,
        };
      });

      // Group by day (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split("T")[0];
      });

      const byDay = last7Days.map(date => {
        const dayMsgs = msgs.filter(m => m.sent_at?.startsWith(date));
        return {
          date,
          sent: dayMsgs.length,
          delivered: dayMsgs.filter(m => m.delivered_at || m.status === "delivered" || m.status === "read" || m.status === "responded").length,
          read: dayMsgs.filter(m => m.read_at || m.status === "read" || m.status === "responded").length,
          responded: dayMsgs.filter(m => m.responded_at || m.status === "responded").length,
        };
      });

      // Top performing leads (by response rate)
      const leadMap = new Map<string, { name: string; company: string | null; messages: typeof msgs }>();
      msgs.forEach(m => {
        if (!m.lead_id || !m.lead) return;
        const existing = leadMap.get(m.lead_id) || { 
          name: (m.lead as { name: string }).name, 
          company: (m.lead as { company: string | null }).company, 
          messages: [] 
        };
        existing.messages.push(m);
        leadMap.set(m.lead_id, existing);
      });

      const topLeads = Array.from(leadMap.entries())
        .map(([leadId, data]) => {
          const messageCount = data.messages.length;
          const responseCount = data.messages.filter(m => m.responded_at || m.status === "responded").length;
          return {
            leadId,
            leadName: data.name,
            company: data.company,
            messageCount,
            responseCount,
            responseRate: messageCount > 0 ? (responseCount / messageCount) * 100 : 0,
          };
        })
        .filter(l => l.messageCount >= 2)
        .sort((a, b) => b.responseRate - a.responseRate)
        .slice(0, 5);

      return {
        totalMessages,
        totalDelivered,
        totalRead,
        totalResponded,
        totalFailed,
        deliveryRate,
        readRate,
        responseRate,
        failureRate,
        byChannel,
        byDay,
        topLeads,
      };
    },
    enabled: !!user,
  });
}
