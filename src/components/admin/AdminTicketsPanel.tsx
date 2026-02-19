import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Ticket, Search, Clock, CheckCircle, XCircle, DollarSign,
  MessageCircle, ChevronDown, ChevronUp, Loader2, User
} from "lucide-react";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { SpiritualInput } from "@/components/ui/spiritual-input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string | null;
  ticket_type: string;
  status: string;
  amount_requested: number | null;
  payment_method: string | null;
  payment_details: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  user_name?: string;
}

const statusColors: Record<string, string> = {
  open: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  in_progress: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  resolved: "bg-green-500/10 text-green-600 border-green-500/30",
  rejected: "bg-red-500/10 text-red-600 border-red-500/30",
};

const AdminTicketsPanel = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data: ticketData, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user names
      const userIds = [...new Set((ticketData || []).map((t) => t.user_id))];
      let userMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);
        if (profiles) {
          profiles.forEach((p) => { userMap[p.user_id] = p.full_name || "Unknown"; });
        }
      }

      setTickets(
        (ticketData || []).map((t) => ({ ...t, user_name: userMap[t.user_id] || "Unknown" }))
      );
    } catch {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    setUpdatingId(ticketId);
    try {
      const updates: Record<string, string> = { status: newStatus };
      if (adminNotes[ticketId]) updates.admin_notes = adminNotes[ticketId];

      const { error } = await supabase
        .from("support_tickets")
        .update(updates)
        .eq("id", ticketId);

      if (error) throw error;

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, status: newStatus, admin_notes: adminNotes[ticketId] || t.admin_notes }
            : t
        )
      );
      toast.success(`Ticket ${newStatus === "resolved" ? "resolved" : newStatus === "rejected" ? "rejected" : "updated"}`);
    } catch {
      toast.error("Failed to update ticket");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || t.ticket_type === filterType;
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const openCount = tickets.filter((t) => t.status === "open").length;
  const payoutCount = tickets.filter((t) => t.ticket_type === "payout" && t.status === "open").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <SpiritualCard variant="elevated">
          <SpiritualCardContent className="p-3 text-center">
            <Ticket className="w-5 h-5 mx-auto mb-1 text-amber-500" />
            <p className="text-xl font-bold">{openCount}</p>
            <p className="text-xs text-muted-foreground">Open</p>
          </SpiritualCardContent>
        </SpiritualCard>
        <SpiritualCard variant="elevated">
          <SpiritualCardContent className="p-3 text-center">
            <DollarSign className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <p className="text-xl font-bold">{payoutCount}</p>
            <p className="text-xs text-muted-foreground">Payouts</p>
          </SpiritualCardContent>
        </SpiritualCard>
        <SpiritualCard variant="elevated">
          <SpiritualCardContent className="p-3 text-center">
            <MessageCircle className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold">{tickets.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </SpiritualCardContent>
        </SpiritualCard>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <SpiritualInput
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="payout">Payouts</SelectItem>
            <SelectItem value="support">Support</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {filtered.map((ticket) => (
          <motion.div key={ticket.id} layout>
            <SpiritualCard variant="elevated" className="overflow-hidden">
              <SpiritualCardContent className="p-0">
                <button
                  className="w-full p-4 text-left flex items-start gap-3"
                  onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ticket.ticket_type === "payout" ? "bg-green-500/10" : "bg-primary/10"}`}>
                    {ticket.ticket_type === "payout" ? (
                      <DollarSign className="w-5 h-5 text-green-600" />
                    ) : (
                      <MessageCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate text-sm">{ticket.subject}</h4>
                      <Badge variant="outline" className={`text-[10px] shrink-0 ${statusColors[ticket.status] || ""}`}>
                        {ticket.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{ticket.user_name}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(ticket.created_at).toLocaleDateString()}</span>
                      {ticket.amount_requested && (
                        <span className="font-medium text-green-600">${ticket.amount_requested}</span>
                      )}
                    </div>
                  </div>
                  {expandedId === ticket.id ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
                </button>

                {expandedId === ticket.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="px-4 pb-4 border-t border-border space-y-3"
                  >
                    {ticket.description && (
                      <div className="pt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                        <p className="text-sm">{ticket.description}</p>
                      </div>
                    )}
                    {ticket.ticket_type === "payout" && (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Amount</p>
                          <p className="font-semibold text-green-600">${ticket.amount_requested || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Method</p>
                          <p className="font-medium">{ticket.payment_method || "N/A"}</p>
                        </div>
                        {ticket.payment_details && (
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground">Payment Details</p>
                            <p className="font-medium text-sm">{ticket.payment_details}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin notes */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Admin Notes</p>
                      <Textarea
                        value={adminNotes[ticket.id] ?? ticket.admin_notes ?? ""}
                        onChange={(e) => setAdminNotes((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                        rows={2}
                        placeholder="Add notes..."
                        className="text-sm"
                      />
                    </div>

                    {/* Actions */}
                    {ticket.status !== "resolved" && ticket.status !== "rejected" && (
                      <div className="flex gap-2">
                        <SpiritualButton
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          disabled={updatingId === ticket.id}
                          onClick={() => handleUpdateStatus(ticket.id, "resolved")}
                        >
                          {updatingId === ticket.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          Resolve
                        </SpiritualButton>
                        <SpiritualButton
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          disabled={updatingId === ticket.id}
                          onClick={() => handleUpdateStatus(ticket.id, "rejected")}
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </SpiritualButton>
                        {ticket.status === "open" && (
                          <SpiritualButton
                            variant="soft"
                            size="sm"
                            disabled={updatingId === ticket.id}
                            onClick={() => handleUpdateStatus(ticket.id, "in_progress")}
                          >
                            In Progress
                          </SpiritualButton>
                        )}
                      </div>
                    )}
                    {(ticket.status === "resolved" || ticket.status === "rejected") && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {ticket.status === "resolved" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                        Ticket {ticket.status}
                      </div>
                    )}
                  </motion.div>
                )}
              </SpiritualCardContent>
            </SpiritualCard>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <SpiritualCard variant="elevated">
            <SpiritualCardContent className="p-8 text-center">
              <Ticket className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No tickets found</p>
            </SpiritualCardContent>
          </SpiritualCard>
        )}
      </div>
    </div>
  );
};

export default AdminTicketsPanel;
