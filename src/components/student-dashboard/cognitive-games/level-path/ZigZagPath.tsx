import React, { useMemo } from 'react';

interface PathPoint {
  x: number;
  y: number;
}

interface ZigZagPathProps {
  levelCount: number;
  nodeHeight: number;
  leftX: number;  // percentage (0-100)
  rightX: number; // percentage (0-100)
  completedLevels: Set<number>;
}

export const ZigZagPath: React.FC<ZigZagPathProps> = ({
  levelCount,
  nodeHeight,
  leftX,
  rightX,
  completedLevels,
}) => {
  const totalHeight = levelCount * nodeHeight;

  // Use viewBox coordinates (0-100 for X, actual pixels for Y)
  const viewBoxWidth = 100;

  // Calculate all node center positions in viewBox coordinates
  const nodePositions = useMemo<PathPoint[]>(() => {
    return Array.from({ length: levelCount }, (_, index) => ({
      x: index % 2 === 0 ? leftX : rightX,
      y: index * nodeHeight + nodeHeight / 2,
    }));
  }, [levelCount, nodeHeight, leftX, rightX]);

  // Generate path segments between consecutive nodes
  const pathSegments = useMemo(() => {
    if (nodePositions.length < 2) return [];

    return nodePositions.slice(0, -1).map((start, index) => {
      const end = nodePositions[index + 1];
      const isCompleted = completedLevels.has(index + 1) && completedLevels.has(index + 2);
      const isPartiallyCompleted = completedLevels.has(index + 1);

      // Calculate control points for smooth S-curve
      const midY = (start.y + end.y) / 2;

      return {
        id: index,
        d: `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`,
        isCompleted,
        isPartiallyCompleted,
      };
    });
  }, [nodePositions, completedLevels]);

  return (
    <svg
      className="absolute inset-0 w-full pointer-events-none z-0"
      style={{ height: totalHeight }}
      viewBox={`0 0 ${viewBoxWidth} ${totalHeight}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Glow filter definitions */}
      <defs>
        <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Background track (thicker, subtle) */}
      {pathSegments.map((segment) => (
        <path
          key={`bg-${segment.id}`}
          d={segment.d}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#soft-shadow)"
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* Main path with color based on completion */}
      {pathSegments.map((segment) => (
        <path
          key={segment.id}
          d={segment.d}
          fill="none"
          stroke={segment.isCompleted ? '#10b981' : segment.isPartiallyCompleted ? '#0ea5e9' : '#94a3b8'}
          strokeWidth="3"
          strokeLinecap="round"
          className="transition-all duration-500"
          filter={segment.isCompleted ? 'url(#glow-green)' : segment.isPartiallyCompleted ? 'url(#glow-blue)' : 'none'}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* Node glow circles at each position */}
      {nodePositions.map((pos, index) => {
        const isCompleted = completedLevels.has(index + 1);
        const isNext = !isCompleted && (index === 0 || completedLevels.has(index));

        return (
          <circle
            key={`glow-${index}`}
            cx={pos.x}
            cy={pos.y}
            r="8"
            fill={isCompleted ? 'rgba(16, 185, 129, 0.2)' : isNext ? 'rgba(14, 165, 233, 0.15)' : 'rgba(148, 163, 184, 0.1)'}
            className="transition-all duration-500"
          />
        );
      })}
    </svg>
  );
};