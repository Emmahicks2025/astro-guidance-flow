import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { SpiritualCard, SpiritualCardContent } from "@/components/ui/spiritual-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import NorthIndianKundliChart from "./NorthIndianKundliChart";
import { KundliData, PlanetPosition } from "@/lib/kundli";

interface DivisionalChartsProps {
  baseData: KundliData;
  showLabels?: boolean;
}

type ChartType = "D1" | "D9" | "D2" | "Chandra" | "Chalit";

interface ChartInfo {
  id: ChartType;
  name: string;
  sanskrit: string;
  description: string;
  usage: string;
}

const chartTypes: ChartInfo[] = [
  {
    id: "D1",
    name: "Lagna Chart",
    sanskrit: "Rashi / D1",
    description: "Main birth chart showing general life patterns",
    usage: "Physical body, overall life, personality"
  },
  {
    id: "D9",
    name: "Navamsa",
    sanskrit: "D9 Chart",
    description: "Marriage & spiritual strength of planets",
    usage: "Marriage, dharma, planetary strength"
  },
  {
    id: "D2",
    name: "Hora Chart",
    sanskrit: "D2 Chart",
    description: "Wealth and financial prospects",
    usage: "Wealth accumulation, financial success"
  },
  {
    id: "Chandra",
    name: "Chandra Kundli",
    sanskrit: "Moon Chart",
    description: "Moon-based chart for mind & emotions",
    usage: "Mental state, emotions, intuition"
  },
  {
    id: "Chalit",
    name: "Chalit Chart",
    sanskrit: "Bhava Chalit",
    description: "Actual house positions of planets",
    usage: "Precise house placements, predictions"
  }
];

// Generate divisional chart data from base D1 chart
const generateDivisionalChart = (baseData: KundliData, chartType: ChartType): KundliData => {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  const getSignIndex = (sign: string): number => {
    return signs.indexOf(sign);
  };

  switch (chartType) {
    case "D1":
      return baseData;

    case "D9": {
      // Navamsa calculation: Each sign divided into 9 parts (3°20' each)
      const navamsaPlanets: PlanetPosition[] = baseData.planets.map(planet => {
        const signIndex = getSignIndex(planet.sign);
        const navamsaNumber = Math.floor(planet.degree / 3.333333) % 9;
        
        // Starting sign for Navamsa varies by element
        let startSign: number;
        if (signIndex % 4 === 0) startSign = 0; // Fire signs start from Aries
        else if (signIndex % 4 === 1) startSign = 3; // Earth signs start from Cancer
        else if (signIndex % 4 === 2) startSign = 6; // Air signs start from Libra
        else startSign = 9; // Water signs start from Capricorn
        
        const navamsaSign = signs[(startSign + navamsaNumber) % 12];
        const navamsaHouse = ((startSign + navamsaNumber) % 12) + 1;
        
        return {
          ...planet,
          sign: navamsaSign,
          house: navamsaHouse,
          degree: (planet.degree * 9) % 30
        };
      });

      const d9LagnaIndex = (getSignIndex(baseData.lagnaSign) * 9) % 12;
      
      return {
        ...baseData,
        lagnaSign: signs[d9LagnaIndex],
        planets: navamsaPlanets
      };
    }

    case "D2": {
      // Hora chart: Only Sun (1st hora) and Moon (2nd hora) signs
      const horaPlanets: PlanetPosition[] = baseData.planets.map(planet => {
        const isFirstHora = planet.degree < 15;
        const signIndex = getSignIndex(planet.sign);
        const isOddSign = signIndex % 2 === 0;
        
        // In odd signs: first 15° = Sun (Leo), second 15° = Moon (Cancer)
        // In even signs: first 15° = Moon (Cancer), second 15° = Sun (Leo)
        let horaSign: string;
        if (isOddSign) {
          horaSign = isFirstHora ? 'Leo' : 'Cancer';
        } else {
          horaSign = isFirstHora ? 'Cancer' : 'Leo';
        }
        
        return {
          ...planet,
          sign: horaSign,
          house: horaSign === 'Leo' ? 5 : 4
        };
      });

      return {
        ...baseData,
        lagnaSign: baseData.planets.find(p => p.planet === 'Sun')?.sign === 'Leo' ? 'Leo' : 'Cancer',
        planets: horaPlanets
      };
    }

    case "Chandra": {
      // Chandra Kundli: Moon becomes the ascendant
      const moonPlanet = baseData.planets.find(p => p.planet === 'Moon');
      if (!moonPlanet) return baseData;

      const moonSignIndex = getSignIndex(moonPlanet.sign);
      const lagnaSignIndex = getSignIndex(baseData.lagnaSign);
      const shift = moonSignIndex - lagnaSignIndex;

      const chandraPlanets: PlanetPosition[] = baseData.planets.map(planet => {
        let newHouse = planet.house - shift;
        if (newHouse < 1) newHouse += 12;
        if (newHouse > 12) newHouse -= 12;
        return {
          ...planet,
          house: newHouse
        };
      });

      return {
        ...baseData,
        lagnaSign: moonPlanet.sign,
        lagnaHouse: 1,
        planets: chandraPlanets
      };
    }

    case "Chalit": {
      // Chalit: Adjusts house positions based on Bhava Madhya
      // Simplified: Shift planets based on lagna degree
      const lagnaIndex = getSignIndex(baseData.lagnaSign);
      
      const chalitPlanets: PlanetPosition[] = baseData.planets.map(planet => {
        const signIndex = getSignIndex(planet.sign);
        let house = ((signIndex - lagnaIndex + 12) % 12) + 1;
        
        // Adjust if planet is in last/first degrees (may shift house)
        if (planet.degree > 25) {
          house = house === 12 ? 1 : house + 1;
        } else if (planet.degree < 5) {
          house = house === 1 ? 12 : house - 1;
        }
        
        return {
          ...planet,
          house
        };
      });

      return {
        ...baseData,
        planets: chalitPlanets
      };
    }

    default:
      return baseData;
  }
};

