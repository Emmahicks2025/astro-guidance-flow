import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultationId: string;
  expertId: string;
  expertName: string;
  userId: string;
}

export function ReviewDialog({ open, onOpenChange, consultationId, expertId, expertName, userId }: ReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews" as any).insert({
        consultation_id: consultationId,
        user_id: userId,
        expert_id: expertId,
        rating,
        feedback: feedback.trim() || null,
        status: 'pending',
      });
      if (error) throw error;
      toast.success("Thank you for your review! 🙏");
      onOpenChange(false);
    } catch (err: any) {
      if (err?.code === '23505') {
        toast.info("You've already reviewed this consultation");
        onOpenChange(false);
      } else {
        console.error("Review error:", err);
        toast.error("Failed to submit review");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Rate your experience</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <p className="text-center text-sm text-muted-foreground">
            How was your consultation with <span className="font-semibold text-foreground">{expertName}</span>?
          </p>
          
          {/* Star Rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="p-1"
              >
                <Star
                  className={`w-9 h-9 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'text-accent fill-accent'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </motion.button>
            ))}
          </div>
          
          {rating > 0 && (
            <p className="text-center text-sm font-medium text-accent">
              {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent!'}
            </p>
          )}

          {/* Feedback */}
          <Textarea
            placeholder="Share your experience (optional)..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[80px]"
          />

          <div className="flex gap-2">
            <SpiritualButton variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Skip
            </SpiritualButton>
            <SpiritualButton variant="primary" className="flex-1" onClick={handleSubmit} disabled={submitting || rating === 0}>
              {submitting ? "Submitting..." : "Submit Review"}
            </SpiritualButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
