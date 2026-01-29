import { motion } from "framer-motion";
import { Heart, ArrowLeft, Book, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualCard } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import GunaMatchingCalculator from "@/components/compatibility/GunaMatchingCalculator";
import WalkthroughTrigger from "@/components/walkthrough/WalkthroughTrigger";

const Compatibility = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SpiritualButton variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </SpiritualButton>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-mystic flex items-center justify-center">
                <Heart className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl">Guna Milan</h1>
                <p className="text-xs text-muted-foreground">Kundli Matching</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <WalkthroughTrigger />
            <SpiritualButton variant="ghost" size="icon" onClick={() => navigate('/explore')}>
              <Book className="w-5 h-5" />
            </SpiritualButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Info Card */}
        <SpiritualCard variant="spiritual" className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-primary-foreground">Ashtakoot Guna Milan</h3>
              <p className="text-sm text-primary-foreground/80 mt-1">
                Traditional 36-point Vedic compatibility matching based on birth details. 
                Analyzes 8 aspects including Nadi, Bhakoot, Gana, and more.
              </p>
            </div>
          </div>
        </SpiritualCard>

        {/* Guna Matching Calculator */}
        <GunaMatchingCalculator />

        {/* Talk to Expert CTA */}
        <SpiritualCard 
          variant="mystic" 
          className="p-4 cursor-pointer"
          onClick={() => navigate('/talk')}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold">Need Expert Guidance?</h4>
              <p className="text-xs text-muted-foreground">Consult a Jotshi for detailed analysis</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </SpiritualCard>
      </main>
    </motion.div>
  );
};

export default Compatibility;
