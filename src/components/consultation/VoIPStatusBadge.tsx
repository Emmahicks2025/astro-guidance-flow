import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface VoIPStatusBadgeProps {
  isActive: boolean;
}

const VoIPStatusBadge = ({ isActive }: VoIPStatusBadgeProps) => {
  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20"
    >
      <motion.div
        className="w-1.5 h-1.5 rounded-full bg-green-500"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <ShieldCheck className="w-3 h-3 text-green-600" />
      <span className="text-[10px] font-medium text-green-600">Secure VoIP Link Active</span>
    </motion.div>
  );
};

export default VoIPStatusBadge;
