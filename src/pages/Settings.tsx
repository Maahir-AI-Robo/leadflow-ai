import { MobileLayout } from "@/components/layout/MobileLayout";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  Palette,
  HelpCircle,
  LogOut,
  ChevronRight,
  Linkedin,
  Mail,
  MessageSquare,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface SettingsItem {
  icon: React.ElementType;
  label: string;
  description?: string;
  action?: "toggle" | "link" | "button";
  value?: boolean;
  variant?: "default" | "destructive";
  onPress?: () => void;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const sections: SettingsSection[] = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Profile",
          description: "Manage your profile information",
          action: "link",
          onPress: () => navigate("/profile"),
        },
        {
          icon: Shield,
          label: "Security",
          description: "Password and authentication",
          action: "link",
          onPress: () => toast({ title: "Coming soon", description: "Security settings will be available soon." }),
        },
      ],
    },
    {
      title: "Integrations",
      items: [
        {
          icon: Linkedin,
          label: "LinkedIn",
          description: "Not connected",
          action: "link",
          onPress: () => toast({ title: "Coming soon", description: "LinkedIn integration will be available soon." }),
        },
        {
          icon: Mail,
          label: "Email",
          description: "Configure email settings",
          action: "link",
          onPress: () => toast({ title: "Email Settings", description: "Add RESEND_API_KEY in Cloud secrets to enable email sending." }),
        },
        {
          icon: MessageSquare,
          label: "WhatsApp Business",
          description: "Not connected",
          action: "link",
          onPress: () => toast({ title: "WhatsApp Settings", description: "Add WHATSAPP_ACCESS_TOKEN in Cloud secrets to enable WhatsApp." }),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: Bell,
          label: "Push Notifications",
          action: "toggle",
          value: pushNotifications,
        },
        {
          icon: Mail,
          label: "Email Notifications",
          action: "toggle",
          value: emailNotifications,
        },
        {
          icon: darkMode ? Moon : Sun,
          label: "Dark Mode",
          action: "toggle",
          value: darkMode,
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          label: "Help Center",
          action: "link",
          onPress: () => window.open("https://docs.lovable.dev", "_blank"),
        },
        {
          icon: Palette,
          label: "What's New",
          action: "link",
          onPress: () => toast({ title: "What's New", description: "AI-powered lead scoring, WhatsApp & Email outreach, Follow-up scheduling!" }),
        },
      ],
    },
  ];

  const handleToggle = (label: string) => {
    switch (label) {
      case "Dark Mode":
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle("light", darkMode);
        break;
      case "Push Notifications":
        setPushNotifications(!pushNotifications);
        break;
      case "Email Notifications":
        setEmailNotifications(!emailNotifications);
        break;
    }
  };

  const displayName = user?.user_metadata?.full_name || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <MobileLayout>
      <div className="px-4 sm:px-6 lg:px-8 lg:pl-80 pt-6 space-y-6 safe-top">
        {/* Header - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
        </motion.div>

        {/* Profile Card - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-5 sm:p-6 border border-border/40 backdrop-blur-xl"
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center text-primary-foreground font-display font-bold text-xl sm:text-2xl shadow-glow-sm"
              whileHover={{ scale: 1.05, rotate: 3 }}
            >
              {initials}
            </motion.div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-lg sm:text-xl truncate">{displayName}</h2>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                  Pro Plan
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </div>
        </motion.div>

        {/* Settings Sections */}
        {sections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + sectionIndex * 0.05 }}
            className="space-y-2"
          >
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
              {section.title}
            </h3>
            <div className="glass-card rounded-2xl sm:rounded-3xl border border-border/40 divide-y divide-border/30 overflow-hidden backdrop-blur-xl">
              {section.items.map((item, itemIndex) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + sectionIndex * 0.05 + itemIndex * 0.02 }}
                  onClick={() => {
                    if (item.action === "toggle") {
                      handleToggle(item.label);
                    } else if (item.onPress) {
                      item.onPress();
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 sm:p-5 hover:bg-secondary/50 transition-all text-left press-effect touch-target",
                    item.variant === "destructive" && "text-destructive"
                  )}
                >
                  <motion.div
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                      item.variant === "destructive"
                        ? "bg-destructive/20"
                        : "bg-secondary/80"
                    )}
                    whileHover={{ scale: 1.1 }}
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base">{item.label}</p>
                    {item.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.action === "toggle" ? (
                    <div
                      className={cn(
                        "w-11 h-6 rounded-full transition-colors relative",
                        item.value ? "bg-primary" : "bg-muted"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 w-5 h-5 rounded-full bg-foreground shadow-md transition-transform"
                        )}
                        style={{
                          transform: item.value
                            ? "translateX(22px)"
                            : "translateX(2px)",
                        }}
                      />
                    </div>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Logout Button - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-destructive/10 hover:bg-destructive/20 transition-all text-destructive press-effect touch-target border border-destructive/20"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="w-11 h-11 rounded-xl bg-destructive/20 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-medium">Sign Out</span>
          </motion.button>
        </motion.div>

        {/* App Version */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground/70 py-6"
        >
          LeadFlow AI v1.0.0
        </motion.p>
      </div>
    </MobileLayout>
  );
}
