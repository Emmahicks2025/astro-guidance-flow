import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the user first with their JWT
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to delete user data and account
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Delete all user data from every table (order matters for foreign keys)
    // First delete messages (references consultations)
    const { data: userConsultations } = await adminClient
      .from("consultations")
      .select("id")
      .or(`user_id.eq.${user.id},jotshi_id.eq.${user.id}`);
    
    if (userConsultations && userConsultations.length > 0) {
      const consultationIds = userConsultations.map((c: any) => c.id);
      await adminClient.from("messages").delete().in("consultation_id", consultationIds);
      await adminClient.from("reviews").delete().in("consultation_id", consultationIds);
    }

    // Delete from all user-linked tables
    await adminClient.from("wallet_transactions").delete().eq("user_id", user.id);
    await adminClient.from("consultations").delete().eq("user_id", user.id);
    await adminClient.from("consultations").delete().eq("jotshi_id", user.id);
    await adminClient.from("credit_balances").delete().eq("user_id", user.id);
    await adminClient.from("device_tokens").delete().eq("user_id", user.id);
    await adminClient.from("conversation_memories").delete().eq("user_id", user.id);
    await adminClient.from("user_subscriptions").delete().eq("user_id", user.id);
    await adminClient.from("support_tickets").delete().eq("user_id", user.id);
    await adminClient.from("reviews").delete().eq("user_id", user.id);
    await adminClient.from("jotshi_profiles").delete().eq("user_id", user.id);
    await adminClient.from("user_roles").delete().eq("user_id", user.id);
    await adminClient.from("profiles").delete().eq("user_id", user.id);

    // Delete avatar files from storage
    const buckets = ["user-avatars", "provider-avatars"];
    for (const bucket of buckets) {
      const { data: files } = await adminClient.storage.from(bucket).list(user.id);
      if (files && files.length > 0) {
        const filePaths = files.map((f: any) => `${user.id}/${f.name}`);
        await adminClient.storage.from(bucket).remove(filePaths);
      }
    }

    // Delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) {
      return new Response(JSON.stringify({ error: "Failed to delete account" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
