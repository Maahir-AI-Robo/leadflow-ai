 import { useState } from "react";
 import { useMutation } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 
 export interface AISearchParams {
   jobTitle?: string;
   industry?: string;
   location?: string;
   companySize?: string;
   keywords?: string;
   count?: number;
 }
 
 export interface AIGeneratedLead {
   id: string;
   firstName: string;
   lastName: string;
   email: string;
   phone: string;
   role: string;
   company: string;
   industry: string;
   location: string;
   headline: string;
   companySize: string;
   score: number;
   scoreCategory: "hot" | "warm" | "cold";
   reasoning: string;
   source: string;
 }
 
 export interface AILeadFinderResult {
   leads: AIGeneratedLead[];
   total: number;
   searchParams: AISearchParams;
 }
 
 export function useAILeadFinder() {
   const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
 
   const searchMutation = useMutation({
     mutationFn: async (params: AISearchParams): Promise<AILeadFinderResult> => {
       const { data: { session } } = await supabase.auth.getSession();
       if (!session) throw new Error("Not authenticated");
 
       const response = await fetch(
         `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-lead-finder`,
         {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
             Authorization: `Bearer ${session.access_token}`,
           },
           body: JSON.stringify(params),
         }
       );
 
       if (!response.ok) {
         const error = await response.json();
         throw new Error(error.error || "Failed to find leads");
       }
 
       return response.json();
     },
   });
 
   const toggleLead = (leadId: string) => {
     setSelectedLeads((prev) => {
       const next = new Set(prev);
       if (next.has(leadId)) {
         next.delete(leadId);
       } else {
         next.add(leadId);
       }
       return next;
     });
   };
 
   const selectAll = (leads: AIGeneratedLead[]) => {
     setSelectedLeads(new Set(leads.map((l) => l.id)));
   };
 
   const clearSelection = () => {
     setSelectedLeads(new Set());
   };
 
   return {
     search: searchMutation.mutateAsync,
     isSearching: searchMutation.isPending,
     results: searchMutation.data,
     error: searchMutation.error,
     selectedLeads,
     toggleLead,
     selectAll,
     clearSelection,
   };
 }