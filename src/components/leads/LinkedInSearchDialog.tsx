import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLinkedInSearch, type LinkedInProfile } from "@/hooks/useLinkedInSearch";
import { useCreateLead } from "@/hooks/useLeads";
import { useScoreLead } from "@/hooks/useLeadAI";
import { useToast } from "@/hooks/use-toast";
import {
  Linkedin,
  Search,
  Loader2,
  MapPin,
  Building2,
  Briefcase,
  Check,
  AlertCircle,
  UserPlus,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LinkedInSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LinkedInSearchDialog({ open, onOpenChange }: LinkedInSearchDialogProps) {
  const [step, setStep] = useState<"search" | "results">("search");
  const [searchParams, setSearchParams] = useState({
    jobTitle: "",
    company: "",
    location: "",
    industry: "",
    keywords: "",
  });

  const {
    search,
    isSearching,
    results,
    selectedProfiles,
    toggleProfile,
    selectAll,
    clearSelection,
  } = useLinkedInSearch();

  const createLead = useCreateLead();
  const scoreLead = useScoreLead();
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });

  const handleSearch = async () => {
    try {
      await search({
        ...searchParams,
        limit: 25,
      });
      setStep("results");
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleImportSelected = async () => {
    if (!results?.profiles || selectedProfiles.size === 0) return;

    setIsImporting(true);
    const profilesToImport = results.profiles.filter((p) =>
      selectedProfiles.has(p.id)
    );

    setImportProgress({ current: 0, total: profilesToImport.length });

    let imported = 0;
    let failed = 0;
    let hotCount = 0;
    let warmCount = 0;
    let coldCount = 0;

    for (let i = 0; i < profilesToImport.length; i++) {
      const profile = profilesToImport[i];
      setImportProgress({ current: i + 1, total: profilesToImport.length });

      try {
        // AI Score the lead
        let score = 50;
        let category: "hot" | "warm" | "cold" = "warm";
        
        try {
          const aiScore = await scoreLead.mutateAsync({
            name: `${profile.firstName} ${profile.lastName}`,
            role: profile.title || null,
            company: profile.company || null,
            notes: `Industry: ${profile.industry || "N/A"}\nLocation: ${profile.location || "N/A"}\nHeadline: ${profile.headline}`,
          });
          score = aiScore.score;
          category = aiScore.category;
          
          if (category === "hot") hotCount++;
          else if (category === "warm") warmCount++;
          else coldCount++;
        } catch (scoreError) {
          console.log("AI scoring failed, using default:", scoreError);
          warmCount++;
        }

        await createLead.mutateAsync({
          name: `${profile.firstName} ${profile.lastName}`,
          role: profile.title || null,
          company: profile.company || null,
          email: null,
          phone: null,
          linkedin_url: profile.profileUrl,
          avatar_url: profile.profilePicture || null,
          score: category,
          score_value: score,
          ai_summary: null,
          last_activity: null,
          is_starred: category === "hot",
          source: "linkedin",
          notes: `Industry: ${profile.industry || "N/A"}\nLocation: ${profile.location || "N/A"}\nHeadline: ${profile.headline}`,
        });
        imported++;
      } catch {
        failed++;
      }
    }

    setIsImporting(false);
    setImportProgress({ current: 0, total: 0 });

    const scoreBreakdown = `🔥 ${hotCount} hot, 🌡️ ${warmCount} warm, ❄️ ${coldCount} cold`;

    toast({
      title: `Imported ${imported} leads with AI scoring`,
      description: failed > 0 
        ? `${failed} failed. ${scoreBreakdown}`
        : scoreBreakdown,
    });

    if (imported > 0) {
      clearSelection();
      setStep("search");
      setSearchParams({
        jobTitle: "",
        company: "",
        location: "",
        industry: "",
        keywords: "",
      });
      onOpenChange(false);
    }
  };

  const profiles = results?.profiles || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg mx-4 rounded-3xl bg-card border-border p-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0A66C2] flex items-center justify-center">
              <Linkedin className="w-5 h-5 text-white" />
            </div>
            LinkedIn Lead Finder
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "search" ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={searchParams.jobTitle}
                  onChange={(e) =>
                    setSearchParams((p) => ({ ...p, jobTitle: e.target.value }))
                  }
                  placeholder="e.g. CTO, VP Sales, HR Manager"
                  className="rounded-xl bg-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={searchParams.company}
                    onChange={(e) =>
                      setSearchParams((p) => ({ ...p, company: e.target.value }))
                    }
                    placeholder="Any company"
                    className="rounded-xl bg-secondary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={searchParams.location}
                    onChange={(e) =>
                      setSearchParams((p) => ({ ...p, location: e.target.value }))
                    }
                    placeholder="e.g. San Francisco"
                    className="rounded-xl bg-secondary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={searchParams.industry}
                  onChange={(e) =>
                    setSearchParams((p) => ({ ...p, industry: e.target.value }))
                  }
                  placeholder="e.g. SaaS, FinTech, Healthcare"
                  className="rounded-xl bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Additional Keywords</Label>
                <Input
                  id="keywords"
                  value={searchParams.keywords}
                  onChange={(e) =>
                    setSearchParams((p) => ({ ...p, keywords: e.target.value }))
                  }
                  placeholder="e.g. startup, Series A, hiring"
                  className="rounded-xl bg-secondary"
                />
              </div>

              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchParams.jobTitle}
                className="w-full h-12 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Find Leads
                  </>
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col"
            >
              {/* Results header */}
              <div className="px-6 py-3 border-b border-border flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {profiles.length} leads found
                  </p>
                  {results?.mockData && (
                    <p className="text-xs text-amber-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Demo data - add API credentials for real results
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => selectAll(profiles)}
                    className="text-xs text-primary hover:underline"
                  >
                    Select all
                  </button>
                  <span className="text-muted-foreground">|</span>
                  <button
                    onClick={clearSelection}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Profile list */}
              <ScrollArea className="h-[340px]">
                <div className="p-4 space-y-2">
                  {profiles.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      selected={selectedProfiles.has(profile.id)}
                      onToggle={() => toggleProfile(profile.id)}
                    />
                  ))}
                </div>
              </ScrollArea>

              {/* Actions */}
              <div className="p-4 border-t border-border space-y-3">
                {isImporting && importProgress.total > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                        AI scoring lead {importProgress.current} of {importProgress.total}
                      </span>
                      <span className="text-muted-foreground">
                        {Math.round((importProgress.current / importProgress.total) * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-cyan-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("search")}
                    disabled={isImporting}
                    className="flex-1 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleImportSelected}
                    disabled={selectedProfiles.size === 0 || isImporting}
                    className="flex-1 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Scoring...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Import & Score {selectedProfiles.size > 0 ? `(${selectedProfiles.size})` : ""}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function ProfileCard({
  profile,
  selected,
  onToggle,
}: {
  profile: LinkedInProfile;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full p-3 rounded-2xl border text-left transition-all",
        selected
          ? "bg-primary/10 border-primary/30"
          : "bg-secondary/50 border-border hover:border-primary/20"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-400/20 flex items-center justify-center text-lg font-semibold">
            {profile.firstName[0]}
            {profile.lastName[0]}
          </div>
          {selected && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">
            {profile.firstName} {profile.lastName}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {profile.headline}
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            {profile.company && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {profile.company}
              </span>
            )}
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {profile.location}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
