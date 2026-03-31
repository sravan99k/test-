import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface FloatingActionButtonProps {
  isChatOpen?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ isChatOpen = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [position, setPosition] = useState({ y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Check if we're currently on the BuddySafe page
  const isOnBuddySafe = location.pathname === '/buddysafe';

  // Initialize position on component mount
  useEffect(() => {
    // Set initial position to 70% from top
    setPosition({ y: window.innerHeight * 0.7 });

    const handleResize = () => {
      // Maintain relative position on resize
      if (buttonRef.current) {
        const buttonHeight = buttonRef.current.offsetHeight;
        const maxY = window.innerHeight - buttonHeight - 10;
        setPosition(prev => ({
          y: Math.max(100, Math.min(prev.y, maxY))
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDragStartY(e.clientY - rect.top);
      setIsDragging(true);  // Start with dragging true
      setHasMoved(false);   // Reset hasMoved on mousedown
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !buttonRef.current) return;

    // Set hasMoved to true as soon as we detect movement
    if (!hasMoved) {
      setHasMoved(true);
    }

    const buttonHeight = buttonRef.current.offsetHeight;
    const newY = e.clientY - dragStartY;

    // Constrain vertically within viewport with 10px padding from top/bottom
    // Minimum 100px from top to avoid navbar
    const maxY = window.innerHeight - buttonHeight - 10;
    const constrainedY = Math.max(100, Math.min(newY, maxY));

    setPosition({ y: constrainedY });
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (hasMoved) {
      e.preventDefault();
    }

    // Reset the dragging state
    setIsDragging(false);

    // Use a small timeout to prevent click after drag
    setTimeout(() => {
      setHasMoved(false);
    }, 0);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartY]);

  const handleClick = (e: React.MouseEvent) => {
    // Only navigate if we didn't just finish dragging
    if (hasMoved) {
      e.preventDefault();
      return;
    }

    if (isOnBuddySafe) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/buddysafe');
    }
  };

  // Handle touch events for mobile
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (hasMoved) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    if (isOnBuddySafe) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/buddysafe');
    }

    // Reset the movement flag
    setHasMoved(false);
  };

  // Always show the button, but change its text based on the current page
  const buttonText = isOnBuddySafe ? 'Need Help?' : 'Get Help!';

  return (
    <button
      id="onboarding-buddysafe-floating"
      ref={buttonRef}
      onClick={handleClick}
      onTouchStart={() => setHasMoved(false)}
      onTouchMove={() => setHasMoved(true)}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      className={`fixed ${isChatOpen ? 'left-3' : 'right-3'} z-50 flex flex-col items-center bg-transparent border-none shadow-none p-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab transition-all duration-300 ease-in-out'
        }`}
      style={{
        top: `${position.y}px`,
        transform: isDragging ? 'scale(1.05)' : 'none',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label="Get Help"
    >
      <div className="flex flex-col items-center">
        <img
          src="/images/buddysafeicon.png"
          alt="Get Help"
          className="w-16 h-16 object-contain"
        />
        <span className="text-sm font-medium text-blue-600 mt-0 bg-white px-2 py-1 rounded-md shadow-sm">{buttonText}</span>
      </div>
    </button>
  );
};

export default FloatingActionButton;