const DivisionalCharts = ({ baseData, showLabels = true }: DivisionalChartsProps) => {
  const [activeChart, setActiveChart] = useState<ChartType>("D1");
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeChartInfo = chartTypes.find(c => c.id === activeChart)!;
  const chartData = generateDivisionalChart(baseData, activeChart);

  const handlePrevious = () => {
    const newIndex = currentIndex === 0 ? chartTypes.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setActiveChart(chartTypes[newIndex].id);
  };

  const handleNext = () => {
    const newIndex = currentIndex === chartTypes.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    setActiveChart(chartTypes[newIndex].id);
  };

  return (
    <div className="space-y-4">
      {/* Chart Type Selector - Horizontal Scroll */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
          onClick={handlePrevious}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max px-1">
            {chartTypes.map((chart, idx) => (
              <motion.button
                key={chart.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveChart(chart.id);
                  setCurrentIndex(idx);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeChart === chart.id
                    ? 'bg-gradient-spiritual text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {chart.id === "Chandra" ? "☽" : chart.id === "Chalit" ? "⊞" : ""} {chart.sanskrit}
              </motion.button>
            ))}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
          onClick={handleNext}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Chart Info */}
      {showLabels && (
        <SpiritualCard variant="mystic" className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold font-display">{activeChartInfo.name}</h3>
                <Badge variant="secondary" className="text-xs">{activeChartInfo.sanskrit}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{activeChartInfo.description}</p>
            </div>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[200px]">
                <p className="text-xs"><span className="font-medium">Usage:</span> {activeChartInfo.usage}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </SpiritualCard>
      )}

      {/* Chart Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeChart}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <SpiritualCard variant="elevated" className="overflow-hidden">
            <SpiritualCardContent className="p-6">
              <div className="flex justify-center">
                <NorthIndianKundliChart data={chartData} size={280} />
              </div>
            </SpiritualCardContent>
          </SpiritualCard>
        </motion.div>
      </AnimatePresence>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <SpiritualCard variant="default" className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Lagna</p>
          <p className="font-bold text-sm">{chartData.lagnaSign}</p>
        </SpiritualCard>
        <SpiritualCard variant="default" className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Moon</p>
          <p className="font-bold text-sm">{chartData.planets.find(p => p.planet === 'Moon')?.sign || 'N/A'}</p>
        </SpiritualCard>
        <SpiritualCard variant="default" className="p-3 text-center">
          <p className="text-xs text-muted-foreground">Sun</p>
          <p className="font-bold text-sm">{chartData.planets.find(p => p.planet === 'Sun')?.sign || 'N/A'}</p>
        </SpiritualCard>
      </div>
    </div>
  );
};

export default DivisionalCharts;
