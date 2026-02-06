 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 interface SearchParams {
   jobTitle?: string;
   industry?: string;
   location?: string;
   companySize?: string;
   keywords?: string;
   count?: number;
 }
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const authHeader = req.headers.get("Authorization");
     if (!authHeader?.startsWith("Bearer ")) {
       return new Response(JSON.stringify({ error: "Unauthorized" }), {
         status: 401,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
 
     const supabase = createClient(supabaseUrl, supabaseAnonKey, {
       global: { headers: { Authorization: authHeader } },
     });
 
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
 
     const params: SearchParams = await req.json();
     const { jobTitle, industry, location, companySize, keywords, count = 10 } = params;
 
     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
     if (!LOVABLE_API_KEY) {
       throw new Error("LOVABLE_API_KEY is not configured");
     }
 
     const systemPrompt = `You are a B2B lead generation AI. Generate realistic, diverse lead profiles based on the search criteria. Each lead should have unique characteristics.
 
 For each lead, provide:
 - firstName, lastName: Realistic names (diverse backgrounds)
 - email: Plausible business email format (first.last@company.com or similar)
 - phone: Phone number with country code (format: +1234567890)
 - role: Job title matching or related to the criteria
 - company: Real-sounding company name
 - industry: The industry they work in
 - location: City, Country format
 - headline: A LinkedIn-style professional headline
 - companySize: estimated employee count (e.g., "50-200", "1000+")
 - score: A lead quality score from 0-100 based on fit
 - scoreCategory: "hot" (80+), "warm" (50-79), or "cold" (<50)
 - reasoning: Brief explanation of why they're a good lead
 
 Make leads realistic and varied. Include a mix of score categories based on how well they match the criteria.`;
 
     const userPrompt = `Generate ${Math.min(count, 25)} B2B lead profiles matching these criteria:
 
 Job Title: ${jobTitle || "Any decision-maker"}
 Industry: ${industry || "Any"}
 Location: ${location || "Any"}
 Company Size: ${companySize || "Any"}
 Keywords: ${keywords || "None specified"}
 
 Return a JSON object with a "leads" array containing the lead profiles. Each lead must have: firstName, lastName, email, phone, role, company, industry, location, headline, companySize, score, scoreCategory, reasoning.`;
 
     const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
       method: "POST",
       headers: {
         Authorization: `Bearer ${LOVABLE_API_KEY}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         model: "google/gemini-3-flash-preview",
         messages: [
           { role: "system", content: systemPrompt },
           { role: "user", content: userPrompt },
         ],
         temperature: 0.9,
         max_tokens: 4000,
       }),
     });
 
     if (!response.ok) {
       if (response.status === 429) {
         return new Response(
           JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
           { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
         );
       }
       if (response.status === 402) {
         return new Response(
           JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
           { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
         );
       }
       const errorText = await response.text();
       console.error("AI gateway error:", response.status, errorText);
       throw new Error("Failed to generate leads");
     }
 
     const data = await response.json();
     const content = data.choices?.[0]?.message?.content || "";
 
     // Parse the JSON from the response
     let leads = [];
     try {
       const jsonMatch = content.match(/\{[\s\S]*\}/);
       if (jsonMatch) {
         const parsed = JSON.parse(jsonMatch[0]);
         leads = parsed.leads || [];
       }
     } catch (parseError) {
       console.error("Failed to parse AI response:", parseError);
       // Try to extract array directly
       const arrayMatch = content.match(/\[[\s\S]*\]/);
       if (arrayMatch) {
         leads = JSON.parse(arrayMatch[0]);
       }
     }
 
     // Add unique IDs to each lead
     leads = leads.map((lead: any, index: number) => ({
       ...lead,
       id: `ai-${Date.now()}-${index}`,
       source: "ai-generated",
     }));
 
     return new Response(
       JSON.stringify({
         leads,
         total: leads.length,
         searchParams: params,
       }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error) {
     console.error("ai-lead-finder error:", error);
     return new Response(
       JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });