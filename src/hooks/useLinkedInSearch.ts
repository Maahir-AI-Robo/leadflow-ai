import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface LinkedInSearchParams {
  keywords?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  industry?: string;
  limit?: number;
}

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  profileUrl: string;
  profilePicture?: string;
  location?: string;
  company?: string;
  title?: string;
  industry?: string;
  connectionDegree?: number;
}

export interface LinkedInSearchResult {
  profiles: LinkedInProfile[];
  total: number;
  hasMore: boolean;
  mockData?: boolean;
  error?: string;
  message?: string;
}

export function useLinkedInSearch() {
  const { user } = useAuth();
  const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set());

  const searchMutation = useMutation({
    mutationFn: async (params: LinkedInSearchParams): Promise<LinkedInSearchResult> => {
      const { data, error } = await supabase.functions.invoke("linkedin-search", {
        body: params,
      });

      if (error) throw error;
      return data as LinkedInSearchResult;
    },
  });

  const toggleProfile = (profileId: string) => {
    setSelectedProfiles((prev) => {
      const next = new Set(prev);
      if (next.has(profileId)) {
        next.delete(profileId);
      } else {
        next.add(profileId);
      }
      return next;
    });
  };

  const selectAll = (profiles: LinkedInProfile[]) => {
    setSelectedProfiles(new Set(profiles.map((p) => p.id)));
  };

  const clearSelection = () => {
    setSelectedProfiles(new Set());
  };

  return {
    search: searchMutation.mutateAsync,
    isSearching: searchMutation.isPending,
    results: searchMutation.data,
    error: searchMutation.error,
    selectedProfiles,
    toggleProfile,
    selectAll,
    clearSelection,
  };
}
