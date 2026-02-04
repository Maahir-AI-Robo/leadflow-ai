import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Home, Users, Zap, Bell, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Users, label: "Leads", path: "/leads" },
  { icon: Zap, label: "Campaigns", path: "/campaigns" },
  { icon: Bell, label: "Alerts", path: "/notifications" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <>
      {/* Mobile/Tablet Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom lg:hidden">
        <div className="glass-card border-t border-border/50 mx-2 sm:mx-4 mb-2 sm:mb-4 rounded-2xl">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path;
              
              return (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    "relative flex flex-col items-center gap-1 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 touch-target",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className={cn(
                    "w-5 h-5 relative z-10 transition-transform duration-200",
                    isActive && "scale-110"
                  )} />
                  <span className={cn(
                    "text-[10px] sm:text-xs font-medium relative z-10",
                    isActive && "font-semibold"
                  )}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar Nav */}
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 z-50 flex-col glass-card border-r border-border/50">
        <div className="p-6">
          <h1 className="font-display text-xl font-bold gradient-text">LeadFlow AI</h1>
        </div>
        <div className="flex-1 px-3 space-y-1">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
