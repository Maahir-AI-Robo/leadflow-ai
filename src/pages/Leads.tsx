import { useState, useCallback } from "react"; 
import { MobileLayout } from "@/components/layout/MobileLayout";
import { LeadCard } from "@/components/leads/LeadCard";
import { LeadDetail } from "@/components/leads/LeadDetail";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Plus, UserPlus, MessageCircle, Mail, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeads, useToggleStarLead, type Lead } from "@/hooks/useLeads";
import { Skeleton } from "@/components/ui/skeleton";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";
import { AILeadFinderDialog } from "@/components/leads/AILeadFinderDialog";
import { BulkWhatsAppDialog } from "@/components/leads/BulkWhatsAppDialog";
import { BulkEmailDialog } from "@/components/leads/BulkEmailDialog";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
const filters = ["All", "Hot", "Warm", "Cold", "Starred"];

export default function Leads() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAIFinderDialog, setShowAIFinderDialog] = useState(false);
  const [showBulkWhatsApp, setShowBulkWhatsApp] = useState(false);
  const [showBulkEmail, setShowBulkEmail] = useState(false);

  const { data: leads = [], isLoading } = useLeads();
  const toggleStar = useToggleStarLead();
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["leads"] });
    toast.success("Leads refreshed");
  }, [queryClient]);
  const filteredLeads = leads.filter((lead) => {
    const matchesFilter =
      selectedFilter === "All" ||
      (selectedFilter === "Starred" && lead.is_starred) ||
      lead.score.toLowerCase() === selectedFilter.toLowerCase();
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.company?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSwipeLeft = (id: string) => {
    console.log("Skip lead:", id);
  };

  const handleSwipeRight = (id: string) => {
    console.log("Follow-up lead:", id);
  };

  const handleToggleStar = (id: string) => {
    const lead = leads.find((l) => l.id === id);
    if (lead) {
      toggleStar.mutate({ id, isStarred: !lead.is_starred });
    }
  };

  // Convert database Lead to LeadCard format
  const mapToCardLead = (lead: Lead) => ({
    id: lead.id,
    name: lead.name,
    role: lead.role || "",
    company: lead.company || "",
    avatar: lead.avatar_url || undefined,
    score: lead.score,
    scoreValue: lead.score_value,
    lastActivity: lead.last_activity || undefined,
    aiSummary: lead.ai_summary || undefined,
  });

  return (
    <MobileLayout>
      <PullToRefresh onRefresh={handleRefresh} className="min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 lg:pl-80 pt-6 space-y-5 safe-top">
        {/* Header - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="space-y-1">
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Leads</h1>
            <p className="text-sm text-muted-foreground">
              {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'} found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setShowBulkEmail(true)}
              className="p-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity press-effect shadow-glow-sm"
              title="Bulk Email"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mail className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => setShowBulkWhatsApp(true)}
              className="p-3 rounded-xl bg-success text-success-foreground hover:opacity-90 transition-colors press-effect"
              title="Bulk WhatsApp"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => setShowAIFinderDialog(true)}
              className="p-3 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-white hover:opacity-90 transition-opacity press-effect shadow-glow-sm"
              title="AI Lead Finder"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Brain className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => setShowAddDialog(true)}
              className="p-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-opacity press-effect border border-border/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Search - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative max-w-xl"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-secondary/80 border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm placeholder:text-muted-foreground backdrop-blur-sm"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-muted/50 transition-colors">
            <Filter className="w-4 h-4 text-muted-foreground" />
          </button>
        </motion.div>

        {/* Filter Pills - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide"
        >
          {filters.map((filter, index) => (
            <motion.button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className={cn(
                "px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all press-effect",
                selectedFilter === filter
                  ? "bg-primary text-primary-foreground shadow-glow-sm"
                  : "bg-secondary/80 text-muted-foreground hover:text-foreground border border-border/50"
              )}
            >
              {filter}
            </motion.button>
          ))}
        </motion.div>

        {/* Lead Cards - Grid on larger screens */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 rounded-3xl" />
            ))}
          </div>
        ) : filteredLeads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 max-w-md mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No leads yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first lead to get started
            </p>
            <button
              onClick={() => setShowAddDialog(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground font-medium shadow-glow-sm"
            >
              Add Lead
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {filteredLeads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <LeadCard
                    lead={mapToCardLead(lead)}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    onStar={handleToggleStar}
                    onClick={() => setSelectedLead(lead)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        </div>
      </PullToRefresh>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <LeadDetail
            lead={mapToCardLead(selectedLead)}
            onClose={() => setSelectedLead(null)}
          />
        )}
      </AnimatePresence>

      {/* Add Lead Dialog */}
      <AddLeadDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      
      {/* AI Lead Finder Dialog */}
      <AILeadFinderDialog open={showAIFinderDialog} onOpenChange={setShowAIFinderDialog} />
      
      {/* Bulk WhatsApp Dialog */}
      <BulkWhatsAppDialog 
        open={showBulkWhatsApp} 
        onOpenChange={setShowBulkWhatsApp}
        filterType="all"
      />
      
      {/* Bulk Email Dialog */}
      <BulkEmailDialog 
        open={showBulkEmail} 
        onOpenChange={setShowBulkEmail}
        filterType="all"
      />
    </MobileLayout>
  );
}
