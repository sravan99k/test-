import React, { useMemo, useState } from 'react';
import { GAME_DEFINITIONS, GameId } from './game-registry';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface GameContainerProps {
  gameType: string;
  onComplete: (score: number, timeSpent: number) => void;
  onBack: () => void;
}

const GameContainer: React.FC<GameContainerProps> = ({ gameType, onComplete, onBack }) => {
  const [startTime] = useState<number>(Date.now());

  const gameId = useMemo(() => gameType as GameId, [gameType]);
  const gameDefinition = GAME_DEFINITIONS[gameId];

  // Fix: Scroll to top when game starts or changes
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [gameType]);

  const handleGameComplete = (score: number) => {
    const endTime = Date.now();
    const timeSpent = Math.round((endTime - startTime) / 1000);
    onComplete(score, timeSpent);
  };

  const renderGame = () => {
    if (!gameDefinition) {
      return (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md border-2 border-[#3862DD]">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Game Not Found</h2>
            <p className="text-gray-600 mb-6">Oops! This game doesn't exist yet.</p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-[#3862DD] text-white rounded-lg hover:bg-[#2d4fb3] transition-colors"
            >
              Back to Games
            </button>
          </div>
        </div>
      );
    }

    if (gameDefinition.isComingSoon || !gameDefinition.component) {
      return (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md border-2 border-[#3862DD]">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Coming Soon!</h2>
            <p className="text-gray-600 mb-6">This awesome game is being developed! Check back soon for more brain training fun!</p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-[#3862DD] text-white rounded-lg hover:bg-[#2d4fb3] transition-colors"
            >
              Back to Games
            </button>
          </div>
        </div>
      );
    }

    const GameComponent = gameDefinition.component;
    return <GameComponent onComplete={handleGameComplete} onBack={onBack} />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 min-h-0 flex flex-col">
        {renderGame()}
      </main>
      <Footer />
    </div>
  );
};

export default GameContainer;
