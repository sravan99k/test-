import React, { useEffect, useState } from "react";

const tips = [
  "Take a deep breath and pause. Small breaks can refresh your mind.",
  "Reach out to a friend or counselor if you need to talk.",
  "Stay hydrated and get enough sleep for better mental health.",
  "Remember, it's okay to ask for help!",
  "Celebrate small wins and progress in your journey.",
  "Practice gratitude—write down one thing you're thankful for today.",
];

const AUTO_ROTATE_INTERVAL = 3500;

const MentalHealthTipsCarousel: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % tips.length);
    }, AUTO_ROTATE_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-4 flex flex-col items-center">
      <div className="bg-white rounded-lg shadow px-6 py-3 text-teal-800 font-medium text-base min-h-[48px] max-w-md text-center transition-all duration-500">
        {tips[current]}
      </div>
      <div className="flex gap-2 mt-2">
        {tips.map((_, idx) => (
          <button
            key={idx}
            className={`w-2.5 h-2.5 rounded-full border border-teal-300 transition-all duration-300 ${current === idx ? 'bg-teal-500' : 'bg-teal-100'}`}
            aria-label={`Show tip ${idx + 1}`}
            onClick={() => setCurrent(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default MentalHealthTipsCarousel;
