import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ExpertReviewsProps {
  expertId: string;
}

interface Review {
  id: string;
  rating: number;
  feedback: string | null;
  created_at: string;
  user_name?: string;
}

export function ExpertReviews({ expertId }: ExpertReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .eq("expert_id", expertId)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(10);
        if (error) throw error;

        const reviewsData = (data || []) as any[];
        const userIds = [...new Set(reviewsData.map((r: any) => r.user_id))];
        
        let userMap = new Map();
        if (userIds.length > 0) {
          const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
          userMap = new Map((profiles || []).map((p: any) => [p.user_id, p.full_name]));
        }

        setReviews(reviewsData.map((r: any) => ({
          ...r,
          user_name: userMap.get(r.user_id) || "Anonymous",
        })));
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [expertId]);

  if (loading || reviews.length === 0) return null;

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="mt-3 pt-3 border-t border-border/30">
      <div className="flex items-center gap-2 mb-2">
        <Star className="w-4 h-4 text-accent fill-accent" />
        <span className="text-sm font-semibold">{avgRating}</span>
        <span className="text-xs text-muted-foreground">({reviews.length} review{reviews.length > 1 ? 's' : ''})</span>
      </div>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {reviews.slice(0, 3).map((review) => (
          <div key={review.id} className="text-xs">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-accent fill-accent' : 'text-muted-foreground/20'}`} />
              ))}
              <span className="ml-1 text-muted-foreground">{review.user_name}</span>
            </div>
            {review.feedback && (
              <p className="text-muted-foreground mt-0.5 line-clamp-2">"{review.feedback}"</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
