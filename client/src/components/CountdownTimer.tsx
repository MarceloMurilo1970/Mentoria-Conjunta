import { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const targetDate = new Date("2025-12-04T20:00:00-03:00");

    const calculateTimeLeft = (): TimeLeft | null => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!timeLeft) {
    return null;
  }

  const timeUnits = [
    { value: timeLeft.days, label: "Dias" },
    { value: timeLeft.hours, label: "Horas" },
    { value: timeLeft.minutes, label: "Min" },
    { value: timeLeft.seconds, label: "Seg" },
  ];

  return (
    <div className="flex gap-3 justify-center" data-testid="countdown-timer">
      {timeUnits.map((unit, index) => (
        <div
          key={index}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-3 min-w-[70px] border border-white/20"
          data-testid={`countdown-${unit.label.toLowerCase()}`}
        >
          <div className="text-white text-2xl md:text-3xl font-bold font-mono">
            {String(unit.value).padStart(2, "0")}
          </div>
          <div className="text-white/70 text-xs uppercase tracking-wider mt-1">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}
