export interface Accessory {
  id: string;
  name: string;
  cost: number;
  emoji: string;
  description: string;
  category: "hat" | "eyes" | "neck";
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockedAtStars: number;
}

export type MathTopic = "fractions" | "coordinates" | "volume" | "data";

export interface FractionQuestion {
  id: number;
  targetNumerator: number;
  targetDenominator: number;
  shadedCount: number;
  userEstimatedDecimal: string;
  solved: boolean;
  type: "shade" | "decimal" | "equivalent";
  equivalenceTarget?: { numerator: number; denominator: number }; // e.g. 2/4 equivalent to 1/2
}

export interface CoordinateQuestion {
  id: number;
  targetX: number;
  targetY: number;
  solved: boolean;
  type: "plot" | "read";
  placedX?: number;
  placedY?: number;
}

export interface VolumeQuestion {
  id: number;
  targetWidth: number;
  targetHeight: number;
  targetDepth: number;
  solved: boolean;
  type: "calculate" | "build";
  userAnswer?: number;
}

export interface DataResponseItem {
  label: string;
  value: number;
}

export interface DataQuestion {
  id: number;
  items: DataResponseItem[];
  targetQuestion: string;
  correctAnswer: string;
  choices: string[];
  type: "mean" | "total" | "mode";
}

export interface KidProgress {
  stars: number;
  completedQuests: Record<MathTopic, boolean>;
  solvedCount: Record<MathTopic, number>;
  unlockedAccessories: string[];
  equippedAccessory: string | null;
}
