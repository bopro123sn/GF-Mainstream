import { Stage } from './types';
import { feedDatabase, stageToPhaseMap } from './feedDatabase';

export const BAG_WEIGHT = 25; // Standard bag weight in kg

const getDefaultProductCode = (phase: 'HEO CON' | 'HEO CHOAI' | 'HEO THỊT'): string => {
  return feedDatabase.find(f => f.phase === phase)?.code || '';
}

export const INITIAL_STAGES: Stage[] = [
  { 
    name: 'Heo con', 
    startWeight: 7, 
    endWeight: 25, 
    feeds: [{ id: '1', productCode: getDefaultProductCode('HEO CON'), pricePerBag: 625000, bagsConsumed: 0 }]
  },
  { 
    name: 'Heo choai', 
    startWeight: 25, 
    endWeight: 50, 
    feeds: [{ id: '2', productCode: getDefaultProductCode('HEO CHOAI'), pricePerBag: 550000, bagsConsumed: 0 }]
  },
  { 
    name: 'Heo thịt', 
    startWeight: 50, 
    endWeight: 100, 
    feeds: [{ id: '3', productCode: getDefaultProductCode('HEO THỊT'), pricePerBag: 500000, bagsConsumed: 0 }]
  },
];
