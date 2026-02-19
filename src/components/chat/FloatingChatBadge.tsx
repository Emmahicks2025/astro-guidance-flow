import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSeekerConversations, SeekerConversation } from "@/hooks/useSeekerConversations";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface FloatingChatBadgeProps {
  onOpenChat: (conversation: SeekerConversation) => void;
}

const FloatingChatBadge = ({ onOpenChat }: FloatingChatBadgeProps) => {
  const { conversations, totalUnread, markAsRead } = useSeekerConversations();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (conversations.length === 0) return null;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
        {totalUnread > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center animate-pulse">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </motion.button>

      {/* Conversation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-40 right-4 z-40 w-80 max-h-96 bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-3 border-b border-border bg-muted/50">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Active Chats</h4>
                <button
                  onClick={() => navigate('/messages')}
                  className="text-xs text-primary font-medium"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-72">
              {conversations.map((convo) => (
                <button
                  key={convo.consultationId}
                  className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0 text-left"
                  onClick={() => {
                    setIsOpen(false);
                    markAsRead(convo.consultationId);
                    onOpenChat(convo);
                  }}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={convo.expertAvatar} alt={convo.expertName} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
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
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">{convo.expertName}</span>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-1">
                        {formatDistanceToNow(new Date(convo.lastMessageAt), { addSuffix: false })}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${convo.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {convo.lastMessageSenderId === '' ? convo.lastMessage : 
                        convo.lastMessage.length > 40 ? convo.lastMessage.slice(0, 40) + '...' : convo.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatBadge;
