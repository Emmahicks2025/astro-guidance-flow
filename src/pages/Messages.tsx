import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSeekerConversations, SeekerConversation } from "@/hooks/useSeekerConversations";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { SpiritualCard } from "@/components/ui/spiritual-card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { ExpertConsultationDialog } from "@/components/consultation/ExpertConsultationDialog";
import { supabase } from "@/integrations/supabase/client";

const Messages = () => {
  const navigate = useNavigate();
  const { conversations, totalUnread, loading } = useSeekerConversations();
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openConversation = async (convo: SeekerConversation) => {
    // Build expert object from conversation data to open the dialog
    const { data: jotshiProfile } = await supabase
      .from('jotshi_profiles')
      .select('*')
      .eq('user_id', convo.expertId)
      .maybeSingle();

    if (jotshiProfile) {
      setSelectedExpert({
        id: jotshiProfile.id,
        name: jotshiProfile.display_name || 'Expert',
        specialty: jotshiProfile.specialty || 'Astrology',
        experience: `${jotshiProfile.experience_years || 0}+ years`,
        rating: Number(jotshiProfile.rating) || 0,
        rate: jotshiProfile.hourly_rate || 20,
        status: jotshiProfile.is_online ? 'online' as const : 'offline' as const,
        avatar: jotshiProfile.avatar_url || '',
        category: jotshiProfile.category || 'astrologer',
        languages: jotshiProfile.languages || ['Hindi', 'English'],
        sessions: jotshiProfile.total_sessions || 0,
        ai_personality: jotshiProfile.ai_personality || undefined,
        voice_id: jotshiProfile.voice_id || undefined,
        user_id: jotshiProfile.user_id || undefined,
        first_message: jotshiProfile.first_message || undefined,
      });
      setDialogOpen(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border safe-area-top">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <SpiritualButton variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </SpiritualButton>
          <div className="flex-1">
            <h1 className="text-lg font-bold font-display">Messages</h1>
            {totalUnread > 0 && (
              <p className="text-xs text-muted-foreground">{totalUnread} unread</p>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No conversations yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Start chatting with an expert from the Talk to Jotshi section
            </p>
            <SpiritualButton onClick={() => navigate('/talk')}>
              Find an Expert
            </SpiritualButton>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((convo) => (
              <SpiritualCard
                key={convo.consultationId}
                interactive
                className="cursor-pointer"
                onClick={() => openConversation(convo)}
              >
                <div className="p-4 flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={convo.expertAvatar} alt={convo.expertName} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {convo.expertName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {convo.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`font-medium text-sm ${convo.unreadCount > 0 ? 'text-foreground' : 'text-foreground/80'}`}>
                        {convo.expertName}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-2">
                        {formatDistanceToNow(new Date(convo.lastMessageAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate ${convo.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {convo.lastMessage}
                      </p>
                      {convo.unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2 text-[10px] h-5 min-w-5 flex items-center justify-center">
                          {convo.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{convo.expertSpecialty}</span>
                  </div>
                </div>
              </SpiritualCard>
            ))}
          </div>
        )}
      </main>

      {/* Expert Consultation Dialog */}
      <ExpertConsultationDialog
        expert={selectedExpert}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialTab="chat"
      />
    </motion.div>
  );
};

export default Messages;
