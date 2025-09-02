
import React from "react";

const colors = [
  "#FF6B6B", // red
  "#6BCB77", // green
  "#4D96FF", // blue
  "#FFD93D", // yellow
  "#FF6BAA", // pink
  "#6B6BFF", // purple-blue
  "#FFB26B", // orange
];

const DURATION = 1000;
const SIZE = 120;

type Bubble = {
  id: number;
  x: number;
  y: number;
  color: string;
  born: number;
};

const Bubble: React.FC<{
  x: number;
  y: number;
  color: string;
  fading: boolean;
  falling: boolean;
}> = ({ x, y, color, fading, falling }) => (
  <div
    className={`absolute rounded-full pointer-events-none`}
    style={{
      left: x - SIZE / 2,
      top: y - SIZE / 2,
      width: SIZE,
      height: SIZE,
      background: color,
      opacity: fading ? 0 : 0.7,
      zIndex: 9999,
      boxShadow: `0 0 32px 0 ${color}`,
      // Animate down
      transform: falling
        ? `translateY(200px) scale(${fading ? 1.2 : 1})`
        : `translateY(0) scale(${fading ? 1.2 : 1})`,
      transition:
        "opacity 0.7s, transform 1s cubic-bezier(.48,.18,.24,1.12)", // Smooth fall + fade
      willChange: "transform, opacity",
    }}
  />
);

interface ReactiveBackgroundProps {
  bubbleMode: boolean;
}

const ReactiveBackground: React.FC<ReactiveBackgroundProps> = ({ bubbleMode }) => {
  const [bubbles, setBubbles] = React.useState<Bubble[]>([]);
  const idRef = React.useRef(0);
  const [falling, setFalling] = React.useState<{ [id: number]: boolean }>({});

  React.useEffect(() => {
    if (!bubbleMode) return; // effect off
    function handleClick(e: MouseEvent) {
      // Ignore click if on form input/button/select/textarea
      if (
        typeof (e.target as HTMLElement)?.closest === "function" &&
        (e.target as HTMLElement).closest(
          "input, textarea, button, select, [data-ignore-background-bubble]"
        )
      ) {
        return;
      }
      const color = colors[Math.floor(Math.random() * colors.length)];
      const id = idRef.current++;
      setBubbles((prev) => [
        ...prev,
        {
          id,
          x: e.clientX,
          y: e.clientY,
          color,
          born: Date.now(),
        },
      ]);
      // Start the 'falling' animation a tick later (so transition works)
      setTimeout(() => {
        setFalling((old) => ({ ...old, [id]: true }));
      }, 10);
      // Remove after DURATION+100ms for fade out
      setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.id !== id));
        setFalling((old) => {
          const { [id]: _, ...rest } = old;
          return rest;
        });
      }, DURATION + 100);
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [bubbleMode]);

  const now = Date.now();
  const display = bubbles.map((b) => ({
    ...b,
    fading: now - b.born > DURATION * 0.7,
    falling: Boolean(falling[b.id]),
  }));

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
      aria-hidden="true"
    >
      {bubbleMode &&
        display.map((b) => (
          <Bubble
            key={b.id}
            x={b.x}
            y={b.y}
            color={b.color}
            fading={b.fading}
            falling={b.falling}
          />
        ))}
    </div>
  );
};

export default ReactiveBackground;
