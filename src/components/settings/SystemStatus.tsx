import { motion } from "framer-motion";
import { Activity, Cpu, Wifi } from "lucide-react";
import { SpiritualCard } from "@/components/ui/spiritual-card";
import { useState, useEffect } from "react";

const SystemStatus = () => {
  const [latency, setLatency] = useState(24);

  // Simulate realistic latency fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(18 + Math.random() * 15));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const statuses = [
    { 
      icon: Activity, 
      label: "API", 
      value: "Connected", 
      color: "text-green-500",
      dotColor: "bg-green-500" 
    },
    { 
      icon: Cpu, 
      label: "Neural Engine v2.1", 
      value: "Operational", 
      color: "text-green-500",
      dotColor: "bg-green-500" 
    },
    { 
      icon: Wifi, 
      label: "WebRTC Latency", 
      value: `${latency}ms`, 
      color: latency < 30 ? "text-green-500" : "text-amber-500",
      dotColor: latency < 30 ? "bg-green-500" : "bg-amber-500"
    },
  ];

  return (
    <SpiritualCard variant="default" className="p-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        System Status
      </h4>
      <div className="space-y-2.5">
        {statuses.map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <s.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{s.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                className={`w-2 h-2 rounded-full ${s.dotColor}`}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className={`text-xs font-medium ${s.color}`}>{s.value}</span>
            </div>
          </div>
        ))}
      </div>
    </SpiritualCard>
  );
};

export default SystemStatus;
