import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface DashboardStats {
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  activeCampaigns: number;
  unreadNotifications: number;
}

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) {
        return {
          totalLeads: 0,
          hotLeads: 0,
          warmLeads: 0,
          coldLeads: 0,
          activeCampaigns: 0,
          unreadNotifications: 0,
        };
      }

      // Fetch all stats in parallel
      const [leadsResult, campaignsResult, notificationsResult] = await Promise.all([
        supabase.from("leads").select("score"),
        supabase.from("campaigns").select("status"),
        supabase.from("notifications").select("is_read").eq("is_read", false),
      ]);

      const leads = leadsResult.data || [];
      const campaigns = campaignsResult.data || [];
      const notifications = notificationsResult.data || [];

      return {
        totalLeads: leads.length,
        hotLeads: leads.filter((l) => l.score === "hot").length,
        warmLeads: leads.filter((l) => l.score === "warm").length,
        coldLeads: leads.filter((l) => l.score === "cold").length,
        activeCampaigns: campaigns.filter((c) => c.status === "active").length,
        unreadNotifications: notifications.length,
      };
    },
    enabled: !!user,
  });
}
