import { useState, useEffect } from "react";
import { Star, Check, X, Search, Filter } from "lucide-react";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { SpiritualInput } from "@/components/ui/spiritual-input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Review {
  id: string;
  consultation_id: string;
  user_id: string;
  expert_id: string;
  rating: number;
  feedback: string | null;
  status: string;
  created_at: string;
  user_name?: string;
  expert_name?: string;
}

export default function AdminReviewsPanel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reviews" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const reviewsData = (data || []) as any[];
      
      // Fetch user and expert names
      const userIds = [...new Set(reviewsData.map((r: any) => r.user_id))];
      const expertIds = [...new Set(reviewsData.map((r: any) => r.expert_id))];

      const [profilesRes, expertsRes] = await Promise.all([
        userIds.length > 0 ? supabase.from("profiles").select("user_id, full_name").in("user_id", userIds) : { data: [] },
        expertIds.length > 0 ? supabase.from("jotshi_profiles").select("id, display_name").in("id", expertIds) : { data: [] },
      ]);

      const userMap = new Map((profilesRes.data || []).map((p: any) => [p.user_id, p.full_name]));
      const expertMap = new Map((expertsRes.data || []).map((e: any) => [e.id, e.display_name]));

      setReviews(reviewsData.map((r: any) => ({
        ...r,
        user_name: userMap.get(r.user_id) || "Unknown User",
        expert_name: expertMap.get(r.expert_id) || "Unknown Expert",
      })));
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleUpdateStatus = async (reviewId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("reviews" as any)
        .update({ status: newStatus })
        .eq("id", reviewId);
      if (error) throw error;
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status: newStatus } : r));
      toast.success(`Review ${newStatus}`);
    } catch {
      toast.error("Failed to update review");
    }
  };

  const filtered = reviews.filter(r => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesSearch = !searchQuery || 
      r.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.expert_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.feedback?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusColor = (s: string) => {
    if (s === 'approved') return 'bg-green-500/10 text-green-600 border-green-500/30';
    if (s === 'rejected') return 'bg-destructive/10 text-destructive border-destructive/30';
    return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <SpiritualInput placeholder="Search reviews..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <SpiritualCard variant="elevated">
          <SpiritualCardContent className="p-8 text-center">
            <Star className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No reviews found</p>
          </SpiritualCardContent>
        </SpiritualCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <SpiritualCard key={review.id} variant="elevated" className="border border-border/30">
              <SpiritualCardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-sm">{review.user_name}</p>
                    <p className="text-xs text-muted-foreground">→ {review.expert_name}</p>
                  </div>
                  <Badge className={`text-xs ${statusColor(review.status)}`}>{review.status}</Badge>
                </div>
                
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-accent fill-accent' : 'text-muted-foreground/20'}`} />
                  ))}
                  <span className="text-sm font-medium ml-1">{review.rating}/5</span>
                </div>

                {review.feedback && (
                  <p className="text-sm text-muted-foreground mb-3 bg-muted/50 p-2 rounded-lg">"{review.feedback}"</p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                  {review.status === 'pending' && (
                    <div className="flex gap-2">
                      <SpiritualButton variant="outline" size="sm" onClick={() => handleUpdateStatus(review.id, 'approved')}>
                        <Check className="w-4 h-4 mr-1 text-green-500" /> Approve
                      </SpiritualButton>
                      <SpiritualButton variant="outline" size="sm" onClick={() => handleUpdateStatus(review.id, 'rejected')}>
                        <X className="w-4 h-4 mr-1 text-destructive" /> Reject
                      </SpiritualButton>
                    </div>
                  )}
                </div>
              </SpiritualCardContent>
            </SpiritualCard>
          ))}
        </div>
      )}
    </div>
  );
}
