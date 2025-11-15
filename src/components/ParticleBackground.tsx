import { useEffect, useState } from "react";

interface Particle {
  id: number;
  left: number;
  animationDuration: number;
  size: number;
  delay: number;
  icon: string;
}

const ParticleBackground = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const icons = ["🌿", "🍃", "✨", "🌱", "💧", "🌟", "🌸", "🦋"];
    const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 15 + Math.random() * 20,
      size: 20 + Math.random() * 20,
      delay: Math.random() * 5,
      icon: icons[Math.floor(Math.random() * icons.length)],
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-success/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }}></div>
      
      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-float-up opacity-60"
          style={{
            left: `${particle.left}%`,
            fontSize: `${particle.size}px`,
            animationDuration: `${particle.animationDuration}s`,
            animationDelay: `${particle.delay}s`,
            bottom: "-50px",
          }}
        >
          {particle.icon}
        </div>
      ))}
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
    </div>
  );
};

export default ParticleBackground;
