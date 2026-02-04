import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  MessageCircle,
  Send,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  Flame,
  Users,
} from "lucide-react";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import { useSuggestOutreach } from "@/hooks/useLeadAI";
import { useLeads, type Lead } from "@/hooks/useLeads";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BulkWhatsAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedLeads?: Lead[];
  filterType?: "hot" | "warm" | "cold" | "all";
}

interface SendResult {
  leadId: string;
  leadName: string;
  success: boolean;
  demo?: boolean;
  error?: string;
}

export function BulkWhatsAppDialog({
  open,
  onOpenChange,
  preSelectedLeads,
  filterType = "hot",
}: BulkWhatsAppDialogProps) {
  const { data: allLeads = [] } = useLeads();
  const { sendMessage, isSending } = useWhatsApp();
  const suggestOutreach = useSuggestOutreach();

  // Filter leads based on type and phone availability
  const eligibleLeads = (preSelectedLeads || allLeads).filter(
    (lead) =>
      lead.phone &&
      lead.phone.trim() !== "" &&
      (filterType === "all" || lead.score === filterType)
  );

  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(
    new Set(eligibleLeads.map((l) => l.id))
  );
  const [messageTemplate, setMessageTemplate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [results, setResults] = useState<SendResult[]>([]);
  const [step, setStep] = useState<"select" | "compose" | "sending" | "done">("select");

  const selectedLeads = eligibleLeads.filter((l) => selectedLeadIds.has(l.id));

  const toggleLead = (leadId: string) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) {
        next.delete(leadId);
      } else {
        next.add(leadId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedLeadIds.size === eligibleLeads.length) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(eligibleLeads.map((l) => l.id)));
    }
  };

  const handleGenerateTemplate = async () => {
    if (selectedLeads.length === 0) return;

    setIsGenerating(true);
    try {
      // Use the first selected lead as a template basis
      const firstLead = selectedLeads[0];
      const suggestion = await suggestOutreach.mutateAsync({
        name: "{{name}}",
        role: firstLead.role || "professional",
        company: "{{company}}",
      });
      setMessageTemplate(suggestion);
    } catch (error) {
      console.error("Failed to generate template:", error);
      toast.error("Failed to generate message template");
    } finally {
      setIsGenerating(false);
    }
  };

  const personalizeMessage = (template: string, lead: Lead) => {
    return template
      .replace(/\{\{name\}\}/g, lead.name.split(" ")[0])
      .replace(/\{\{company\}\}/g, lead.company || "your company")
      .replace(/\{\{role\}\}/g, lead.role || "");
  };

  const handleSendAll = async () => {
    if (selectedLeads.length === 0 || !messageTemplate.trim()) return;

    setStep("sending");
    setIsSendingBulk(true);
    setSendProgress(0);
    setResults([]);

    const newResults: SendResult[] = [];

    for (let i = 0; i < selectedLeads.length; i++) {
      const lead = selectedLeads[i];
      const personalizedMessage = personalizeMessage(messageTemplate, lead);

      try {
        const response = await sendMessage({
          to: lead.phone!,
          message: personalizedMessage,
          leadId: lead.id,
          leadName: lead.name,
        });

        newResults.push({
          leadId: lead.id,
          leadName: lead.name,
          success: response.success,
          demo: response.demo,
        });
      } catch (error) {
        newResults.push({
          leadId: lead.id,
          leadName: lead.name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }

      setSendProgress(((i + 1) / selectedLeads.length) * 100);
      setResults([...newResults]);

      // Small delay between messages to avoid rate limiting
      if (i < selectedLeads.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setIsSendingBulk(false);
    setStep("done");

    const successCount = newResults.filter((r) => r.success).length;
    const demoCount = newResults.filter((r) => r.demo).length;

    if (demoCount > 0) {
      toast.info(`Demo mode: ${successCount} messages simulated`, {
        description: "Configure WhatsApp credentials for real delivery",
      });
    } else {
      toast.success(`${successCount}/${selectedLeads.length} messages sent`);
    }
  };

  const handleClose = () => {
    setStep("select");
    setMessageTemplate("");
    setResults([]);
    setSendProgress(0);
    onOpenChange(false);
  };

  const leadsWithoutPhone = (preSelectedLeads || allLeads).filter(
    (lead) =>
      (!lead.phone || lead.phone.trim() === "") &&
      (filterType === "all" || lead.score === filterType)
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            Bulk WhatsApp Outreach
          </DialogTitle>
          <DialogDescription>
            {filterType === "hot"
              ? "Send personalized messages to hot leads"
              : `Send messages to ${filterType} leads`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {step === "select" && (
            <>
              {/* Stats */}
              <div className="flex gap-3">
                <div className="flex-1 p-3 rounded-xl bg-secondary text-center">
                  <div className="flex items-center justify-center gap-1 text-lg font-bold">
                    <Flame className="w-4 h-4 text-destructive" />
                    {eligibleLeads.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Eligible</p>
                </div>
                <div className="flex-1 p-3 rounded-xl bg-secondary text-center">
                  <div className="text-lg font-bold text-primary">
                    {selectedLeadIds.size}
                  </div>
                  <p className="text-xs text-muted-foreground">Selected</p>
                </div>
                <div className="flex-1 p-3 rounded-xl bg-secondary text-center">
                  <div className="text-lg font-bold text-muted-foreground">
                    {leadsWithoutPhone.length}
                  </div>
                  <p className="text-xs text-muted-foreground">No Phone</p>
                </div>
              </div>

              {eligibleLeads.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No {filterType} leads with phone numbers found
                  </p>
                </div>
              ) : (
                <>
                  {/* Select All */}
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <Checkbox
                      checked={selectedLeadIds.size === eligibleLeads.length}
                      onCheckedChange={toggleAll}
                    />
                    <span className="text-sm font-medium">Select all eligible leads</span>
                  </div>

                  {/* Lead List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {eligibleLeads.map((lead) => (
                      <label
                        key={lead.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors",
                          selectedLeadIds.has(lead.id)
                            ? "bg-primary/10 border border-primary/30"
                            : "bg-secondary hover:bg-secondary/80"
                        )}
                      >
                        <Checkbox
                          checked={selectedLeadIds.has(lead.id)}
                          onCheckedChange={() => toggleLead(lead.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{lead.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {lead.phone}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "px-2 py-0.5 text-[10px] font-medium rounded-full",
                            lead.score === "hot" && "bg-destructive/20 text-destructive",
                            lead.score === "warm" && "bg-warning/20 text-warning",
                            lead.score === "cold" && "bg-blue-500/20 text-blue-500"
                          )}
                        >
                          {lead.score_value}
                        </span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep("compose")}
                  disabled={selectedLeadIds.size === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Next: Compose
                </Button>
              </div>
            </>
          )}

          {step === "compose" && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Message Template</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateTemplate}
                    disabled={isGenerating}
                    className="h-7 text-xs"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Sparkles className="h-3 w-3 mr-1" />
                    )}
                    AI Generate
                  </Button>
                </div>
                <Textarea
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  placeholder="Hi {{name}}, I noticed you work at {{company}}..."
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Use {"{{name}}"}, {"{{company}}"}, {"{{role}}"} for personalization
                </p>
              </div>

              {messageTemplate && selectedLeads[0] && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Preview for {selectedLeads[0].name}:
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {personalizeMessage(messageTemplate, selectedLeads[0])}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep("select")} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleSendAll}
                  disabled={!messageTemplate.trim() || isSendingBulk}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send to {selectedLeads.length} leads
                </Button>
              </div>
            </>
          )}

          {(step === "sending" || step === "done") && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Sending messages...</span>
                  <span className="font-medium">{Math.round(sendProgress)}%</span>
                </div>
                <Progress value={sendProgress} className="h-2" />
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {results.map((result) => (
                  <div
                    key={result.leadId}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl text-sm",
                      result.success ? "bg-success/10" : "bg-destructive/10"
                    )}
                  >
                    {result.success ? (
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    )}
                    <span className="flex-1 truncate">{result.leadName}</span>
                    {result.demo && (
                      <span className="text-xs text-muted-foreground">Demo</span>
                    )}
                  </div>
                ))}
              </div>

              {step === "done" && (
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleClose} className="flex-1">
                    Done
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
