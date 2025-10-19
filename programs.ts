// programs.ts
import { Stage, Feed, Program } from './types';

// Helper to create unique IDs for feeds.
let feedIdCounter = 0;
const createFeed = (productCode: string, pricePerBag: number, bagsConsumed: number | string): Feed => ({
  id: `prog-feed-${feedIdCounter++}`,
  productCode,
  pricePerBag,
  bagsConsumed,
});

export const programs: Program[] = [
  {
    name: 'Base Mainstream',
    stages: [
      { 
        name: 'Heo con', 
        startWeight: 7, 
        endWeight: 25, 
        feeds: [
            createFeed('1012IP', 600000, 0.24),
            createFeed('1922IP', 419348.97, 1)
        ]
      },
      { 
        name: 'Heo choai', 
        startWeight: 25, 
        endWeight: 50, 
        feeds: [
            createFeed('1002', 325000, 1),
            createFeed('1002', 262500, 2)
        ]
      },
      { 
        name: 'Heo thịt', 
        startWeight: 50, 
        endWeight: 100, 
        feeds: [
            createFeed('1002', 262500, 5.32),
            createFeed('1412S', 242500, 1)
        ]
      },
    ]
  },
  {
    name: 'Strategy Mainstream',
    stages: [
      { 
        name: 'Heo con', 
        startWeight: 7, 
        endWeight: 25, 
        feeds: [
            createFeed('1012IP', 600000, 0.24),
            createFeed('1922IP', 419348.97, 1)
        ]
      },
      { 
        name: 'Heo choai', 
        startWeight: 25, 
        endWeight: 50, 
        feeds: [
            createFeed('1932MP', 325000, 2),
            createFeed('1002', 262500, 1)
        ]
      },
      { 
        name: 'Heo thịt', 
        startWeight: 50, 
        endWeight: 100, 
        feeds: [
            createFeed('1002', 262500, 5),
            createFeed('1412S', 242500, 1)
        ]
      },
    ]
  },
  {
    name: 'Classic Mainstream',
    stages: [
      { 
        name: 'Heo con', 
        startWeight: 7, 
        endWeight: 25, 
        feeds: [
            createFeed('1012IP', 600000, 0.24),
            createFeed('1922IP', 419349, 1)
        ]
      },
      { 
        name: 'Heo choai', 
        startWeight: 25, 
        endWeight: 50, 
        feeds: [
            createFeed('1932MP', 325000, 1),
            createFeed('1002', 262500, 2)
        ]
      },
      { 
        name: 'Heo thịt', 
        startWeight: 50, 
        endWeight: 100, 
        feeds: [
            createFeed('1002', 262500, 5.24),
            createFeed('1412S', 242500, 1)
        ]
      },
    ]
  }
];
