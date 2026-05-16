'use client';

export function Confetti() {
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 1.5 + Math.random() * 2,
    color: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'][Math.floor(Math.random() * 6)],
    size: 4 + Math.random() * 8,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-60 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute animate-bounce"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
