 /**
  * WhatsApp Deep Link Hook
  * Opens WhatsApp app on user's phone with pre-filled message
  * Uses wa.me universal links which work on mobile and desktop
  */
 
 import { toast } from "sonner";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "./useAuth";
 import { useQueryClient } from "@tanstack/react-query";
 
 interface SendWhatsAppParams {
   to: string;
   message: string;
   leadId?: string;
   leadName?: string;
 }
 
 export function useWhatsAppDeepLink() {
   const { user } = useAuth();
   const queryClient = useQueryClient();
 
   const openWhatsApp = async ({ to, message, leadId, leadName }: SendWhatsAppParams) => {
     // Clean phone number - remove spaces, dashes, parentheses, and + sign
     const cleanPhone = to.replace(/[\s\-\(\)\+]/g, "");
     
     if (!cleanPhone) {
       toast.error("Invalid phone number", {
         description: "Please enter a valid phone number with country code",
       });
       return false;
     }
 
     // Encode the message for URL
     const encodedMessage = encodeURIComponent(message);
     
     // Create WhatsApp universal link (works on mobile and desktop)
     const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
     
     // Log the message attempt
     if (user && leadId) {
       try {
         await supabase.from("message_logs").insert({
           user_id: user.id,
           lead_id: leadId,
           channel: "whatsapp",
           recipient: to,
           body: message,
           status: "pending", // Will be "pending" since user sends manually
           external_id: `deeplink-${Date.now()}`,
         });
         queryClient.invalidateQueries({ queryKey: ["message-logs"] });
       } catch (err) {
         console.error("Failed to log message:", err);
       }
     }
     
     // Open WhatsApp
     window.open(whatsappUrl, "_blank");
     
     toast.success("Opening WhatsApp", {
       description: leadName 
         ? `Send your message to ${leadName}`
         : "Send your message in WhatsApp",
     });
     
     return true;
   };
 
   const generateWhatsAppLink = (phone: string, message: string): string => {
     const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, "");
     const encodedMessage = encodeURIComponent(message);
     return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
   };
 
   return {
     openWhatsApp,
     generateWhatsAppLink,
   };
 }