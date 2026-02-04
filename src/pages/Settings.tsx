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

interface SettingsItem {
  icon: React.ElementType;
  label: string;
  description?: string;
  action?: "toggle" | "link" | "button";
  value?: boolean;
  variant?: "default" | "destructive";
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const sections: SettingsSection[] = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Profile",
          description: "Manage your profile information",
          action: "link",
        },
        {
          icon: Shield,
          label: "Security",
          description: "Password and authentication",
          action: "link",
        },
      ],
    },
    {
      title: "Integrations",
      items: [
        {
          icon: Linkedin,
          label: "LinkedIn",
          description: "Connected",
          action: "link",
        },
        {
          icon: Mail,
          label: "Email",
          description: "Configure email settings",
          action: "link",
        },
        {
          icon: MessageSquare,
          label: "WhatsApp Business",
          description: "Not connected",
          action: "link",
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
        },
        {
          icon: Palette,
          label: "What's New",
          action: "link",
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

  return (
    <MobileLayout>
      <div className="px-4 pt-6 space-y-6 safe-top">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl font-bold">Settings</h1>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-5 border border-border/50"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center text-primary-foreground font-display font-bold text-xl">
              AJ
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">Alex Johnson</h2>
              <p className="text-sm text-muted-foreground">
                alex@company.com
              </p>
              <p className="text-xs text-primary mt-1">Pro Plan</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
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
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              {section.title}
            </h3>
            <div className="glass-card rounded-2xl border border-border/50 divide-y divide-border/50 overflow-hidden">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => item.action === "toggle" && handleToggle(item.label)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors text-left",
                    item.variant === "destructive" && "text-destructive"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      item.variant === "destructive"
                        ? "bg-destructive/20"
                        : "bg-secondary"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.label}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate">
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
                          "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform",
                          item.value ? "translate-x-5.5" : "translate-x-0.5"
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
                </button>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-destructive/10 hover:bg-destructive/20 transition-colors text-destructive">
            <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </motion.div>

        {/* App Version */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground py-4"
        >
          LeadGen AI v1.0.0
        </motion.p>
      </div>
    </MobileLayout>
  );
}
