import { supabase } from "@/integrations/supabase/client";

/**
 * Send a push notification to a user via the edge function.
 * Fails silently — notifications are best-effort.
 */
export async function sendPushToUser(
  recipientUserId: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  try {
    const session = await supabase.auth.getSession();
    const accessToken = session.data.session?.access_token;
    if (!accessToken) return;

    await supabase.functions.invoke("send-push-notification", {
      body: { recipientUserId, title, body, data },
    });
  } catch (err) {
    console.error("Push notification send failed (non-blocking):", err);
  }
}
