import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SeekerConversation {
  consultationId: string;
  expertId: string;
  expertName: string;
  expertAvatar: string;
  expertSpecialty: string;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageSenderId: string;
  unreadCount: number;
  status: string;
}

export const useSeekerConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<SeekerConversation[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    try {
      // Get all active/waiting consultations for this user
      const { data: consultations, error: cErr } = await supabase
        .from('consultations')
        .select('id, jotshi_id, status, created_at')
        .eq('user_id', user.id)
        .in('status', ['waiting', 'active'])
        .order('created_at', { ascending: false });

      if (cErr || !consultations?.length) {
        setConversations([]);
        setTotalUnread(0);
        setLoading(false);
        return;
      }

      // Get expert profiles for all jotshi_ids
      const jotshiIds = [...new Set(consultations.map(c => c.jotshi_id))];
      const { data: experts } = await supabase
        .from('jotshi_profiles')
        .select('user_id, display_name, avatar_url, specialty')
        .in('user_id', jotshiIds);

      const expertMap = new Map(
        (experts || []).map(e => [e.user_id, e])
      );

      // Get last message for each consultation + unread count
      const convos: SeekerConversation[] = [];

      for (const c of consultations) {
        const expert = expertMap.get(c.jotshi_id);

        // Get last message
        const { data: lastMsgs } = await supabase
          .from('messages')
          .select('content, created_at, sender_id')
          .eq('consultation_id', c.id)
          .order('created_at', { ascending: false })
          .limit(1);

        const lastMsg = lastMsgs?.[0];

        // Count unread (messages from expert that are newer than any user message)
        // Simple approach: count messages from expert after user's last message
        const { data: userLastMsg } = await supabase
          .from('messages')
          .select('created_at')
          .eq('consultation_id', c.id)
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        let unreadCount = 0;
        if (userLastMsg?.[0]) {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('consultation_id', c.id)
            .neq('sender_id', user.id)
            .gt('created_at', userLastMsg[0].created_at);
          unreadCount = count || 0;
        } else {
          // User hasn't sent any message — all expert messages are "unread"
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('consultation_id', c.id)
            .neq('sender_id', user.id);
          unreadCount = count || 0;
        }

        convos.push({
          consultationId: c.id,
          expertId: c.jotshi_id,
          expertName: expert?.display_name || 'Expert',
          expertAvatar: expert?.avatar_url || '',
          expertSpecialty: expert?.specialty || 'Astrology',
          lastMessage: lastMsg?.content || 'Start a conversation...',
          lastMessageAt: lastMsg?.created_at || c.created_at,
          lastMessageSenderId: lastMsg?.sender_id || '',
          unreadCount,
          status: c.status,
        });
      }

      setConversations(convos);
      setTotalUnread(convos.reduce((sum, c) => sum + c.unreadCount, 0));
    } catch (err) {
      console.error('Error fetching seeker conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Subscribe to new messages for real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('seeker-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        // Refetch to update unread counts and last messages
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchConversations]);

  return { conversations, totalUnread, loading, refetch: fetchConversations };
};
