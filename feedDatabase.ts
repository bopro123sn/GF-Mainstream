// feedDatabase.ts

export interface FeedProduct {
  code: string;
  phase: 'HEO CON' | 'HEO CHOAI' | 'HEO THỊT';
}

// Unique feed codes per phase from the provided database
export const feedDatabase: FeedProduct[] = [
  // Giai đoạn heo con
  { code: '1012IP', phase: 'HEO CON' },
  { code: '1922IP', phase: 'HEO CON' },
  { code: '1922MP', phase: 'HEO CON' },

  // Giai đoạn heo choai
  { code: '1002', phase: 'HEO CHOAI' },
  { code: '1032S', phase: 'HEO CHOAI' },
  { code: '1932MP', phase: 'HEO CHOAI' },
  { code: '9032IP', phase: 'HEO CHOAI' },
  
  // Giai đoạn heo thịt
  { code: '1002', phase: 'HEO THỊT' },
  { code: '1102S', phase: 'HEO THỊT' },
  { code: '1202S', phase: 'HEO THỊT' },
  { code: '1412S', phase: 'HEO THỊT' },
];

export const stageToPhaseMap: { [key: string]: FeedProduct['phase'] } = {
  'Heo con': 'HEO CON',
  'Heo choai': 'HEO CHOAI',
  'Heo thịt': 'HEO THỊT',
};
