import { useState } from "react";
import { motion } from "framer-motion";
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
import { useCreateLead, type LeadScore } from "@/hooks/useLeads";
import { useGenerateLeadSummary, useScoreLead } from "@/hooks/useLeadAI";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLeadDialog({ open, onOpenChange }: AddLeadDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [score, setScore] = useState<LeadScore>("warm");
  const [scoreValue, setScoreValue] = useState(60);
  const [notes, setNotes] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [useAI, setUseAI] = useState(true);

  const createLead = useCreateLead();
  const generateSummary = useGenerateLeadSummary();
  const scoreLead = useScoreLead();
  const { toast } = useToast();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let summary = aiSummary;

      // Generate AI summary if enabled and not already generated
      if (useAI && !summary) {
        try {
          summary = await generateSummary.mutateAsync({
            name,
            role: role || null,
            company: company || null,
            email: email || null,
            notes: notes || null,
            score,
            score_value: scoreValue,
          });
        } catch {
          // Continue without summary if AI fails
          console.log("AI summary generation failed, continuing without");
        }
      }

      await createLead.mutateAsync({
        name,
        email: email || null,
        company: company || null,
        role: role || null,
        phone: phone || null,
        score,
        score_value: scoreValue,
        notes: notes || null,
        linkedin_url: null,
        avatar_url: null,
        ai_summary: summary || null,
        last_activity: null,
        is_starred: false,
        source: "manual",
      });

      toast({
        title: "Lead created",
        description: `${name} has been added with AI insights.`,
      });

      // Reset form
      setName("");
      setEmail("");
      setCompany("");
      setRole("");
      setPhone("");
      setScore("warm");
      setScoreValue(60);
      setNotes("");
      setAiSummary("");
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

  const isLoading = createLead.isPending || generateSummary.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4 rounded-3xl bg-card border-border p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Add New Lead
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="rounded-xl bg-secondary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@company.com"
                className="rounded-xl bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 890"
                className="rounded-xl bg-secondary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Inc"
                className="rounded-xl bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="VP of Sales"
                className="rounded-xl bg-secondary"
              />
            </div>
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this lead..."
              className="rounded-xl bg-secondary min-h-[80px] resize-none"
            />
          </div>

          {/* AI Toggle */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
            <Sparkles className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">AI Insights</p>
              <p className="text-xs text-muted-foreground">
                Generate AI summary on save
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUseAI(!useAI)}
              className={cn(
                "w-11 h-6 rounded-full transition-colors relative",
                useAI ? "bg-primary" : "bg-muted"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-5 h-5 rounded-full bg-foreground shadow-md transition-transform"
                )}
                style={{
                  transform: useAI ? "translateX(22px)" : "translateX(2px)",
                }}
              />
            </button>
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
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Add Lead
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
