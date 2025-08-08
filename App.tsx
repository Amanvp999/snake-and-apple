import React, { useState, useEffect, useCallback } from 'react';
import { useInterval } from './hooks/useInterval';
import { Coordinates, Direction } from './types';
import {
  BOARD_SIZE,
  INITIAL_SNAKE,
  INITIAL_FOOD,
  INITIAL_DIRECTION,
  INITIAL_SPEED,
  SPEED_INCREMENT,
} from './constants';

const FunFactDisplay: React.FC<{
  fact: string;
  isLoading: boolean;
}> = ({ fact, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="animate-pulse text-gray-400">Loading fun fact...</div>
      </div>
    );
  }

  if (!fact) return null;

  return (
    <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-sm font-semibold text-teal-400 mb-2">🐍 Fun Fact:</h3>
      <p className="text-sm text-gray-300">{fact}</p>
    </div>
  );
};

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Coordinates[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Coordinates>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(INITIAL_SPEED);
  const [funFact, setFunFact] = useState<string>('');
  const [isFactLoading, setIsFactLoading] = useState<boolean>(false);

  const generateFood = useCallback((): Coordinates => {
    let newFood: Coordinates;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  const fetchFunFact = useCallback(async () => {
    setIsFactLoading(true);
    setFunFact('');
    try {
      // For now, we'll use a simple array of facts
      const facts = [
        "Snakes can't bite food, so they have to swallow it whole!",
        "Apples float because 25% of their volume is air.",
        "A group of snakes is called a 'nest' or 'den'.",
        "There are over 7,500 varieties of apples grown worldwide.",
        "Snakes smell with their tongues!",
        "Apple trees can live for over 100 years.",
        "Some snakes can go months without eating.",
        "Apples are more effective than coffee at waking you up in the morning."
      ];
      const randomFact = facts[Math.floor(Math.random() * facts.length)];
      setFunFact(randomFact);
    } catch (error) {
      console.error("Error fetching fun fact:", error);
      setFunFact("Could not fetch a fact right now. Please try again later.");
    } finally {
      setIsFactLoading(false);
    }
  }, []);

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        setGameOver(true);
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prevScore => prevScore + 1);
        setFood(generateFood());
        setSpeed(prevSpeed => Math.max(50, prevSpeed - SPEED_INCREMENT));
        fetchFunFact();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, generateFood, fetchFunFact]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameOver) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setDirection(prev => prev !== 'DOWN' ? 'UP' : prev);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setDirection(prev => prev !== 'UP' ? 'DOWN' : prev);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setDirection(prev => prev !== 'RIGHT' ? 'LEFT' : prev);
        break;
      case 'ArrowRight':
        e.preventDefault();
        setDirection(prev => prev !== 'LEFT' ? 'RIGHT' : prev);
        break;
    }
  }, [gameOver]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setFunFact('');
  };

  useInterval(moveSnake, gameOver ? null : speed);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 p-4">
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-teal-400 mb-2 tracking-widest">
          GEMINI SNAKE
        </h1>
        <p className="text-sm text-gray-500 mb-4">Use arrow keys to control the snake</p>
        <div className="text-lg text-gray-400 mb-4">Score: <span className="font-bold text-green-400 text-2xl">{score}</span></div>
      </div>

      <div className="relative">
        <div 
          className="grid gap-0 border-2 border-teal-500 bg-gray-900 shadow-2xl"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            width: '400px',
            height: '400px',
          }}
        >
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, index) => {
            const x = index % BOARD_SIZE;
            const y = Math.floor(index / BOARD_SIZE);
            const isSnake = snake.some(segment => segment.x === x && segment.y === y);
            const isHead = snake[0]?.x === x && snake[0]?.y === y;
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={index}
                className={`
                  border border-gray-800
                  ${isSnake 
                    ? isHead 
                      ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg' 
                      : 'bg-gradient-to-br from-green-500 to-green-700'
                    : ''
                  }
                  ${isFood ? 'bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg' : ''}
                `}
              />
            );
          })}
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="text-center bg-gray-800 p-6 rounded-lg border border-teal-500">
              <h2 className="text-3xl font-bold text-red-400 mb-4">Game Over!</h2>
              <p className="text-xl text-gray-300 mb-4">Final Score: {score}</p>
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      <FunFactDisplay fact={funFact} isLoading={isFactLoading} />

      <div className="mt-6 text-center text-gray-500 text-sm">
        <p>🐍 Eat apples to grow and increase your score!</p>
        <p>Speed increases with each apple eaten</p>
      </div>
    </div>
  );
};

export default SnakeGame;