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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, ExternalLink, Sparkles, Loader2 } from "lucide-react";
import { useWhatsAppDeepLink } from "@/hooks/useWhatsAppDeepLink";
import { useSuggestOutreach } from "@/hooks/useLeadAI";

interface Lead {
  id: string;
  name: string;
  phone?: string | null;
  role?: string | null;
  company?: string | null;
}

interface WhatsAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead;
}

export function WhatsAppDialog({ open, onOpenChange, lead }: WhatsAppDialogProps) {
  const [phone, setPhone] = useState(lead.phone || "");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { openWhatsApp } = useWhatsAppDeepLink();
  const suggestOutreach = useSuggestOutreach();

  const handleGenerateMessage = async () => {
    try {
      const suggestion = await suggestOutreach.mutateAsync({
        name: lead.name,
        role: lead.role,
        company: lead.company,
      });
      if (suggestion) {
        setMessage(suggestion);
      }
    } catch (error) {
      console.error("Failed to generate message:", error);
    }
  };

  const handleSend = async () => {
    if (!phone.trim() || !message.trim()) return;
    
    setIsSending(true);
    
    const personalizedMessage = personalizeMessage(message);

    const success = await openWhatsApp({
      to: phone,
      message: personalizedMessage,
      leadId: lead.id,
      leadName: lead.name,
    });

    setIsSending(false);
    
    if (success) {
      setMessage("");
      onOpenChange(false);
    }
  };

  const personalizeMessage = (text: string) => {
    return text
      .replace(/\{\{name\}\}/g, lead.name.split(" ")[0])
      .replace(/\{\{company\}\}/g, lead.company || "your company")
      .replace(/\{\{role\}\}/g, lead.role || "your role");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            WhatsApp {lead.name}
          </DialogTitle>
          <DialogDescription>
            Send a personalized WhatsApp message to this lead
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="+1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +1 for US)
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="message">Message</Label>
            <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerateMessage}
                disabled={suggestOutreach.isPending}
                className="h-7 text-xs"
              >
                {suggestOutreach.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Sparkles className="h-3 w-3 mr-1" />
                )}
                AI Generate
              </Button>
            </div>
            <Textarea
              id="message"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Use {"{{name}}"}, {"{{company}}"}, {"{{role}}"} for personalization
            </p>
          </div>

          {message && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Preview:</p>
              <p className="text-sm whitespace-pre-wrap">
                {personalizeMessage(message)}
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!phone.trim() || !message.trim() || isSending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              Open WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
