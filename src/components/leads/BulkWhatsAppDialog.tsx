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
  ExternalLink,
  Sparkles,
  Loader2,
  CheckCircle2,
  Copy,
  Flame,
  Users,
} from "lucide-react";
import { useWhatsAppDeepLink } from "@/hooks/useWhatsAppDeepLink";
import { useSuggestOutreach } from "@/hooks/useLeadAI";
import { useLeads, type Lead } from "@/hooks/useLeads";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BulkWhatsAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedLeads?: Lead[];
  filterType?: "hot" | "warm" | "cold" | "all";
}

interface WhatsAppLink {
  lead: Lead;
  link: string;
  personalizedMessage: string;
}

export function BulkWhatsAppDialog({
  open,
  onOpenChange,
  preSelectedLeads,
  filterType = "hot",
}: BulkWhatsAppDialogProps) {
  const { data: allLeads = [] } = useLeads();
  const { generateWhatsAppLink } = useWhatsAppDeepLink();
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
  const [whatsappLinks, setWhatsappLinks] = useState<WhatsAppLink[]>([]);
  const [step, setStep] = useState<"select" | "compose" | "links">("select");

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

  const handleGenerateLinks = () => {
    if (selectedLeads.length === 0 || !messageTemplate.trim()) return;

    const links: WhatsAppLink[] = selectedLeads.map((lead) => {
      const personalizedMessage = personalizeMessage(messageTemplate, lead);
      const link = generateWhatsAppLink(lead.phone!, personalizedMessage);
      return { lead, link, personalizedMessage };
    });
    
    setWhatsappLinks(links);
    setStep("links");
    toast.success(`Generated ${links.length} WhatsApp links`);
  };

  const handleOpenLink = (link: string) => {
    window.open(link, "_blank");
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  const handleClose = () => {
    setStep("select");
    setMessageTemplate("");
    setWhatsappLinks([]);
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
                  onClick={handleGenerateLinks}
                  disabled={!messageTemplate.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Generate Links ({selectedLeads.length})
                </Button>
              </div>
            </>
          )}

          {step === "links" && (
            <>
              <div className="bg-primary/10 rounded-xl p-3 text-sm text-primary">
                <p>
                  <strong>Tap each link</strong> to open WhatsApp with the pre-filled message. 
                  You'll send each message manually from your phone.
                </p>
              </div>

              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {whatsappLinks.map(({ lead, link }) => (
                    <div
                      key={lead.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-secondary"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{lead.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {lead.phone}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyLink(link)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleOpenLink(link)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Open
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep("compose")} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleClose} className="flex-1">
                  Done
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
