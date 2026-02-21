import { motion } from "framer-motion";

interface AudioWaveformProps {
  isActive: boolean;
  isSpeaking: boolean;
}

const AudioWaveform = ({ isActive, isSpeaking }: AudioWaveformProps) => {
  if (!isActive) return null;

  const barCount = 24;

  return (
    <div className="flex items-center justify-center gap-[2px] h-12 w-full max-w-[200px] mx-auto" aria-hidden="true">
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-primary"
          animate={isSpeaking ? {
            height: [4, 8 + Math.random() * 28, 6, 12 + Math.random() * 20, 4],
          } : {
            height: [4, 6, 4],
          }}
          transition={{
            duration: isSpeaking ? 0.6 + Math.random() * 0.4 : 1.5,
            repeat: Infinity,
            delay: i * 0.04,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default AudioWaveform;
