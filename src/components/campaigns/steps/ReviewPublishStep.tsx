import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Mail,
  MessageSquare,
  Linkedin,
  Target,
  Loader2,
  Save,
  Rocket,
  Send,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { CampaignDraft } from "@/hooks/useCampaignBuilder";
import type { UseMutationResult } from "@tanstack/react-query";
import { useCampaignExecution } from "@/hooks/useCampaignExecution";
import { cn } from "@/lib/utils";

interface ReviewPublishStepProps {
  draft: CampaignDraft;
  saveCampaign: UseMutationResult<any, Error, void>;
  publishCampaign: UseMutationResult<any, Error, void>;
  onBack: () => void;
  onClose: () => void;
}

const channelIcons = {
  email: Mail,
  linkedin: Linkedin,
  whatsapp: MessageSquare,
};

export function ReviewPublishStep({
  draft,
  saveCampaign,
  publishCampaign,
  onBack,
  onClose,
}: ReviewPublishStepProps) {
  const { toast } = useToast();
  const { executeCampaign, progress, results, isExecuting, reset } = useCampaignExecution();
  const [mode, setMode] = useState<"review" | "sending" | "done">("review");
  
  const ChannelIcon = channelIcons[draft.channel as keyof typeof channelIcons] || Mail;

  const eligibleLeadsCount = draft.selectedLeads.filter((lead) => {
    if (draft.channel === "whatsapp") return lead.phone && lead.phone.trim() !== "";
    if (draft.channel === "email") return lead.email && lead.email.trim() !== "";
    return false;
  }).length;

  const handleSaveDraft = async () => {
    try {
      await saveCampaign.mutateAsync();
      toast({
        title: "Campaign saved",
        description: "Your campaign has been saved as a draft.",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePublish = async () => {
    try {
      await publishCampaign.mutateAsync();
      toast({
        title: "Campaign published!",
        description: "Your campaign is now active and ready to send.",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSendNow = async () => {
    if (draft.templates.length === 0) {
      toast({
        title: "No messages",
        description: "Please generate messages before sending.",
        variant: "destructive",
      });
      return;
    }

    setMode("sending");

    try {
      // Save campaign first
      await saveCampaign.mutateAsync();

      // Execute the first template immediately
      const firstTemplate = draft.templates[0];
      await executeCampaign.mutateAsync({
        leads: draft.selectedLeads,
        messageTemplate: firstTemplate.body,
        channel: draft.channel as "whatsapp" | "email",
        subjectTemplate: firstTemplate.subject,
      });

      setMode("done");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setMode("review");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isLoading = saveCampaign.isPending || publishCampaign.isPending;
  const canSendNow = (draft.channel === "whatsapp" || draft.channel === "email") && eligibleLeadsCount > 0;

  if (mode === "sending" || mode === "done") {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
            <ChannelIcon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold">
            {mode === "sending" ? "Sending Messages..." : "Campaign Sent!"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {mode === "sending" 
              ? `Sending to ${eligibleLeadsCount} leads via ${draft.channel}`
              : `Successfully sent to ${results.filter(r => r.success).length} leads`
            }
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
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

        {mode === "done" && (
          <Button onClick={handleClose} className="w-full rounded-xl">
            Done
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Campaign Summary Card */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-cyan-500/5 border border-border">
        <h3 className="font-display text-lg font-semibold mb-4">{draft.name}</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{draft.selectedLeads.length}</p>
              <p className="text-xs text-muted-foreground">Leads</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <ChannelIcon className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <p className="text-xl font-bold capitalize">{draft.channel}</p>
              <p className="text-xs text-muted-foreground">Channel</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{draft.templates.length}</p>
              <p className="text-xs text-muted-foreground">Messages</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium capitalize">{draft.type}</p>
              <p className="text-xs text-muted-foreground">Type</p>
            </div>
          </div>
        </div>
      </div>

      {/* Eligible Leads Info */}
      {canSendNow && eligibleLeadsCount < draft.selectedLeads.length && (
        <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
          <p className="text-sm text-warning">
            {eligibleLeadsCount} of {draft.selectedLeads.length} leads have {draft.channel === "whatsapp" ? "phone numbers" : "email addresses"}
          </p>
        </div>
      )}

      {/* Goal */}
      <div className="p-4 rounded-xl bg-secondary">
        <p className="text-xs text-muted-foreground mb-1">Campaign Goal</p>
        <p className="text-sm">{draft.goal}</p>
      </div>

      {/* Sequence Preview */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Message Sequence</h4>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {draft.templates.map((template, index) => (
            <div
              key={index}
              className="flex-shrink-0 flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center">
                {template.step}
              </div>
              {index < draft.templates.length - 1 && (
                <div className="flex items-center gap-1">
                  <div className="w-6 h-0.5 bg-border" />
                  <span className="text-[10px] text-muted-foreground">
                    {template.delay_days}d
                  </span>
                  <div className="w-6 h-0.5 bg-border" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top Leads Preview */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Selected Leads</h4>
        <div className="flex flex-wrap gap-2">
          {draft.selectedLeads.slice(0, 5).map((lead) => (
            <span
              key={lead.id}
              className="px-3 py-1 rounded-full bg-secondary text-xs font-medium"
            >
              {lead.name}
            </span>
          ))}
          {draft.selectedLeads.length > 5 && (
            <span className="px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
              +{draft.selectedLeads.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading || isExecuting}
            className="rounded-xl"
          >
            Back
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isLoading || isExecuting}
            className="flex-1 rounded-xl"
          >
            {saveCampaign.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </>
            )}
          </Button>
        </div>

        {canSendNow && (
          <Button
            onClick={handleSendNow}
            disabled={isLoading || isExecuting || draft.templates.length === 0}
            className="w-full rounded-xl bg-success hover:bg-success/90 text-success-foreground"
          >
            {isExecuting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Now ({eligibleLeadsCount} leads)
              </>
            )}
          </Button>
        )}

        <Button
          onClick={handlePublish}
          disabled={isLoading || isExecuting}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground shadow-glow"
        >
          {publishCampaign.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Rocket className="w-4 h-4 mr-2" />
              Schedule Campaign
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          {canSendNow 
            ? "Send Now delivers immediately. Schedule saves for automated delivery."
            : "Publishing will start sending messages according to schedule"
          }
        </p>
      </div>
    </div>
  );
}
