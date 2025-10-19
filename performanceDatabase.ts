// performanceDatabase.ts

export interface PerformanceData {
  feedCode: string;
  productPhase: 'HEO CON' | 'HEO CHOAI' | 'HEO THỊT';
  weekOfAge: number;
  startDayOld: number;
  weight: number;
  adg: number;
  fcr: number;
  feedIntakePercentage: number;
  adfi1: number;
  adfi2: number;
  accumulatedIntake: number;
}

// This database is no longer used in the new calculation logic.
export const performanceDatabase: PerformanceData[] = [];