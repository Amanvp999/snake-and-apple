
import { Coordinates, Direction } from './types';

export const GRID_SIZE = 20;
export const INITIAL_SPEED = 200; // ms per tick
export const SPEED_INCREMENT = 5; // ms to subtract per apple

export const INITIAL_SNAKE_POSITION: Coordinates[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

export const INITIAL_APPLE_POSITION: Coordinates = { x: 15, y: 10 };
export const INITIAL_DIRECTION = Direction.RIGHT;
