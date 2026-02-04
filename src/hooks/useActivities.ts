import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type ActivityType = "email_open" | "link_click" | "reply" | "view" | "call" | "meeting" | "note";

export interface Activity {
  id: string;
  user_id: string;
  lead_id: string | null;
  type: ActivityType;
  title: string;
  description: string | null;
  created_at: string;
}

export function useActivities() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["activities", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Activity[];
    },
    enabled: !!user,
  });
}
