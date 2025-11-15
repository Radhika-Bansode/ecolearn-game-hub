import { useEffect, useState } from "react";
import { Award, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AchievementNotificationProps {
  badge: string;
  icon: string;
  onClose: () => void;
}

const AchievementNotification = ({ badge, icon, onClose }: AchievementNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto-close after 5 seconds
    const timeout = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  return (
    <div
      className={`fixed top-24 right-6 z-[99] transition-all duration-500 ${
        isVisible
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95"
      }`}
    >
      <div className="relative bg-gradient-hero rounded-2xl shadow-eco-lg p-6 min-w-[320px] overflow-hidden border-2 border-white/30">
        {/* Animated background sparkles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-2 left-4 text-2xl animate-ping">✨</div>
          <div className="absolute top-4 right-6 text-xl animate-ping" style={{ animationDelay: "0.2s" }}>⭐</div>
          <div className="absolute bottom-3 left-8 text-lg animate-ping" style={{ animationDelay: "0.4s" }}>💫</div>
          <div className="absolute bottom-4 right-4 text-2xl animate-ping" style={{ animationDelay: "0.1s" }}>✨</div>
        </div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/20 z-10"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Content */}
        <div className="relative flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-white/20 backdrop-blur-sm rounded-full p-4 border-2 border-white/40 shadow-glow">
                <Award className="h-8 w-8 text-white animate-float" />
              </div>
            </div>
          </div>

          <div className="flex-1 text-white">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold drop-shadow-lg">Achievement Unlocked!</h3>
              <span className="text-3xl animate-bounce">{icon}</span>
            </div>
            <p className="text-white/95 font-semibold text-base drop-shadow-md">{badge}</p>
          </div>
        </div>

        {/* Progress bar animation */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div className="h-full bg-white/60 animate-progress-shrink origin-left"></div>
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;
