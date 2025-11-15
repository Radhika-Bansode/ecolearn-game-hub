import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  left: number;
  animationDuration: number;
  size: number;
  delay: number;
  color: string;
  rotation: number;
}

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

const Confetti = ({ active, onComplete }: ConfettiProps) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (active) {
      const colors = [
        "hsl(158, 64%, 42%)",
        "hsl(178, 58%, 48%)",
        "hsl(142, 71%, 45%)",
        "hsl(45, 93%, 47%)",
        "hsl(158, 70%, 55%)",
        "hsl(178, 65%, 60%)",
      ];

      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        animationDuration: 2 + Math.random() * 2,
        size: 8 + Math.random() * 12,
        delay: Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
      }));
      
      setPieces(newPieces);

      // Clean up after animation completes
      const timeout = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [active, onComplete]);

  if (!active || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animationDuration: `${piece.animationDuration}s`,
            animationDelay: `${piece.delay}s`,
            transform: `rotate(${piece.rotation}deg)`,
            top: "-20px",
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
