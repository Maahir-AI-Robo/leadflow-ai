import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { LeadCard, type Lead } from "@/components/leads/LeadCard";
import { LeadDetail } from "@/components/leads/LeadDetail";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "VP of Engineering",
    company: "TechCorp Industries",
    score: "hot",
    scoreValue: 95,
    lastActivity: "2 hours ago",
    aiSummary: "Highly engaged prospect. Opened 3 emails this week, clicked pricing link twice. Decision maker with budget authority.",
  },
  {
    id: "2",
    name: "Marcus Johnson",
    role: "Head of Product",
    company: "InnovateLabs",
    score: "hot",
    scoreValue: 88,
    lastActivity: "5 hours ago",
    aiSummary: "Strong buying signals. Scheduled a demo last week and requested follow-up materials.",
  },
  {
    id: "3",
    name: "Emily Davis",
    role: "Director of Operations",
    company: "GrowthBase Co",
    score: "warm",
    scoreValue: 72,
    lastActivity: "1 day ago",
    aiSummary: "Moderate engagement. Responded to initial outreach positively but hasn't scheduled a call yet.",
  },
  {
    id: "4",
    name: "Alex Rivera",
    role: "CTO",
    company: "StartupX",
    score: "warm",
    scoreValue: 65,
    lastActivity: "2 days ago",
    aiSummary: "Early-stage interest. Viewed company profile multiple times. Consider educational content approach.",
  },
  {
    id: "5",
    name: "Jordan Lee",
    role: "Product Manager",
    company: "Enterprise Solutions",
    score: "cold",
    scoreValue: 35,
    lastActivity: "5 days ago",
    aiSummary: "Low engagement currently. May need nurturing through content marketing before direct outreach.",
  },
];

const filters = ["All", "Hot", "Warm", "Cold", "Starred"];

export default function Leads() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = mockLeads.filter((lead) => {
    const matchesFilter =
      selectedFilter === "All" ||
      lead.score.toLowerCase() === selectedFilter.toLowerCase();
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSwipeLeft = (id: string) => {
    console.log("Skip lead:", id);
  };

  const handleSwipeRight = (id: string) => {
    console.log("Follow-up lead:", id);
  };

  return (
    <MobileLayout>
      <div className="px-4 pt-6 space-y-4 safe-top">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="font-display text-2xl font-bold">Leads</h1>
            <p className="text-sm text-muted-foreground">
              {filteredLeads.length} leads found
            </p>
          </div>
          <button className="p-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-glow-sm">
            <Plus className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-secondary border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm placeholder:text-muted-foreground"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-muted transition-colors">
            <Filter className="w-4 h-4 text-muted-foreground" />
          </button>
        </motion.div>

        {/* Filter Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide"
        >
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                selectedFilter === filter
                  ? "bg-primary text-primary-foreground shadow-glow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {filter}
            </button>
          ))}
        </motion.div>

        {/* Lead Cards */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredLeads.map((lead, index) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <LeadCard
                  lead={lead}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  onClick={(lead) => setSelectedLead(lead)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <LeadDetail
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
          />
        )}
      </AnimatePresence>
    </MobileLayout>
  );
}
