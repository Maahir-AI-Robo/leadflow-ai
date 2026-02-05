 import { useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { useAILeadFinder, type AIGeneratedLead } from "@/hooks/useAILeadFinder";
 import { useCreateLead } from "@/hooks/useLeads";
 import { useToast } from "@/hooks/use-toast";
 import {
   Sparkles,
   Search,
   Loader2,
   MapPin,
   Building2,
   Check,
   UserPlus,
   Mail,
   Phone,
   Flame,
   Snowflake,
   ThermometerSun,
   Brain,
 } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { Badge } from "@/components/ui/badge";
 
 interface AILeadFinderDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
 }
 
 export function AILeadFinderDialog({ open, onOpenChange }: AILeadFinderDialogProps) {
   const [step, setStep] = useState<"search" | "results">("search");
   const [searchParams, setSearchParams] = useState({
     jobTitle: "",
     industry: "",
     location: "",
     companySize: "",
     keywords: "",
     count: 10,
   });
 
   const {
     search,
     isSearching,
     results,
     selectedLeads,
     toggleLead,
     selectAll,
     clearSelection,
   } = useAILeadFinder();
 
   const createLead = useCreateLead();
   const { toast } = useToast();
   const [isImporting, setIsImporting] = useState(false);
   const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
 
   const handleSearch = async () => {
     if (!searchParams.jobTitle && !searchParams.industry && !searchParams.keywords) {
       toast({
         title: "Add search criteria",
         description: "Please enter at least a job title, industry, or keywords",
         variant: "destructive",
       });
       return;
     }
 
     try {
       await search(searchParams);
       setStep("results");
     } catch (error: any) {
       toast({
         title: "Search failed",
         description: error.message,
         variant: "destructive",
       });
     }
   };
 
   const handleImportSelected = async () => {
     if (!results?.leads || selectedLeads.size === 0) return;
 
     setIsImporting(true);
     const leadsToImport = results.leads.filter((l) => selectedLeads.has(l.id));
 
     setImportProgress({ current: 0, total: leadsToImport.length });
 
     let imported = 0;
     let failed = 0;
     let hotCount = 0;
     let warmCount = 0;
     let coldCount = 0;
 
     for (let i = 0; i < leadsToImport.length; i++) {
       const lead = leadsToImport[i];
       setImportProgress({ current: i + 1, total: leadsToImport.length });
 
       try {
         await createLead.mutateAsync({
           name: `${lead.firstName} ${lead.lastName}`,
           email: lead.email,
           phone: lead.phone,
           role: lead.role,
           company: lead.company,
           score: lead.scoreCategory,
           score_value: lead.score,
           is_starred: lead.scoreCategory === "hot",
           source: "ai-finder",
           notes: `Industry: ${lead.industry}\nLocation: ${lead.location}\nCompany Size: ${lead.companySize}\n\nAI Reasoning: ${lead.reasoning}`,
           ai_summary: lead.headline,
           linkedin_url: null,
           avatar_url: null,
           last_activity: null,
         });
 
         imported++;
         if (lead.scoreCategory === "hot") hotCount++;
         else if (lead.scoreCategory === "warm") warmCount++;
         else coldCount++;
       } catch {
         failed++;
       }
     }
 
     setIsImporting(false);
     setImportProgress({ current: 0, total: 0 });
 
     const scoreBreakdown = `🔥 ${hotCount} hot, 🌡️ ${warmCount} warm, ❄️ ${coldCount} cold`;
 
     toast({
       title: `Imported ${imported} AI-generated leads`,
       description: failed > 0
         ? `${failed} failed. ${scoreBreakdown}`
         : scoreBreakdown,
     });
 
     if (imported > 0) {
       clearSelection();
       setStep("search");
       setSearchParams({
         jobTitle: "",
         industry: "",
         location: "",
         companySize: "",
         keywords: "",
         count: 10,
       });
       onOpenChange(false);
     }
   };
 
   const leads = results?.leads || [];
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-lg mx-4 rounded-3xl bg-card border-border p-0 overflow-hidden max-h-[90vh]">
         <DialogHeader className="p-6 pb-0">
           <DialogTitle className="font-display text-xl flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
               <Brain className="w-5 h-5 text-white" />
             </div>
             AI Lead Finder
           </DialogTitle>
         </DialogHeader>
 
         <AnimatePresence mode="wait">
           {step === "search" ? (
             <motion.div
               key="search"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="p-6 space-y-4"
             >
               <div className="bg-primary/10 rounded-xl p-3 text-sm text-primary flex items-start gap-2">
                 <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                 <p>AI will generate targeted lead profiles based on your criteria, complete with contact info and quality scores.</p>
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="jobTitle">Job Title / Role</Label>
                 <Input
                   id="jobTitle"
                   value={searchParams.jobTitle}
                   onChange={(e) =>
                     setSearchParams((p) => ({ ...p, jobTitle: e.target.value }))
                   }
                   placeholder="e.g. CTO, VP Sales, HR Manager"
                   className="rounded-xl bg-secondary"
                 />
               </div>
 
               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-2">
                   <Label htmlFor="industry">Industry</Label>
                   <Input
                     id="industry"
                     value={searchParams.industry}
                     onChange={(e) =>
                       setSearchParams((p) => ({ ...p, industry: e.target.value }))
                     }
                     placeholder="e.g. SaaS, FinTech"
                     className="rounded-xl bg-secondary"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="location">Location</Label>
                   <Input
                     id="location"
                     value={searchParams.location}
                     onChange={(e) =>
                       setSearchParams((p) => ({ ...p, location: e.target.value }))
                     }
                     placeholder="e.g. San Francisco"
                     className="rounded-xl bg-secondary"
                   />
                 </div>
               </div>
 
               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-2">
                   <Label htmlFor="companySize">Company Size</Label>
                   <Select
                     value={searchParams.companySize}
                     onValueChange={(value) =>
                       setSearchParams((p) => ({ ...p, companySize: value }))
                     }
                   >
                     <SelectTrigger className="rounded-xl bg-secondary">
                       <SelectValue placeholder="Any size" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="1-10">1-10 employees</SelectItem>
                       <SelectItem value="11-50">11-50 employees</SelectItem>
                       <SelectItem value="51-200">51-200 employees</SelectItem>
                       <SelectItem value="201-500">201-500 employees</SelectItem>
                       <SelectItem value="501-1000">501-1000 employees</SelectItem>
                       <SelectItem value="1000+">1000+ employees</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="count">Number of Leads</Label>
                   <Select
                     value={String(searchParams.count)}
                     onValueChange={(value) =>
                       setSearchParams((p) => ({ ...p, count: Number(value) }))
                     }
                   >
                     <SelectTrigger className="rounded-xl bg-secondary">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="5">5 leads</SelectItem>
                       <SelectItem value="10">10 leads</SelectItem>
                       <SelectItem value="15">15 leads</SelectItem>
                       <SelectItem value="20">20 leads</SelectItem>
                       <SelectItem value="25">25 leads</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="keywords">Additional Keywords</Label>
                 <Input
                   id="keywords"
                   value={searchParams.keywords}
                   onChange={(e) =>
                     setSearchParams((p) => ({ ...p, keywords: e.target.value }))
                   }
                   placeholder="e.g. startup, Series A, hiring, decision-maker"
                   className="rounded-xl bg-secondary"
                 />
               </div>
 
               <Button
                 onClick={handleSearch}
                 disabled={isSearching}
                 className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 text-white font-semibold"
               >
                 {isSearching ? (
                   <>
                     <Loader2 className="w-5 h-5 animate-spin mr-2" />
                     AI is finding leads...
                   </>
                 ) : (
                   <>
                     <Sparkles className="w-5 h-5 mr-2" />
                     Find Leads with AI
                   </>
                 )}
               </Button>
             </motion.div>
           ) : (
             <motion.div
               key="results"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               className="flex flex-col"
             >
               {/* Results header */}
               <div className="px-6 py-3 border-b border-border flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium">
                     {leads.length} leads generated
                   </p>
                   <p className="text-xs text-muted-foreground">
                     {leads.filter((l) => l.scoreCategory === "hot").length} hot,{" "}
                     {leads.filter((l) => l.scoreCategory === "warm").length} warm,{" "}
                     {leads.filter((l) => l.scoreCategory === "cold").length} cold
                   </p>
                 </div>
                 <div className="flex items-center gap-2">
                   <button
                     onClick={() => selectAll(leads)}
                     className="text-xs text-primary hover:underline"
                   >
                     Select all
                   </button>
                   <span className="text-muted-foreground">|</span>
                   <button
                     onClick={clearSelection}
                     className="text-xs text-muted-foreground hover:text-foreground"
                   >
                     Clear
                   </button>
                 </div>
               </div>
 
               {/* Lead list */}
               <ScrollArea className="h-[340px]">
                 <div className="p-4 space-y-2">
                   {leads.map((lead) => (
                     <AILeadCard
                       key={lead.id}
                       lead={lead}
                       selected={selectedLeads.has(lead.id)}
                       onToggle={() => toggleLead(lead.id)}
                     />
                   ))}
                 </div>
               </ScrollArea>
 
               {/* Actions */}
               <div className="p-4 border-t border-border space-y-3">
                 {isImporting && importProgress.total > 0 && (
                   <div className="space-y-2">
                     <div className="flex items-center justify-between text-xs">
                       <span className="flex items-center gap-2">
                         <UserPlus className="w-3 h-3 text-primary animate-pulse" />
                         Importing lead {importProgress.current} of {importProgress.total}
                       </span>
                       <span className="text-muted-foreground">
                         {Math.round((importProgress.current / importProgress.total) * 100)}%
                       </span>
                     </div>
                     <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                       <motion.div
                         className="h-full bg-gradient-to-r from-primary to-cyan-400"
                         initial={{ width: 0 }}
                         animate={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                         transition={{ duration: 0.3 }}
                       />
                     </div>
                   </div>
                 )}
                 <div className="flex gap-3">
                   <Button
                     variant="outline"
                     onClick={() => setStep("search")}
                     disabled={isImporting}
                     className="flex-1 rounded-xl"
                   >
                     Back
                   </Button>
                   <Button
                     onClick={handleImportSelected}
                     disabled={selectedLeads.size === 0 || isImporting}
                     className="flex-1 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground"
                   >
                     {isImporting ? (
                       <>
                         <Loader2 className="w-4 h-4 animate-spin mr-2" />
                         Importing...
                       </>
                     ) : (
                       <>
                         <UserPlus className="w-4 h-4 mr-2" />
                         Import {selectedLeads.size > 0 ? `(${selectedLeads.size})` : ""}
                       </>
                     )}
                   </Button>
                 </div>
               </div>
             </motion.div>
           )}
         </AnimatePresence>
       </DialogContent>
     </Dialog>
   );
 }
 
 function AILeadCard({
   lead,
   selected,
   onToggle,
 }: {
   lead: AIGeneratedLead;
   selected: boolean;
   onToggle: () => void;
 }) {
   const scoreIcon = {
     hot: <Flame className="w-3 h-3" />,
     warm: <ThermometerSun className="w-3 h-3" />,
     cold: <Snowflake className="w-3 h-3" />,
   };
 
   const scoreColor = {
     hot: "bg-red-500/10 text-red-500 border-red-500/20",
     warm: "bg-amber-500/10 text-amber-500 border-amber-500/20",
     cold: "bg-blue-500/10 text-blue-500 border-blue-500/20",
   };
 
   return (
     <motion.button
       onClick={onToggle}
       whileTap={{ scale: 0.98 }}
       className={cn(
         "w-full p-3 rounded-2xl border text-left transition-all",
         selected
           ? "bg-primary/10 border-primary/30"
           : "bg-secondary/50 border-border hover:border-primary/20"
       )}
     >
       <div className="flex items-start gap-3">
         <div className="relative">
           <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-400/20 flex items-center justify-center text-lg font-semibold">
             {lead.firstName[0]}
             {lead.lastName[0]}
           </div>
           {selected && (
             <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
               <Check className="w-3 h-3 text-primary-foreground" />
             </div>
           )}
         </div>
 
         <div className="flex-1 min-w-0">
           <div className="flex items-center gap-2">
             <p className="font-semibold truncate">
               {lead.firstName} {lead.lastName}
             </p>
             <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", scoreColor[lead.scoreCategory])}>
               {scoreIcon[lead.scoreCategory]}
               <span className="ml-1">{lead.score}</span>
             </Badge>
           </div>
           <p className="text-sm text-muted-foreground truncate">
             {lead.role} at {lead.company}
           </p>
           <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
             <span className="flex items-center gap-1">
               <Mail className="w-3 h-3" />
               {lead.email.split("@")[0]}@...
             </span>
             <span className="flex items-center gap-1">
               <Phone className="w-3 h-3" />
               {lead.phone.slice(0, 6)}...
             </span>
           </div>
         </div>
       </div>
     </motion.button>
   );
 }