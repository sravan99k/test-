import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CheckCircle, Lock, Zap, Target } from 'lucide-react';
import { LevelNodeData } from './LevelNode';

interface LevelPathContainerProps<T extends LevelNodeData> {
  levels: T[];
  completedLevels: Set<number>;
  bestScores: Record<number, number>;
  selectedLevelId: number;
  onSelectLevel: (level: T) => void;
  onStartLevel: (level: T) => void;
  isLevelUnlocked: (levelId: number) => boolean;
  nodeHeight?: number;
  leftX?: number;
  rightX?: number;
}

export function LevelPathContainer<T extends LevelNodeData>({
  levels,
  completedLevels,
  bestScores,
  onStartLevel,
  isLevelUnlocked,
}: LevelPathContainerProps<T>) {
  const roadmapContainerRef = useRef<HTMLDivElement>(null);
  const [roadmapPaths, setRoadmapPaths] = useState({ full: '', completed: '' });

  const calculatePaths = useCallback(() => {
    if (!roadmapContainerRef.current) return;

    // We need to find the nodes in the correct order. 
    // Query selecting by attribute might not return them in DOM order if grid layout reorders them visually?
    // No, querySelectorAll returns in document order. 
    // Since rendering map preserves order, document order should be correct.
    const nodes = Array.from(roadmapContainerRef.current.querySelectorAll('[data-level-node]'));
    if (nodes.length === 0) return;

    const containerRect = roadmapContainerRef.current.getBoundingClientRect();
    const points = nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      const x = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top + rect.height / 2;
      return { x, y };
    });

    const generatePath = (pts: { x: number; y: number }[]) => {
      if (pts.length < 2) return '';
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];

        // Control points: Vertical curve logic since flow is generally top-to-bottom
        // We use a curvature offset roughly proportional to distance or fixed
        const curvature = 50;

        // This simple bezier works well for vertical flows:
        // Control point 1 is below start point
        // Control point 2 is above end point
        d += ` C ${p0.x} ${p0.y + curvature}, ${p1.x} ${p1.y - curvature}, ${p1.x} ${p1.y}`;
      }
      return d;
    };

    const fullPath = generatePath(points);

    // Determine the furthest point to which the completed path should extend
    // We want to draw the path up to the current active level (the first unlocked but not necessarily completed, or just the last completed?)
    // Typically: If Level 1 is completed, path 0->1 is green. 
    // If Level 2 is unlocked, path 1->2 might be green or partial? 
    // Let's assume green path goes up to the latest *unlocked* level.
    let maxIndex = 0;
    // Find the last unlocked level index
    for (let i = 0; i < levels.length; i++) {
      if (isLevelUnlocked(levels[i].id)) {
        maxIndex = i;
      }
    }

    // Create points array for completed path
    const completedPoints = points.slice(0, maxIndex + 1);
    const completedPath = generatePath(completedPoints);

    setRoadmapPaths({ full: fullPath, completed: completedPath });
  }, [levels, isLevelUnlocked]);

  useEffect(() => {
    // Initial calculation
    calculatePaths();

    // Recalculate on resize
    const handleResize = () => calculatePaths();
    window.addEventListener('resize', handleResize);

    // Using a ResizeObserver on the container would be better if available, 
    // but window resize covers most responsive cases. 
    // We also add a timeout to catch layout shifts after mount/render
    const timeout = setTimeout(calculatePaths, 300);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, [calculatePaths]);

  return (
    <div className="w-full bg-white">
      {/* Dynamic Wavy Roadmap Background */}
      <div
        ref={roadmapContainerRef}
        className="relative w-full max-w-5xl mx-auto pt-10 pb-4 px-8"
      >
        {/* Global SVG Path Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
          {/* Background "Dotted" Path */}
          <path
            d={roadmapPaths.full}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="6"
            strokeDasharray="12 10"
            strokeLinecap="round"
          />
          {/* Progress Path (Green) */}
          <path
            d={roadmapPaths.completed}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="6"
            strokeDasharray="12 10"
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>

        <div className="relative z-10 flex flex-col gap-8 md:grid md:grid-cols-3 md:gap-x-12 md:gap-y-16 justify-items-center">
          {levels.map((level, index) => {
            const isUnlocked = isLevelUnlocked(level.id);
            const isCompleted = completedLevels.has(level.id);

            // Grid Position Logic
            const itemsPerRow = 3;
            const row = Math.floor(index / itemsPerRow);
            const isRowEven = row % 2 === 0;
            const colRaw = index % itemsPerRow;
            const col = isRowEven ? colRaw : (itemsPerRow - 1 - colRaw);

            // Fine-tuned scattering for a non-linear roadmap
            let scatterX = 0;
            let scatterY = 0;

            switch (index) {
              case 0: scatterX = -20; scatterY = -20; break;
              case 1: scatterX = 40; scatterY = 60; break; // Focus Builder
              case 2: scatterX = 60; scatterY = -40; break; // Memory Sprint
              case 3: scatterX = -80; scatterY = -60; break; // Distraction Zone
              case 4: scatterX = -100; scatterY = -10; break; // Memory Master shifted up
              case 5: scatterX = 30; scatterY = -20; break;
              default:
                scatterX = (index * 53) % 80 - 40;
                scatterY = (index * 37) % 60 - 30;
            }

            return (
              <div
                key={level.id}
                style={{
                  gridColumn: col + 1,
                  gridRow: row + 1,
                  transform: `translate(${scatterX}px, ${scatterY}px)`
                }}
              >
                {/* Level Node */}
                <div
                  data-level-node
                  onClick={() => isUnlocked && onStartLevel(level)}
                  className="relative flex flex-col items-center group cursor-pointer"
                >
                  <div className={`
                    w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-xl transition-all duration-300 transform group-hover:scale-125 active:scale-90
                    ${isCompleted
                      ? 'bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white'
                      : isUnlocked
                        ? 'bg-white border-4 border-[#E8F4F9] text-[#5A92AB] ring-4 ring-transparent group-hover:ring-[#E8F4F9]'
                        : 'bg-gray-100 text-gray-400 grayscale'}
                  `}>
                    {isCompleted ? <CheckCircle className="w-6 h-6" /> :
                      !isUnlocked ? <Lock className="w-5 h-5" /> :
                        <Target className="w-6 h-6" />}
                  </div>

                  <div className={`
                    flex flex-col
                    ${index === 0
                      ? 'absolute left-full ml-4 top-1/2 -translate-y-1/2 whitespace-nowrap items-start'
                      : index === 1
                        ? 'absolute bottom-full mb-4 left-1/2 -translate-x-1/2 whitespace-nowrap items-center'
                        : 'mt-4 items-center text-center'}
                  `}>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isUnlocked ? 'text-[#5A92AB]' : 'text-gray-400'}`}>
                      Level {level.id}
                    </span>
                    <h4 className={`font-black text-[15px] leading-tight transition-colors ${isUnlocked ? 'text-[#2C3E50]' : 'text-gray-400'}`}>
                      {level.name}
                    </h4>
                    {isUnlocked && (
                      <span className={`text-[10px] font-bold flex items-center gap-1 mt-0.5 ${isCompleted ? 'text-[#5D9B7A]' : 'text-gray-400'}`}>
                        <Zap className={`w-3 h-3 ${isCompleted ? 'fill-current' : ''}`} />
                        {isCompleted ? level.xpReward : 0} XP Earned
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
