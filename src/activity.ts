export interface EnergySpending {
  kJPerBodyKg?: number;
  kJPerWeightsKg?: number;
}

export interface Unit {
  name: string;
  description?: string;
  defaultIcon?: string;
  shorthand?: string;
}

export interface MeasurementType {
  name: string;
  defaultIcon?: string;
  units: string[];
}

export interface MeasurementTypeRepository {
  getAll(): MeasurementType[];
}

export interface ActivityType {
  isBaseOnly?: boolean; // should only used as a base type
  baseActivity?: string; // e.g. runn

  name: string;
  description?: string;

  measurements?: { [key: string]: string }; //string[]; // for editor suggestions of measurements to fill out
  //physiologyLoad?: Map<PhysiologyItem, number>; // not scientific, just an estimate of share of loads on different parts of body
  physiologyLoad?: { [key: string]: number };

  defaultIntensity?: EnergySpending; // instead maybe provide a formula for calculating energy spent?
}

export interface ActivityTypeRepository {
  getAll(includeAbstract: boolean): ActivityType[];
}

export interface Measurement {
  measurement: string;
  value: number;
  unit?: string;
  comment?: string;
}

export interface LoggedActivity {
  timestamp: Date;
  activity: string; // "rowing"
  activityModifier?: string; // "feet on floor"
  laterality?: "l" | "r";
  measurements: Measurement[]; // [[ "kg", 10], [ "" ]]
  //measurements: { [key: string]: [string, number] };  // { elevation: ["m", 10]
  comment?: string;
}
