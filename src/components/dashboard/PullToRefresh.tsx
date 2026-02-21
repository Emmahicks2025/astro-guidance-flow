import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

const THRESHOLD = 80;

const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, THRESHOLD], [0, 1]);
  const scale = useTransform(y, [0, THRESHOLD], [0.5, 1]);
  const startY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop <= 0 && !refreshing) {
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const diff = Math.max(0, (e.touches[0].clientY - startY.current) * 0.4);
    y.set(Math.min(diff, THRESHOLD + 20));
  }, [y]);

  const handleTouchEnd = useCallback(async () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (y.get() >= THRESHOLD) {
      setRefreshing(true);
      y.set(50);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        y.set(0);
      }
    } else {
      y.set(0);
    }
  }, [y, onRefresh]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        style={{ opacity, scale, height: y }}
        className="flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div className="flex items-center gap-2 text-primary text-sm">
          <Loader2 className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Pull to refresh'}</span>
        </div>
      </motion.div>

      {children}
    </div>
  );
};

export default PullToRefresh;
