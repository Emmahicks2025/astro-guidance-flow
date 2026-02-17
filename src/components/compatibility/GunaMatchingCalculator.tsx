import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Users, Calendar, MapPin, Clock, Loader2, Star, AlertTriangle, CheckCircle, MessageCircle, Phone, Video, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpiritualButton } from "@/components/ui/spiritual-button";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { SpiritualInput } from "@/components/ui/spiritual-input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MatchResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  verdict: string;
  gunaBreakdown: {
    name: string;
    description: string;
    obtained: number;
    maximum: number;
  }[];
  manglikStatus: {
    person1: boolean;
    person2: boolean;
    compatible: boolean;
  };
  recommendations: string[];
}

const GunaMatchingCalculator = () => {
  const navigate = useNavigate();
  const [expandedGuna, setExpandedGuna] = useState<number | null>(null);
  const [person1, setPerson1] = useState({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: ''
  });
  
  const [person2, setPerson2] = useState({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: ''
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);

  const handleCalculate = async () => {
    if (!person1.name || !person1.dateOfBirth || !person2.name || !person2.dateOfBirth) {
      toast.error('Please fill in at least name and date of birth for both persons');
      return;
    }

    setIsCalculating(true);

    try {
      const { data, error } = await supabase.functions.invoke('calculate-guna-milan', {
        body: { person1, person2 }
      });

      if (error) {
        console.error('Guna Milan error:', error);
        toast.error('Failed to calculate compatibility. Please try again.');
        return;
      }

      if (data?.result) {
        setResult(data.result);
        toast.success('Compatibility analysis complete!');
      }
    } catch (err) {
      console.error('Error calculating:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-500';
    if (percentage >= 50) return 'text-accent';
    if (percentage >= 25) return 'text-orange-500';
    return 'text-destructive';
  };

  const getScoreGradient = (percentage: number) => {
    if (percentage >= 75) return 'from-green-500 to-emerald-400';
    if (percentage >= 50) return 'from-accent to-gold-light';
    if (percentage >= 25) return 'from-orange-500 to-amber-400';
    return 'from-destructive to-red-400';
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Person 1 */}
            <SpiritualCard variant="elevated" className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold font-display">Person 1 (Boy)</h3>
                  <p className="text-xs text-muted-foreground">Enter birth details</p>
                </div>
              </div>
              <div className="grid gap-3">
                <div>
                  <Label className="text-xs">Full Name</Label>
                  <SpiritualInput
                    placeholder="Enter name"
                    value={person1.name}
                    onChange={(e) => setPerson1({ ...person1, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Date of Birth</Label>
                    <SpiritualInput
                      type="date"
                      value={person1.dateOfBirth}
                      onChange={(e) => setPerson1({ ...person1, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Time of Birth</Label>
                    <SpiritualInput
                      type="time"
                      value={person1.timeOfBirth}
                      onChange={(e) => setPerson1({ ...person1, timeOfBirth: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Place of Birth</Label>
                  <SpiritualInput
                    placeholder="City, State"
                    value={person1.placeOfBirth}
                    onChange={(e) => setPerson1({ ...person1, placeOfBirth: e.target.value })}
                  />
                </div>
              </div>
            </SpiritualCard>

            {/* Heart connector */}
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-spiritual flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>

            {/* Person 2 */}
            <SpiritualCard variant="elevated" className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold font-display">Person 2 (Girl)</h3>
                  <p className="text-xs text-muted-foreground">Enter birth details</p>
                </div>
              </div>
              <div className="grid gap-3">
                <div>
                  <Label className="text-xs">Full Name</Label>
                  <SpiritualInput
                    placeholder="Enter name"
                    value={person2.name}
                    onChange={(e) => setPerson2({ ...person2, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Date of Birth</Label>
                    <SpiritualInput
                      type="date"
                      value={person2.dateOfBirth}
                      onChange={(e) => setPerson2({ ...person2, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Time of Birth</Label>
                    <SpiritualInput
                      type="time"
                      value={person2.timeOfBirth}
                      onChange={(e) => setPerson2({ ...person2, timeOfBirth: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Place of Birth</Label>
                  <SpiritualInput
                    placeholder="City, State"
                    value={person2.placeOfBirth}
                    onChange={(e) => setPerson2({ ...person2, placeOfBirth: e.target.value })}
                  />
                </div>
              </div>
            </SpiritualCard>

            {/* Calculate Button */}
            <SpiritualButton
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleCalculate}
              disabled={isCalculating}
            >
              {isCalculating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Compatibility...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Calculate Guna Milan
                </>
              )}
            </SpiritualButton>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Score Header */}
            <SpiritualCard variant="spiritual" className="p-6 text-center">
              <div className="space-y-4">
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  transition={{ type: "spring", delay: 0.2 }}
                  className={`text-5xl font-bold font-display ${getScoreColor(result.percentage)}`}
                >
                  {result.totalScore}/{result.maxScore}
                </motion.div>
                <Progress value={result.percentage} className="h-3" />
                <p className="text-lg font-medium">{result.verdict}</p>
                <div className="flex justify-center gap-2">
                  <Badge variant="outline">{person1.name}</Badge>
                  <Heart className="w-4 h-4 text-destructive" />
                  <Badge variant="outline">{person2.name}</Badge>
                </div>
                {result.percentage >= 50 ? (
                  <p className="text-sm text-muted-foreground">
                    ✨ This is a promising match! An expert can help you understand the deeper nuances.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    🙏 Every match has its strengths. Consult an expert for remedies and deeper insight.
                  </p>
                )}
              </div>
            </SpiritualCard>

            {/* Guna Breakdown - Expandable */}
            <SpiritualCard variant="elevated" className="p-4">
              <h4 className="font-bold font-display mb-4">Ashtakoot Guna Breakdown</h4>
              <div className="space-y-3">
                {result.gunaBreakdown.map((guna, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <button
                      className="w-full text-left"
                      onClick={() => setExpandedGuna(expandedGuna === idx ? null : idx)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{guna.name}</span>
                          {guna.obtained === guna.maximum ? (
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          ) : guna.obtained === 0 ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{guna.obtained}/{guna.maximum}</span>
                          {expandedGuna === idx ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <Progress value={(guna.obtained / guna.maximum) * 100} className="h-1.5" />
                    </button>
                    <AnimatePresence>
                      {expandedGuna === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded-lg">
                            {guna.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </SpiritualCard>

            {/* Manglik Status */}
            <SpiritualCard 
              variant={result.manglikStatus.compatible ? "golden" : "default"} 
              className="p-4"
            >
              <div className="flex items-center gap-3">
                {result.manglikStatus.compatible ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                )}
                <div>
                  <h4 className="font-bold">Manglik Compatibility</h4>
                  <p className="text-sm text-muted-foreground">
                    {result.manglikStatus.person1 && !result.manglikStatus.person2 
                      ? `${person1.name} is Manglik, ${person2.name} is not`
                      : result.manglikStatus.person2 && !result.manglikStatus.person1
                      ? `${person2.name} is Manglik, ${person1.name} is not`
                      : result.manglikStatus.person1 && result.manglikStatus.person2
                      ? 'Both are Manglik - Good match!'
                      : 'Neither is Manglik - Good match!'
                    }
                  </p>
                  {!result.manglikStatus.compatible && (
                    <p className="text-xs text-destructive mt-1">
                      ⚠️ Manglik Dosha detected. An expert can suggest specific remedies.
                    </p>
                  )}
                </div>
              </div>
            </SpiritualCard>

            {/* Recommendations */}
            <SpiritualCard variant="mystic" className="p-4">
              <h4 className="font-bold font-display mb-3">Recommendations</h4>
              <ul className="space-y-2">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Star className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </SpiritualCard>

            {/* Expert Consultation CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <SpiritualCard variant="spiritual" className="p-5">
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto">
                    <Sparkles className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h4 className="font-bold font-display text-lg text-primary-foreground">
                    Get Expert Interpretation
                  </h4>
                  <p className="text-sm text-primary-foreground/80">
                    Numbers only tell part of the story. A Vedic astrology expert can analyze planetary positions, doshas & suggest powerful remedies.
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <SpiritualButton
                      variant="golden"
                      size="sm"
                      className="flex-col h-auto py-3 gap-1"
                      onClick={() => navigate('/talk')}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-xs">Chat</span>
                    </SpiritualButton>
                    <SpiritualButton
                      variant="golden"
                      size="sm"
                      className="flex-col h-auto py-3 gap-1"
                      onClick={() => navigate('/talk')}
                    >
                      <Phone className="w-5 h-5" />
                      <span className="text-xs">Call</span>
                    </SpiritualButton>
                    <SpiritualButton
                      variant="golden"
                      size="sm"
                      className="flex-col h-auto py-3 gap-1"
                      onClick={() => navigate('/talk')}
                    >
                      <Video className="w-5 h-5" />
                      <span className="text-xs">Video</span>
                    </SpiritualButton>
                  </div>
                </div>
              </SpiritualCard>
            </motion.div>

            {/* Quick Expert Nudge for Low Scores */}
            {result.percentage < 50 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <SpiritualCard variant="golden" className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">Don't worry — remedies exist!</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Low Guna scores can often be balanced with specific pujas, gemstones, or mantras. 
                        An experienced Jotshi can guide you with personalized solutions.
                      </p>
                      <SpiritualButton
                        variant="primary"
                        size="sm"
                        className="mt-3"
                        onClick={() => navigate('/talk')}
                      >
                        Talk to an Expert Now
                      </SpiritualButton>
                    </div>
                  </div>
                </SpiritualCard>
              </motion.div>
            )}

            {/* New Match Button */}
            <SpiritualButton
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => { setResult(null); setExpandedGuna(null); }}
            >
              Check Another Match
            </SpiritualButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GunaMatchingCalculator;
