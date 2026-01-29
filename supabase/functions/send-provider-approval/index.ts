import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { providerId, providerName, action } = await req.json();

    if (!providerId || !action) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get provider details including user email
    const { data: provider, error: providerError } = await supabase
      .from("jotshi_profiles")
      .select("*, user_id")
      .eq("id", providerId)
      .single();

    if (providerError || !provider) {
      console.error("Provider not found:", providerError);
      return new Response(
        JSON.stringify({ error: "Provider not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If provider has a user_id, get their email
    let userEmail = null;
    if (provider.user_id) {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
        provider.user_id
      );
      
      if (!userError && userData?.user?.email) {
        userEmail = userData.user.email;
      }
    }

    // Log the notification (in production, integrate with an email service)
    console.log(`Provider ${action}:`, {
      providerId,
      providerName: providerName || provider.display_name,
      userEmail,
      action,
      timestamp: new Date().toISOString()
    });

    // For now, we'll log the email that would be sent
    // In production, integrate with Resend, SendGrid, etc.
    const emailContent = action === "approved" 
      ? {
          subject: "🎉 Your Provider Application Has Been Approved!",
          body: `
            Congratulations ${providerName || "Provider"}!
            
            Your application to become a service provider on our platform has been approved.
            
            You can now:
            - Log in to your provider dashboard
            - Set your availability
            - Start accepting consultations
            
            Welcome to the team!
          `
        }
      : {
          subject: "Provider Application Update",
          body: `
            Dear ${providerName || "Applicant"},
            
            Thank you for your interest in becoming a service provider on our platform.
            
            After careful review, we regret to inform you that your application has not been approved at this time.
            
            You may reapply in the future with updated credentials and experience.
            
            Best regards,
            The Admin Team
          `
        };

    console.log("Email would be sent:", {
      to: userEmail || "No email available",
      ...emailContent
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Provider ${action} notification processed`,
        emailSent: !!userEmail
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error processing approval notification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
