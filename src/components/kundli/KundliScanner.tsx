import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, Scan, Sparkles, X, Loader2 } from "lucide-react";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { SpiritualCard } from "@/components/ui/spiritual-card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface KundliScannerProps {
  onAnalysisComplete: (analysis: any) => void;
  birthDate?: string;
}

const KundliScanner = ({ onAnalysisComplete, birthDate }: KundliScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanPhase, setScanPhase] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const startScan = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setIsScanning(true);
    setScanProgress(0);

    const phases = [
      { progress: 15, text: "🔍 Detecting chart style..." },
      { progress: 30, text: "📊 Reading house positions..." },
      { progress: 45, text: "🌟 Identifying planets..." },
      { progress: 60, text: "🔮 Calculating doshas..." },
      { progress: 75, text: "✨ Finding yogas..." },
      { progress: 85, text: "🪷 Preparing remedies..." },
      { progress: 95, text: "📿 Finalizing reading..." },
    ];

    // Animate through phases
    for (const phase of phases) {
      setScanProgress(phase.progress);
      setScanPhase(phase.text);
      await new Promise((r) => setTimeout(r, 800));
    }

    try {
      // Extract base64 from data URL
      const base64 = selectedImage.split(",")[1];

      const { data, error } = await supabase.functions.invoke("analyze-kundli", {
        body: {
          imageBase64: base64,
          birthDate,
          analysisType: "scan",
        },
      });

      if (error) throw error;

      if (data?.success && data?.analysis) {
        setScanProgress(100);
        setScanPhase("✅ Analysis complete!");
        await new Promise((r) => setTimeout(r, 500));
        onAnalysisComplete(data.analysis);
        toast.success("Kundli analysis complete!", {
          description: "Your personalized reading is ready",
        });
      } else {
        throw new Error(data?.error || "Analysis failed");
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Failed to analyze Kundli", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
      setScanPhase("");
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      <AnimatePresence mode="wait">
        {!selectedImage ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SpiritualCard variant="spiritual" className="p-6">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-spiritual flex items-center justify-center">
                  <Scan className="w-10 h-10 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display">
                    Scan Your Paper Kundli
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Upload a photo of your handwritten or printed birth chart
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <SpiritualButton
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Take Photo
                  </SpiritualButton>
                  <SpiritualButton
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload
                  </SpiritualButton>
                </div>

                <p className="text-xs text-muted-foreground">
                  Supports North Indian & South Indian chart styles
                </p>
              </div>
            </SpiritualCard>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <SpiritualCard variant="elevated" className="overflow-hidden">
              <div className="relative">
                {/* Image preview */}
                <div className="relative aspect-square max-h-80 overflow-hidden">
                  <img
                    src={selectedImage}
                    alt="Kundli chart"
                    className="w-full h-full object-contain bg-muted"
                  />

                  {/* Scanning overlay */}
                  <AnimatePresence>
                    {isScanning && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center"
                      >
                        {/* Magic scanner animation */}
                        <motion.div
                          className="absolute inset-x-0 h-1 bg-gradient-spiritual"
                          initial={{ top: "0%" }}
                          animate={{ top: ["0%", "100%", "0%"] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />

                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent mb-4"
                        />

                        <div className="text-center px-4">
                          <p className="font-display font-bold text-lg">
                            {scanPhase}
                          </p>
                          <div className="w-48 h-2 bg-muted rounded-full mt-3 overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-spiritual rounded-full"
                              animate={{ width: `${scanProgress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {scanProgress}% complete
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Clear button */}
                  {!isScanning && (
                    <button
                      onClick={clearImage}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 space-y-3">
                  <SpiritualButton
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={startScan}
                    disabled={isScanning}
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Start AI Analysis
                      </>
                    )}
                  </SpiritualButton>

                  {!isScanning && (
                    <p className="text-xs text-center text-muted-foreground">
                      Our AI Jotshi will read your chart and provide a complete
                      Vedic analysis
                    </p>
                  )}
                </div>
              </div>
            </SpiritualCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KundliScanner;
