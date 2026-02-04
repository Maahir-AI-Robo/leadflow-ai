import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LeadBadge } from "@/components/ui/lead-badge";
import { useLeads, type Lead } from "@/hooks/useLeads";
import { Search, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CampaignDraft } from "@/hooks/useCampaignBuilder";

interface SelectLeadsStepProps {
  draft: CampaignDraft;
  updateDraft: (updates: Partial<CampaignDraft>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SelectLeadsStep({
  draft,
  updateDraft,
  onNext,
  onBack,
}: SelectLeadsStepProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "hot" | "warm" | "cold">("all");
  const { data: leads = [], isLoading } = useLeads();

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.company?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesFilter = filter === "all" || lead.score === filter;
    return matchesSearch && matchesFilter;
  });

  const isSelected = (leadId: string) =>
    draft.selectedLeads.some((l) => l.id === leadId);

  const toggleLead = (lead: Lead) => {
    if (isSelected(lead.id)) {
      updateDraft({
        selectedLeads: draft.selectedLeads.filter((l) => l.id !== lead.id),
      });
    } else {
      updateDraft({
        selectedLeads: [...draft.selectedLeads, lead],
      });
    }
  };

  const selectAll = () => {
    updateDraft({ selectedLeads: filteredLeads });
  };

  const deselectAll = () => {
    updateDraft({ selectedLeads: [] });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="pl-9 rounded-xl bg-secondary"
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "hot", "warm", "cold"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {f === "all" ? "All Leads" : f}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={selectAll}
          className="text-xs text-primary font-medium hover:underline"
        >
          Select All
        </button>
        <button
          onClick={deselectAll}
          className="text-xs text-muted-foreground font-medium hover:underline"
        >
          Clear
        </button>
      </div>

      {/* Selected Count */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20">
        <Users className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">
          {draft.selectedLeads.length} leads selected
        </span>
      </div>

      {/* Lead List */}
      <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No leads found</p>
            <p className="text-xs mt-1">Add some leads first to create a campaign</p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <div
              key={lead.id}
              onClick={() => toggleLead(lead)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                isSelected(lead.id)
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              <Checkbox
                checked={isSelected(lead.id)}
                onCheckedChange={() => toggleLead(lead)}
                className="pointer-events-none"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{lead.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {lead.role || "Unknown Role"} at {lead.company || "Unknown"}
                </p>
              </div>
              <LeadBadge score={lead.score as any} size="sm" />
            </div>
          ))
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 rounded-xl"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={draft.selectedLeads.length === 0}
          className="flex-1 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
