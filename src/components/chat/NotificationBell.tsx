import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { useSeekerConversations, SeekerConversation } from "@/hooks/useSeekerConversations";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface NotificationBellProps {
  onOpenChat: (conversation: SeekerConversation) => void;
}

const NotificationBell = ({ onOpenChat }: NotificationBellProps) => {
  const { conversations, totalUnread, markAsRead } = useSeekerConversations();
  const [isOpen, setIsOpen] = useState(false);

  const unreadConversations = conversations.filter(c => c.unreadCount > 0);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
      >
        <Bell className="w-5 h-5" />
        {totalUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-border">
                <h4 className="font-semibold text-sm">Notifications</h4>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {unreadConversations.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No new messages
                  </div>
                ) : (
                  unreadConversations.map((convo) => (
                    <button
                      key={convo.consultationId}
                      className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0 text-left"
                      onClick={() => {
                        setIsOpen(false);
                        markAsRead(convo.consultationId);
                        onOpenChat(convo);
                      }}
                    >
                      <Avatar className="w-9 h-9 flex-shrink-0">
                        <AvatarImage src={convo.expertAvatar} alt={convo.expertName} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {convo.expertName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{convo.expertName}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(convo.lastMessageAt), { addSuffix: false })}
                          </span>
                        </div>
                        <p className="text-xs text-foreground font-medium truncate">
                          {convo.unreadCount} new message{convo.unreadCount > 1 ? 's' : ''}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
