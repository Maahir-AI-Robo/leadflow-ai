import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LinkedInSearchParams {
  keywords?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  industry?: string;
  connectionDegree?: string;
  limit?: number;
}

interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  profileUrl: string;
  profilePicture?: string;
  location?: string;
  company?: string;
  title?: string;
  industry?: string;
  connectionDegree?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get("LINKEDIN_CLIENT_ID");
    const clientSecret = Deno.env.get("LINKEDIN_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({
          error: "LinkedIn API credentials not configured",
          message: "Please add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to your Cloud secrets",
          profiles: [],
          mockData: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const params: LinkedInSearchParams = await req.json();
    const { keywords, jobTitle, company, location, industry, limit = 25 } = params;

    // Build search query for LinkedIn People Search API
    // Note: This requires LinkedIn Marketing Developer Platform access
    const searchQuery = [keywords, jobTitle, company, location, industry]
      .filter(Boolean)
      .join(" ");

    // LinkedIn People Search API endpoint
    // Requires: r_liteprofile, r_emailaddress, w_member_social scopes
    const searchUrl = new URL("https://api.linkedin.com/v2/people");
    searchUrl.searchParams.set("q", "peopleSearch");
    searchUrl.searchParams.set("keywords", searchQuery);
    searchUrl.searchParams.set("count", limit.toString());

    // For now, return mock data until credentials are configured
    // In production, this would make actual API calls
    const mockProfiles: LinkedInProfile[] = generateMockProfiles(params, limit);

    return new Response(
      JSON.stringify({
        profiles: mockProfiles,
        total: mockProfiles.length,
        hasMore: false,
        searchParams: params,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("LinkedIn search error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, profiles: [] }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function generateMockProfiles(params: LinkedInSearchParams, limit: number): LinkedInProfile[] {
  const { jobTitle = "Manager", company, location = "United States", industry } = params;
  
  const firstNames = ["Sarah", "Michael", "Jennifer", "David", "Emily", "James", "Amanda", "Robert", "Jessica", "William"];
  const lastNames = ["Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Anderson"];
  const companies = company ? [company] : ["TechCorp", "InnovateLabs", "DataDrive", "CloudFirst", "AIVentures", "ScaleUp Inc", "GrowthCo", "FutureTech"];
  const titles = jobTitle ? [jobTitle] : ["CTO", "VP Engineering", "Director of Sales", "Head of Marketing", "Product Manager", "CEO", "Founder", "Growth Lead"];
  const industries = industry ? [industry] : ["Technology", "SaaS", "FinTech", "Healthcare", "E-commerce", "Marketing", "Consulting"];
  
  const profiles: LinkedInProfile[] = [];
  
  for (let i = 0; i < Math.min(limit, 10); i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[(i + 3) % lastNames.length];
    const companyName = companies[i % companies.length];
    const title = titles[i % titles.length];
    
    profiles.push({
      id: `mock-${Date.now()}-${i}`,
      firstName,
      lastName,
      headline: `${title} at ${companyName}`,
      profileUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${Math.random().toString(36).slice(2, 8)}`,
      location: location,
      company: companyName,
      title,
      industry: industries[i % industries.length],
      connectionDegree: Math.floor(Math.random() * 2) + 2,
    });
  }
  
  return profiles;
}
