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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCampaignDetails,
  useUpdateCampaignDetails,
  useUpdateCampaignTemplate,
  useRemoveLeadFromCampaign,
} from "@/hooks/useCampaignDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2, Save, Trash2, Users, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditCampaignDialogProps {
  campaignId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const campaignTypes = [
  { value: "outreach", label: "Cold Outreach" },
  { value: "followup", label: "Follow-up" },
  { value: "nurture", label: "Nurture" },
  { value: "reengagement", label: "Re-engagement" },
];

const campaignStatuses = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
];

export function EditCampaignDialog({
  campaignId,
  open,
  onOpenChange,
}: EditCampaignDialogProps) {
  const { data: campaign, isLoading } = useCampaignDetails(open ? campaignId : null);
  const updateDetails = useUpdateCampaignDetails();
  const updateTemplate = useUpdateCampaignTemplate();
  const removeLead = useRemoveLeadFromCampaign();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [templateDelayDays, setTemplateDelayDays] = useState(0);

  useEffect(() => {
    if (campaign) {
      setName(campaign.name);
      setType(campaign.type);
      setStatus(campaign.status);
    }
  }, [campaign]);

  const handleSaveDetails = async () => {
    if (!campaignId) return;

    try {
      await updateDetails.mutateAsync({
        campaignId,
        name,
        type,
        status,
      });
      toast.success("Campaign updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update campaign");
    }
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplateId(template.id);
    setTemplateSubject(template.subject);
    setTemplateBody(template.body);
    setTemplateDelayDays(template.delay_days);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplateId || !campaignId) return;

    try {
      await updateTemplate.mutateAsync({
        templateId: editingTemplateId,
        campaignId,
        subject: templateSubject,
        body: templateBody,
        delay_days: templateDelayDays,
      });
      toast.success("Template updated");
      setEditingTemplateId(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update template");
    }
  };

  const handleRemoveLead = async (campaignLeadId: string) => {
    if (!campaignId) return;

    try {
      await removeLead.mutateAsync({ campaignLeadId, campaignId });
      toast.success("Lead removed from campaign");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove lead");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl mx-4 rounded-3xl bg-card border-border p-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-display text-xl">Edit Campaign</DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : campaign ? (
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 rounded-xl">
                <TabsTrigger value="details" className="rounded-lg gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Details</span>
                </TabsTrigger>
                <TabsTrigger value="messages" className="rounded-lg gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Messages</span>
                </TabsTrigger>
                <TabsTrigger value="leads" className="rounded-lg gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Leads</span>
                </TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Campaign Type</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {campaignTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {campaignStatuses.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-secondary/50">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{campaign.leads_count}</p>
                    <p className="text-xs text-muted-foreground">Leads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{campaign.templates.length}</p>
                    <p className="text-xs text-muted-foreground">Messages</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{campaign.response_rate || 0}%</p>
                    <p className="text-xs text-muted-foreground">Response</p>
                  </div>
                </div>

                <Button
                  onClick={handleSaveDetails}
                  disabled={updateDetails.isPending}
                  className="w-full rounded-xl"
                >
                  {updateDetails.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </TabsContent>

              {/* Messages Tab */}
              <TabsContent value="messages" className="space-y-4">
                {campaign.templates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No message templates</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {campaign.templates.map((template) => (
                      <div
                        key={template.id}
                        className={cn(
                          "p-4 rounded-xl border transition-all",
                          editingTemplateId === template.id
                            ? "border-primary bg-primary/5"
                            : "border-border bg-secondary/30"
                        )}
                      >
                        {editingTemplateId === template.id ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                                {template.step_number}
                              </span>
                              <span className="text-sm font-medium">Editing Step {template.step_number}</span>
                            </div>
                            <Input
                              value={templateSubject}
                              onChange={(e) => setTemplateSubject(e.target.value)}
                              placeholder="Subject"
                              className="rounded-xl"
                            />
                            <Textarea
                              value={templateBody}
                              onChange={(e) => setTemplateBody(e.target.value)}
                              placeholder="Message body"
                              rows={4}
                              className="rounded-xl resize-none"
                            />
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Delay (days):</Label>
                              <Input
                                type="number"
                                value={templateDelayDays}
                                onChange={(e) => setTemplateDelayDays(parseInt(e.target.value) || 0)}
                                className="w-20 rounded-xl"
                                min={0}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingTemplateId(null)}
                                className="rounded-lg"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleSaveTemplate}
                                disabled={updateTemplate.isPending}
                                className="rounded-lg"
                              >
                                {updateTemplate.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  "Save"
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="cursor-pointer"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                                  {template.step_number}
                                </span>
                                <span className="text-sm font-medium truncate max-w-[200px]">
                                  {template.subject || "No subject"}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                +{template.delay_days}d
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {template.body}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Leads Tab */}
              <TabsContent value="leads" className="space-y-4">
                {campaign.campaign_leads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No leads in this campaign</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {campaign.campaign_leads.map((cl) => (
                      <div
                        key={cl.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                            {cl.lead?.name?.charAt(0) || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {cl.lead?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {cl.lead?.company || cl.lead?.email || "No details"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "px-2 py-0.5 text-[10px] font-medium rounded-full",
                              cl.status === "pending"
                                ? "bg-muted text-muted-foreground"
                                : cl.status === "sent"
                                ? "bg-primary/20 text-primary"
                                : cl.status === "responded"
                                ? "bg-success/20 text-success"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {cl.status}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveLead(cl.id)}
                            disabled={removeLead.isPending}
                          >
                            {removeLead.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-center text-muted-foreground">
                  {campaign.campaign_leads.length} lead{campaign.campaign_leads.length !== 1 ? "s" : ""} in campaign
                </p>
              </TabsContent>
            </Tabs>
          ) : (
            <p className="text-muted-foreground text-center py-8">Campaign not found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
