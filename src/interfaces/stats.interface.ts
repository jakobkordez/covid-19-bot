export interface Stats {
  dayFromStart: number;
  year: number;
  month: number;
  day: number;
  performedTests: number;
  positiveTests: number;
  statePerTreatment: {
    inHospital: number;
  };
  cases: {
    confirmedToday: number;
  };
}
