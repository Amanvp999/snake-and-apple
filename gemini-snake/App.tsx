
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useInterval } from './hooks/useInterval';
import { Coordinates, Direction } from './types';
import {
  GRID_SIZE,
  INITIAL_SNAKE_POSITION,
  INITIAL_APPLE_POSITION,
  INITIAL_DIRECTION,
  INITIAL_SPEED,
  SPEED_INCREMENT,
} from './constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const FunFactDisplay: React.FC<{
  fact: string;
  isLoading: boolean;
  onGetFact: () => void;
}> = ({ fact, isLoading, onGetFact }) => (
  <div className="mt-8 p-4 bg-gray-800 border border-teal-500 rounded-lg shadow-lg w-full max-w-xl text-center">
    <button
      onClick={onGetFact}
      disabled={isLoading}
      className="mb-4 px-6 py-2 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Getting Fact...
        </>
      ) : (
        'Get a Fun Fact!'
      )}
    </button>
    {fact && (
      <p className="text-teal-300 italic">
        <strong className="text-teal-200">Did you know?</strong> {fact}
      </p>
    )}
  </div>
);

const GameOverScreen: React.FC<{ score: number; onRestart: () => void }> = ({ score, onRestart }) => (
  <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center z-10">
    <h2 className="text-5xl font-bold text-red-500 mb-4">Game Over</h2>
    <p className="text-2xl text-white mb-6">Your Score: {score}</p>
    <button
      onClick={onRestart}
      className="px-8 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors duration-200 text-xl"
    >
      Restart
    </button>
  </div>
);

const App: React.FC = () => {
  const [snake, setSnake] = useState<Coordinates[]>(INITIAL_SNAKE_POSITION);
  const [apple, setApple] = useState<Coordinates>(INITIAL_APPLE_POSITION);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [speed, setSpeed] = useState<number | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);

  const [funFact, setFunFact] = useState<string>('');
  const [isFactLoading, setIsFactLoading] = useState<boolean>(false);

  const createNewApple = useCallback((): Coordinates => {
    while (true) {
      const newApple = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!snake.some(segment => segment.x === newApple.x && segment.y === newApple.y)) {
        return newApple;
      }
    }
  }, [snake]);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE_POSITION);
    setApple(INITIAL_APPLE_POSITION);
    setDirection(INITIAL_DIRECTION);
    setSpeed(null);
    setIsGameOver(false);
    setScore(0);
    setIsGameStarted(false);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isGameStarted) {
      setIsGameStarted(true);
      setSpeed(INITIAL_SPEED);
    }

    const key = e.key;
    switch (key) {
      case 'ArrowUp':
        if (direction !== Direction.DOWN) setDirection(Direction.UP);
        break;
      case 'ArrowDown':
        if (direction !== Direction.UP) setDirection(Direction.DOWN);
        break;
      case 'ArrowLeft':
        if (direction !== Direction.RIGHT) setDirection(Direction.LEFT);
        break;
      case 'ArrowRight':
        if (direction !== Direction.LEFT) setDirection(Direction.RIGHT);
        break;
    }
  }, [direction, isGameStarted]);

  const gameLoop = useCallback(() => {
    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    switch (direction) {
      case Direction.UP: head.y -= 1; break;
      case Direction.DOWN: head.y += 1; break;
      case Direction.LEFT: head.x -= 1; break;
      case Direction.RIGHT: head.x += 1; break;
    }

    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      setIsGameOver(true);
      setSpeed(null);
      return;
    }

    // Self collision
    for (let i = 1; i < newSnake.length; i++) {
      if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
        setIsGameOver(true);
        setSpeed(null);
        return;
      }
    }

    newSnake.unshift(head);

    // Apple collision
    if (head.x === apple.x && head.y === apple.y) {
      setScore(prev => prev + 1);
      setApple(createNewApple());
      setSpeed(prev => (prev ? Math.max(50, prev - SPEED_INCREMENT) : null));
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, apple, createNewApple]);

  const fetchFunFact = useCallback(async () => {
    setIsFactLoading(true);
    setFunFact('');
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Tell me a very short, interesting, and fun fact about snakes or apples.",
        config: { temperature: 1 }
      });
      setFunFact(response.text);
    } catch (error) {
      console.error("Error fetching fun fact:", error);
      setFunFact("Could not fetch a fact right now. Please try again later.");
    } finally {
      setIsFactLoading(false);
    }
  }, []);

  useInterval(gameLoop, speed);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-mono">
      <h1 className="text-4xl md:text-5xl font-bold text-teal-400 mb-2 tracking-widest">
        GEMINI SNAKE
      </h1>
      <div className="text-lg text-gray-400 mb-4">Score: <span className="font-bold text-green-400 text-2xl">{score}</span></div>
      
      <div 
        className="w-full h-auto max-w-xl max-h-xl aspect-square bg-black border-4 border-teal-500 shadow-[0_0_20px_rgba(34,211,238,0.5)] rounded-lg relative"
      >
        {isGameOver && <GameOverScreen score={score} onRestart={resetGame} />}
        {!isGameStarted && !isGameOver && (
          <div className="absolute inset-0 flex justify-center items-center">
            <p className="text-2xl text-gray-400 animate-pulse">Press any arrow key to start</p>
          </div>
        )}
        {isGameStarted && (
          <div className="w-full h-full grid" style={{gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`}}>
            {snake.map((segment, index) => (
              <div
                key={index}
                className={`
                  ${index === 0 ? 'bg-green-400 rounded-sm shadow-[0_0_10px_rgba(134,239,172,0.8)]' : 'bg-green-500'}
                `}
                style={{ gridColumnStart: segment.x + 1, gridRowStart: segment.y + 1 }}
              />
            ))}
            <div
              className="bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)]"
              style={{ gridColumnStart: apple.x + 1, gridRowStart: apple.y + 1 }}
            />
          </div>
        )}
      </div>

      <FunFactDisplay fact={funFact} isLoading={isFactLoading} onGetFact={fetchFunFact} />
    </div>
  );
};

export default App;
