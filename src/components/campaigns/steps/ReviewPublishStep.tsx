import { Button } from "@/components/ui/button";
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
  Check,
} from "lucide-react";
import type { CampaignDraft } from "@/hooks/useCampaignBuilder";
import type { UseMutationResult } from "@tanstack/react-query";

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
  const ChannelIcon = channelIcons[draft.channel as keyof typeof channelIcons] || Mail;

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

  const isLoading = saveCampaign.isPending || publishCampaign.isPending;

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
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium capitalize">{draft.type}</p>
              <p className="text-xs text-muted-foreground">Type</p>
            </div>
          </div>
        </div>
      </div>

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
            disabled={isLoading}
            className="rounded-xl"
          >
            Back
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isLoading}
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

        <Button
          onClick={handlePublish}
          disabled={isLoading}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground shadow-glow"
        >
          {publishCampaign.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Rocket className="w-4 h-4 mr-2" />
              Publish Campaign
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Publishing will start sending messages according to schedule
        </p>
      </div>
    </div>
  );
}
