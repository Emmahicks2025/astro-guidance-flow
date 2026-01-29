import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, Loader2, User, Briefcase, Heart, Download, Share2 } from "lucide-react";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KundliData } from "@/lib/kundli";

interface LifeReportGeneratorProps {
  kundliData: KundliData;
  userName?: string;
  dateOfBirth?: string;
}

interface LifeReport {
  generalVibe: {
    title: string;
    content: string;
  };
  careerWealth: {
    title: string;
    content: string;
  };
  loveMarriage: {
    title: string;
    content: string;
  };
  generatedAt: string;
}

const LifeReportGenerator = ({ kundliData, userName, dateOfBirth }: LifeReportGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<LifeReport | null>(null);

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-life-report', {
        body: {
          kundliData,
          userName: userName || 'User',
          dateOfBirth: dateOfBirth || 'Unknown'
        }
      });

      if (error) {
        console.error('Report generation error:', error);
        toast.error('Failed to generate report. Please try again.');
        return;
      }

      if (data?.report) {
        setReport(data.report);
        toast.success('Life Report generated successfully!');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {!report ? (
        <SpiritualCard variant="spiritual" className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-display">Personalized Life Report</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Get a comprehensive AI-generated report analyzing your D1, D9, and D2 charts 
                for insights on personality, career, and relationships.
              </p>
            </div>
            <SpiritualButton 
              variant="primary" 
              size="lg"
              onClick={generateReport}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Charts...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Life Report
                </>
              )}
            </SpiritualButton>
          </div>
        </SpiritualCard>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Report Header */}
            <SpiritualCard variant="golden" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold font-display text-lg">Your Life Report</h3>
                  <p className="text-xs text-muted-foreground">Generated on {report.generatedAt}</p>
                </div>
                <div className="flex gap-2">
                  <SpiritualButton variant="ghost" size="icon" onClick={() => toast.info('Download feature coming soon!')}>
                    <Download className="w-4 h-4" />
                  </SpiritualButton>
                  <SpiritualButton variant="ghost" size="icon" onClick={() => toast.info('Share feature coming soon!')}>
                    <Share2 className="w-4 h-4" />
                  </SpiritualButton>
                </div>
              </div>
            </SpiritualCard>

            {/* General Vibe */}
            <SpiritualCard variant="elevated" className="overflow-hidden">
              <div className="p-4 bg-gradient-spiritual">
                <div className="flex items-center gap-2 text-primary-foreground">
                  <User className="w-5 h-5" />
                  <h4 className="font-bold">{report.generalVibe.title}</h4>
                </div>
              </div>
              <SpiritualCardContent className="p-4">
                <p className="text-sm leading-relaxed">{report.generalVibe.content}</p>
              </SpiritualCardContent>
            </SpiritualCard>

            {/* Career & Wealth */}
            <SpiritualCard variant="elevated" className="overflow-hidden">
              <div className="p-4 bg-gradient-golden">
                <div className="flex items-center gap-2 text-accent-foreground">
                  <Briefcase className="w-5 h-5" />
                  <h4 className="font-bold">{report.careerWealth.title}</h4>
                </div>
              </div>
              <SpiritualCardContent className="p-4">
                <p className="text-sm leading-relaxed">{report.careerWealth.content}</p>
              </SpiritualCardContent>
            </SpiritualCard>

            {/* Love & Marriage */}
            <SpiritualCard variant="elevated" className="overflow-hidden">
              <div className="p-4 bg-gradient-mystic">
                <div className="flex items-center gap-2 text-primary-foreground">
                  <Heart className="w-5 h-5" />
                  <h4 className="font-bold">{report.loveMarriage.title}</h4>
                </div>
              </div>
              <SpiritualCardContent className="p-4">
                <p className="text-sm leading-relaxed">{report.loveMarriage.content}</p>
              </SpiritualCardContent>
            </SpiritualCard>

            {/* Regenerate Button */}
            <SpiritualButton 
              variant="outline" 
              size="lg"
              onClick={() => setReport(null)}
              className="w-full"
            >
              Generate New Report
            </SpiritualButton>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default LifeReportGenerator;
