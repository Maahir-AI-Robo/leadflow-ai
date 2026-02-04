import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Home, Users, Zap, Bell, Settings, Sparkles, FileText, BarChart3 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Users, label: "Leads", path: "/leads" },
  { icon: Zap, label: "Campaigns", path: "/campaigns" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: FileText, label: "Templates", path: "/templates" },
  { icon: Bell, label: "Alerts", path: "/notifications" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <>
      {/* Mobile/Tablet Bottom Nav - Enhanced */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="safe-bottom">
          <div className="glass-card border-t border-border/30 mx-3 sm:mx-4 mb-3 sm:mb-4 rounded-3xl shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-around px-2 py-3">
              {navItems.map(({ icon: Icon, label, path }) => {
                const isActive = location.pathname === path;
                
                return (
                  <Link
                    key={path}
                    to={path}
                    className={cn(
                      "relative flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 touch-target press-effect",
                      isActive 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary/15 rounded-2xl border border-primary/20"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                      />
                    )}
                    <motion.div
                      animate={isActive ? { scale: 1.15, y: -2 } : { scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Icon className={cn(
                        "w-5 h-5 sm:w-6 sm:h-6 relative z-10",
                        isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                      )} />
                    </motion.div>
                    <span className={cn(
                      "text-[10px] sm:text-xs font-medium relative z-10 transition-all",
                      isActive && "font-semibold"
                    )}>
                      {label}
                    </span>
                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.div
                        layoutId="activeDot"
                        className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar Nav - Enhanced */}
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 z-50 flex-col glass-card border-r border-border/30 backdrop-blur-xl">
        {/* Logo Section */}
        <div className="p-6 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-glow-sm">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold gradient-text">LeadFlow AI</h1>
              <p className="text-xs text-muted-foreground">Smart Lead Management</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "text-primary bg-primary/10 shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActive"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Icon className={cn(
                  "w-5 h-5 transition-transform group-hover:scale-110",
                  isActive && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]"
                )} />
                <span className="font-medium">{label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/30">
          <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-cyan-500/10 border border-primary/20">
            <p className="text-xs text-muted-foreground">AI-Powered Outreach</p>
            <p className="text-sm font-medium text-primary">Boost your conversions</p>
          </div>
        </div>
      </nav>
    </>
  );
}
