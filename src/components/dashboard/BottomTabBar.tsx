import { useNavigate, useLocation } from "react-router-dom";
import { Home, Star, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/stores/languageStore";

const BottomTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const tabs = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Star, label: t.myKundli, path: "/kundli" },
    { icon: MessageCircle, label: t.talkToJotshi?.split(" ")[0] || "Talk", path: "/talk" },
    { icon: User, label: "Settings", path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-xl border-t border-primary-foreground/10 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path || 
            (tab.path === "/" && location.pathname === "/");
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                isActive
                  ? "text-secondary"
                  : "text-primary-foreground/60 hover:text-primary-foreground"
              )}
            >
              <tab.icon className={cn("w-5 h-5", isActive && "scale-110")} />
              <span className={cn(
                "text-[10px] font-medium",
                isActive && "font-semibold"
              )}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-5 h-0.5 rounded-full bg-secondary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
