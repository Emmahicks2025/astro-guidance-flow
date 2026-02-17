import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth token
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, receipt_data, product_id, transaction_id } = await req.json();

    if (action === "validate_subscription") {
      // In production, validate with Apple's App Store Server API
      // For now, we trust the client-side StoreKit validation and record it
      const { data: plan } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("apple_product_id", product_id)
        .single();

      if (!plan) {
        return new Response(JSON.stringify({ error: "Invalid product" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Upsert subscription
      const { data: existingSub } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (existingSub) {
        await supabase
          .from("user_subscriptions")
          .update({
            plan_id: plan.id,
            apple_transaction_id: transaction_id,
            status: "active",
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq("id", existingSub.id);
      } else {
        await supabase.from("user_subscriptions").insert({
          user_id: user.id,
          plan_id: plan.id,
          apple_transaction_id: transaction_id,
          status: "active",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      // Grant monthly credits
      const { data: balance } = await supabase
        .from("credit_balances")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (balance) {
        await supabase
          .from("credit_balances")
          .update({
            balance: balance.balance + plan.monthly_credits,
            lifetime_earned: balance.lifetime_earned + plan.monthly_credits,
          })
          .eq("user_id", user.id);
      } else {
        await supabase.from("credit_balances").insert({
          user_id: user.id,
          balance: plan.monthly_credits,
          lifetime_earned: plan.monthly_credits,
        });
      }

      // Log transaction
      await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        amount: plan.monthly_credits,
        transaction_type: "subscription_credit",
        description: `${plan.name} subscription - ${plan.monthly_credits} credits`,
        apple_transaction_id: transaction_id,
      });

      return new Response(JSON.stringify({ success: true, plan: plan.name, credits_added: plan.monthly_credits }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "validate_topup") {
      const { data: pack } = await supabase
        .from("topup_packs")
        .select("*")
        .eq("apple_product_id", product_id)
        .single();

      if (!pack) {
        return new Response(JSON.stringify({ error: "Invalid product" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const totalCredits = pack.credits + pack.bonus_credits;

      // Add credits
      const { data: balance } = await supabase
        .from("credit_balances")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (balance) {
        await supabase
          .from("credit_balances")
          .update({
            balance: balance.balance + totalCredits,
            lifetime_earned: balance.lifetime_earned + totalCredits,
          })
          .eq("user_id", user.id);
      } else {
        await supabase.from("credit_balances").insert({
          user_id: user.id,
          balance: totalCredits,
          lifetime_earned: totalCredits,
        });
      }

      // Log transaction
      await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        amount: totalCredits,
        transaction_type: "topup",
        description: `Credit top-up: ${pack.credits} + ${pack.bonus_credits} bonus`,
        apple_transaction_id: transaction_id,
      });

      return new Response(JSON.stringify({ success: true, credits_added: totalCredits }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_status") {
      const { data: balance } = await supabase
        .from("credit_balances")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select("*, subscription_plans(*)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      return new Response(JSON.stringify({
        balance: balance?.balance ?? 50,
        subscription: subscription ? {
          plan: subscription.plan_id,
          plan_name: (subscription as any).subscription_plans?.name,
          expires_at: subscription.expires_at,
        } : { plan: "free", plan_name: "Free" },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
