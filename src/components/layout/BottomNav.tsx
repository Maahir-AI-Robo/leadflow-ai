 import { cn } from "@/lib/utils";
 import { motion, AnimatePresence } from "framer-motion";
 import { Home, Users, Zap, Bell, Settings, Sparkles, FileText, BarChart3, MoreHorizontal, X } from "lucide-react";
 import { Link, useLocation } from "react-router-dom";
 import { useState } from "react";

 // Primary nav items shown on mobile bottom bar
 const primaryNavItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Users, label: "Leads", path: "/leads" },
  { icon: Zap, label: "Campaigns", path: "/campaigns" },
   { icon: Bell, label: "Alerts", path: "/notifications" },
 ];
 
 // Secondary nav items shown in "More" menu on mobile
 const secondaryNavItems = [
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: FileText, label: "Templates", path: "/templates" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

 // All items for desktop sidebar
 const allNavItems = [...primaryNavItems, ...secondaryNavItems.slice(0, 2), ...secondaryNavItems.slice(2)];
 
export function BottomNav() {
  const location = useLocation();
   const [moreMenuOpen, setMoreMenuOpen] = useState(false);
 
   // Check if current route is in secondary items
   const isSecondaryActive = secondaryNavItems.some(item => location.pathname === item.path);

  return (
    <>
       {/* More Menu Overlay */}
       <AnimatePresence>
         {moreMenuOpen && (
           <>
             {/* Backdrop */}
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setMoreMenuOpen(false)}
               className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
             />
             {/* Menu */}
             <motion.div
               initial={{ opacity: 0, y: 100 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 100 }}
               transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
               className="fixed bottom-24 left-4 right-4 z-50 lg:hidden"
             >
               <div className="glass-card rounded-2xl border border-border/40 overflow-hidden shadow-xl">
                 {secondaryNavItems.map(({ icon: Icon, label, path }) => {
                   const isActive = location.pathname === path;
                   return (
                     <Link
                       key={path}
                       to={path}
                       onClick={() => setMoreMenuOpen(false)}
                       className={cn(
                         "flex items-center gap-4 px-5 py-4 transition-colors border-b border-border/20 last:border-0",
                         isActive
                           ? "bg-primary/10 text-primary"
                           : "text-foreground hover:bg-secondary/50"
                       )}
                     >
                       <div className={cn(
                         "w-10 h-10 rounded-xl flex items-center justify-center",
                         isActive ? "bg-primary/20" : "bg-secondary"
                       )}>
                         <Icon className="w-5 h-5" />
                       </div>
                       <span className="font-medium">{label}</span>
                       {isActive && (
                         <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                       )}
                     </Link>
                   );
                 })}
               </div>
             </motion.div>
           </>
         )}
       </AnimatePresence>
 
      {/* Mobile/Tablet Bottom Nav - Enhanced */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="safe-bottom">
           <div className="glass-card border-t border-border/30 mx-4 mb-4 rounded-2xl shadow-xl backdrop-blur-xl">
             <div className="flex items-center justify-around px-2 py-2">
               {primaryNavItems.map(({ icon: Icon, label, path }) => {
                 const isActive = location.pathname === path;
                 
                 return (
                   <Link
                     key={path}
                     to={path}
                     className={cn(
                       "relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 touch-target-sm press-effect min-w-[56px]",
                       isActive 
                         ? "text-primary" 
                         : "text-muted-foreground hover:text-foreground"
                     )}
                   >
                     {isActive && (
                       <motion.div
                         layoutId="activeTab"
                         className="absolute inset-0 bg-primary/15 rounded-xl border border-primary/20"
                         transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                       />
                     )}
                     <motion.div
                       animate={isActive ? { scale: 1.1, y: -1 } : { scale: 1, y: 0 }}
                       transition={{ type: "spring", stiffness: 400, damping: 17 }}
                     >
                       <Icon className={cn(
                         "w-5 h-5 relative z-10",
                         isActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                       )} />
                     </motion.div>
                     <span className={cn(
                       "text-[10px] font-medium relative z-10 transition-all",
                       isActive && "font-semibold"
                     )}>
                       {label}
                     </span>
                   </Link>
                 );
               })}
               
               {/* More button */}
               <button
                 onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                 className={cn(
                   "relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 touch-target-sm press-effect min-w-[56px]",
                   moreMenuOpen || isSecondaryActive
                     ? "text-primary" 
                     : "text-muted-foreground hover:text-foreground"
                 )}
               >
                 {(moreMenuOpen || isSecondaryActive) && (
                   <motion.div
                     layoutId="activeTab"
                     className="absolute inset-0 bg-primary/15 rounded-xl border border-primary/20"
                     transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                   />
                 )}
                 <motion.div
                   animate={moreMenuOpen ? { rotate: 90 } : { rotate: 0 }}
                   transition={{ type: "spring", stiffness: 400, damping: 17 }}
                 >
                   {moreMenuOpen ? (
                     <X className="w-5 h-5 relative z-10" />
                   ) : (
                     <MoreHorizontal className={cn(
                       "w-5 h-5 relative z-10",
                       isSecondaryActive && "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                     )} />
                   )}
                 </motion.div>
                 <span className={cn(
                   "text-[10px] font-medium relative z-10 transition-all",
                   (moreMenuOpen || isSecondaryActive) && "font-semibold"
                 )}>
                   More
                 </span>
               </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar Nav - Enhanced */}
      <nav className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 z-50 flex-col glass-card border-r border-border/30 backdrop-blur-xl">
        {/* Logo Section */}
         <div className="p-5 border-b border-border/30">
          <div className="flex items-center gap-3">
             <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-glow-sm">
               <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold gradient-text">LeadFlow AI</h1>
              <p className="text-xs text-muted-foreground">Smart Lead Management</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4 py-6 space-y-2">
           {[...primaryNavItems, ...secondaryNavItems].map(({ icon: Icon, label, path }) => {
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
