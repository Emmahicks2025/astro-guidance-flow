import { KundliData } from "@/lib/kundli";
import { SpiritualCard } from "@/components/ui/spiritual-card";
import { Star, ArrowRight } from "lucide-react";

interface PlanetaryTableProps {
  data: KundliData;
  compact?: boolean;
}

const PlanetaryTable = ({ data, compact = false }: PlanetaryTableProps) => {
  const getPlanetColor = (planet: string) => {
    const colors: Record<string, string> = {
      'Sun': 'text-orange-500',
      'Moon': 'text-blue-300',
      'Mars': 'text-red-500',
      'Mercury': 'text-green-500',
      'Jupiter': 'text-yellow-500',
      'Venus': 'text-pink-400',
      'Saturn': 'text-gray-500',
      'Rahu': 'text-purple-500',
      'Ketu': 'text-indigo-500',
    };
    return colors[planet] || 'text-foreground';
  };

  if (compact) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {data.planets.map((planet) => (
          <div 
            key={planet.planet}
            className="flex items-center gap-1 text-xs p-1.5 rounded bg-muted/50"
          >
            <span className={`text-sm ${getPlanetColor(planet.planet)}`}>{planet.symbol}</span>
            <span className="text-muted-foreground truncate">{planet.sign.slice(0, 3)}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <SpiritualCard variant="elevated" className="overflow-hidden">
      <div className="p-3 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
        <h4 className="font-semibold flex items-center gap-2">
          <Star className="w-4 h-4 text-accent" />
          Planetary Positions
        </h4>
      </div>
      <div className="divide-y divide-border">
        {data.planets.map((planet) => (
          <div 
            key={planet.planet}
            className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className={`text-xl ${getPlanetColor(planet.planet)}`}>
                {planet.symbol}
              </span>
              <div>
                <p className="font-medium text-sm">{planet.planet}</p>
                {planet.isRetrograde && (
                  <span className="text-xs text-destructive">Retrograde</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-mono">
              <span className="text-muted-foreground">{planet.sign}</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium text-primary">H{planet.house}</span>
            </div>
          </div>
        ))}
      </div>
    </SpiritualCard>
  );
};

export default PlanetaryTable;
