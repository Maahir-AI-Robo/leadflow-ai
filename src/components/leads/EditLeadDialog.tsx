import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateLead, type Lead, type LeadScore } from "@/hooks/useLeads";
import { useGenerateLeadSummary, useScoreLead } from "@/hooks/useLeadAI";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, Wand2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditLeadDialogProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

export function EditLeadDialog({ lead, open, onOpenChange, onUpdated }: EditLeadDialogProps) {
  const [name, setName] = useState(lead.name);
  const [email, setEmail] = useState(lead.email || "");
  const [company, setCompany] = useState(lead.company || "");
  const [role, setRole] = useState(lead.role || "");
  const [phone, setPhone] = useState(lead.phone || "");
  const [linkedinUrl, setLinkedinUrl] = useState(lead.linkedin_url || "");
  const [score, setScore] = useState<LeadScore>(lead.score);
  const [scoreValue, setScoreValue] = useState(lead.score_value);
  const [notes, setNotes] = useState(lead.notes || "");
  const [aiSummary, setAiSummary] = useState(lead.ai_summary || "");

  const updateLead = useUpdateLead();
  const generateSummary = useGenerateLeadSummary();
  const scoreLead = useScoreLead();
  const { toast } = useToast();

  // Reset form when lead changes
  useEffect(() => {
    setName(lead.name);
    setEmail(lead.email || "");
    setCompany(lead.company || "");
    setRole(lead.role || "");
    setPhone(lead.phone || "");
    setLinkedinUrl(lead.linkedin_url || "");
    setScore(lead.score);
    setScoreValue(lead.score_value);
    setNotes(lead.notes || "");
    setAiSummary(lead.ai_summary || "");
  }, [lead]);

  const handleAIScore = async () => {
    if (!name) return;

    try {
      const result = await scoreLead.mutateAsync({
        name,
        role: role || null,
        company: company || null,
        notes: notes || null,
      });

      setScore(result.category);
      setScoreValue(result.score);

      toast({
        title: "AI Scored",
        description: result.reasoning,
      });
    } catch (error: any) {
      toast({
        title: "Scoring failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRegenerateSummary = async () => {
    if (!name) return;

    try {
      const summary = await generateSummary.mutateAsync({
        name,
        role: role || null,
        company: company || null,
        email: email || null,
        notes: notes || null,
        score,
        score_value: scoreValue,
      });

      setAiSummary(summary);

      toast({
        title: "Summary regenerated",
        description: "AI has created a new summary based on the updated information.",
      });
    } catch (error: any) {
      toast({
        title: "Summary generation failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateLead.mutateAsync({
        id: lead.id,
        updates: {
          name,
          email: email || null,
          company: company || null,
          role: role || null,
          phone: phone || null,
          linkedin_url: linkedinUrl || null,
          score,
          score_value: scoreValue,
          notes: notes || null,
          ai_summary: aiSummary || null,
        },
      });

      toast({
        title: "Lead updated",
        description: `${name} has been updated.`,
      });

      onUpdated?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const scoreOptions: { value: LeadScore; label: string; color: string }[] = [
    { value: "hot", label: "Hot", color: "from-red-500 to-orange-500" },
    { value: "warm", label: "Warm", color: "from-amber-500 to-yellow-400" },
    { value: "cold", label: "Cold", color: "from-blue-500 to-cyan-400" },
  ];

  const isLoading = updateLead.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4 rounded-3xl bg-card border-border p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Edit Lead
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editName">Name *</Label>
            <Input
              id="editName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="rounded-xl bg-secondary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@company.com"
                className="rounded-xl bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPhone">Phone</Label>
              <Input
                id="editPhone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 890"
                className="rounded-xl bg-secondary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="editCompany">Company</Label>
              <Input
                id="editCompany"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Inc"
                className="rounded-xl bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editRole">Role</Label>
              <Input
                id="editRole"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="VP of Sales"
                className="rounded-xl bg-secondary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editLinkedin">LinkedIn URL</Label>
            <Input
              id="editLinkedin"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/johndoe"
              className="rounded-xl bg-secondary"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Lead Score</Label>
              <button
                type="button"
                onClick={handleAIScore}
                disabled={!name || scoreLead.isPending}
                className="text-xs text-primary font-medium flex items-center gap-1 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {scoreLead.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Wand2 className="w-3 h-3" />
                )}
                AI Score
              </button>
            </div>
            <div className="flex gap-2">
              {scoreOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setScore(option.value);
                    setScoreValue(
                      option.value === "hot" ? 85 : option.value === "warm" ? 60 : 35
                    );
                  }}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all",
                    score === option.value
                      ? `bg-gradient-to-r ${option.color} text-foreground shadow-lg`
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Score:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={scoreValue}
                onChange={(e) => setScoreValue(parseInt(e.target.value))}
                className="flex-1 h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
              />
              <span className="text-xs font-medium w-8">{scoreValue}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editNotes">Notes</Label>
            <Textarea
              id="editNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this lead..."
              className="rounded-xl bg-secondary min-h-[80px] resize-none"
            />
          </div>

          {/* AI Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="editAiSummary">AI Summary</Label>
              <button
                type="button"
                onClick={handleRegenerateSummary}
                disabled={!name || generateSummary.isPending}
                className="text-xs text-primary font-medium flex items-center gap-1 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generateSummary.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                Regenerate
              </button>
            </div>
            <Textarea
              id="editAiSummary"
              value={aiSummary}
              onChange={(e) => setAiSummary(e.target.value)}
              placeholder="AI-generated summary will appear here..."
              className="rounded-xl bg-secondary min-h-[100px] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name}
              className="flex-1 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground shadow-glow-sm"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
