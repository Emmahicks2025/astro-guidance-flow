import { useState } from "react";
import { motion } from "framer-motion";
import { Hand, ArrowLeft, Upload, Camera, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { toast } from "sonner";

const tips = [
  "Use natural lighting, avoid shadows",
  "Keep your palm flat and fingers spread",
  "Capture the entire palm including wrist",
  "Focus on the dominant hand (usually right)",
];

const PalmReading = () => {
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        toast.success("Image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (!uploadedImage) {
      toast.error("Please upload a palm image first");
      return;
    }
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      toast.success("Analysis complete! A Jotshi will review your palm shortly.");
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <SpiritualButton variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </SpiritualButton>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
              <Hand className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Palm Reading</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Tips */}
        <SpiritualCard variant="golden" className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-accent mt-0.5" />
            <div>
              <h4 className="font-semibold mb-2">Photo Tips for Best Results</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {tips.map((tip, i) => (
                  <li key={i}>• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </SpiritualCard>

        {/* Upload Area */}
        <SpiritualCard variant="elevated" className="overflow-hidden">
          <SpiritualCardContent className="p-6">
            {uploadedImage ? (
              <div className="space-y-4">
                <img
                  src={uploadedImage}
                  alt="Uploaded palm"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <div className="flex gap-2">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <SpiritualButton variant="outline" size="lg" className="w-full" asChild>
                      <span>
                        <Upload className="w-5 h-5" />
                        Change Image
                      </span>
                    </SpiritualButton>
                  </label>
                  <SpiritualButton
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? "Analyzing..." : "Get Reading"}
                  </SpiritualButton>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Hand className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Upload Your Palm Photo</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Our expert Jotshis will analyze the lines of your destiny
                </p>
                <div className="flex gap-3 justify-center">
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <SpiritualButton variant="primary" size="lg" asChild>
                      <span>
                        <Upload className="w-5 h-5" />
                        Upload Photo
                      </span>
                    </SpiritualButton>
                  </label>
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <SpiritualButton variant="outline" size="lg" asChild>
                      <span>
                        <Camera className="w-5 h-5" />
                        Take Photo
                      </span>
                    </SpiritualButton>
                  </label>
                </div>
              </div>
            )}
          </SpiritualCardContent>
        </SpiritualCard>

        {/* What You'll Get */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold font-display">What You'll Discover</h3>
          <div className="grid grid-cols-2 gap-3">
            {['Life Line', 'Heart Line', 'Head Line', 'Fate Line'].map((line) => (
              <SpiritualCard key={line} variant="default" className="p-4 text-center">
                <p className="font-medium">{line}</p>
              </SpiritualCard>
            ))}
          </div>
        </section>
      </main>
    </motion.div>
  );
};

export default PalmReading;
