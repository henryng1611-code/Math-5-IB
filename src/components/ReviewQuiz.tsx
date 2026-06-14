import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Award, RotateCcw, ArrowRight, Play, BookOpen, Clock, HelpCircle, CheckCircle2, XCircle, ChevronRight, Trophy, Save, FileText, Check, Edit3, Bookmark, Download, Trash, Eye, ShieldAlert, Sparkles, Lock, Unlock } from "lucide-react";
import { generateExercise } from "../utils/questionGenerator";
import confetti from "canvas-confetti";

interface Question {
  id: string;
  context: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizCategory {
  id: string;
  title: string;
  emoji: string;
  strand: string;
  description: string;
  starsReward: number;
  colorClass: string;
  bgLightClass: string;
  borderClass: string;
  textClass: string;
  questions: Question[];
}

interface SavedExplanation {
  id: string;
  timestamp: string;
  categoryTitle: string;
  questionText: string;
  playerExplanation: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  teacherRating: number; // 0 to 5
  teacherFeedback: string;
}

const QUIZ_CATEGORIES: QuizCategory[] = [
  {
    id: "fractions_decimals",
    title: "Fractions & Decimals Review",
    emoji: "🍰",
    strand: "Strand: Numbers",
    description: "Inquire about pizza splits, decimal equivalents, adding fractional charges, and simplifying terms to lowest values.",
    starsReward: 15,
    colorClass: "bg-amber-500",
    bgLightClass: "bg-amber-50/70",
    borderClass: "border-amber-200",
    textClass: "text-amber-700",
    questions: [
      {
        id: "f1",
        context: "🌱 Theme: Sharing the Planet",
        question: "We partitioned a school vegetable plot. If 4/5 of the plot grows organic tomatoes, which decimal represents the tomato field's size?",
        choices: ["0.4", "0.8", "0.75", "0.08"],
        correctIndex: 1,
        explanation: "Since 4/5 is equivalent to 8/10 (by multiplying both the top and bottom by 2), it divides to exactly 0.8 in decimal representation!"
      },
      {
        id: "f2",
        context: "🍪 Theme: How We Organize Ourselves",
        question: "In our food waste inquiry, Barnaby ate 2/3 of a cherry pie, and Leo ate 4/6 of a matching pie. What is true about their shares?",
        choices: ["Leo ate more than Barnaby", "Barnaby ate more than Leo", "They ate equivalent amounts", "Together they ate exactly half a pie"],
        correctIndex: 2,
        explanation: "4/6 can be simplified by dividing both the numerator and denominator by 2, which gives 2/3. Therefore, they ate equivalent amounts of pie!"
      },
      {
        id: "f3",
        context: "⚡ Theme: How the World Works",
        question: "If 3/4 of a solar battery is charged, and another 1/8 is added from supplementary panels, what is the total charge?",
        choices: ["4/12 of a charge", "5/8 of a charge", "7/4 of a charge", "7/8 of a charge"],
        correctIndex: 3,
        explanation: "To add 3/4 and 1/8, convert 3/4 to have a denominator of 8. 3/4 = (3*2)/(4*2) = 6/8. Then, 6/8 + 1/8 = 7/8 total charge!"
      },
      {
        id: "f4",
        context: "🔬 Theme: Inquiry & Metrics",
        question: "Identify the decimal value of the fraction 7/20.",
        choices: ["0.7", "0.07", "0.35", "0.72"],
        correctIndex: 2,
        explanation: "To convert 7/20 to hundredths, multiply the top and bottom by 5: (7*5)/(20*5) = 35/100, which is exactly 0.35!"
      },
      {
        id: "f5",
        context: "🏛️ Theme: Historical Tallies",
        question: "Simplify the fraction 18/24 to its simplest, lowest terms.",
        choices: ["9/12", "6/8", "2/3", "3/4"],
        correctIndex: 3,
        explanation: "Divide both the numerator (18) and denominator (24) by their greatest common factor, which is 6. 18 ÷ 6 = 3, and 24 ÷ 6 = 4. This simplifies to 3/4!"
      }
    ]
  },
  {
    id: "coordinates_plane",
    title: "Coordinate Plane Journey",
    emoji: "🎯",
    strand: "Strand: Shape & Space",
    description: "Navigate 4 quadrants, plot latitude anchors, calculate relative position transformations, and construct shapes.",
    starsReward: 15,
    colorClass: "bg-cyan-500",
    bgLightClass: "bg-cyan-50/70",
    borderClass: "border-cyan-200",
    textClass: "text-cyan-700",
    questions: [
      {
        id: "c1",
        context: "🧭 Theme: Where We Are in Place & Time",
        question: "On our coordinate treasure map, we plot an anchor at point (5, -3). Which quadrant does the anchor rest in?",
        choices: ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"],
        correctIndex: 3,
        explanation: "The x-value is positive (move right) and the y-value is negative (move down). Positive x and negative y places us in Quadrant IV!"
      },
      {
        id: "c2",
        context: "🚀 Theme: Journey into Space",
        question: "If we start at the Origin (0,0) and move 4 units to the left, then 6 units up, where do we land?",
        choices: ["(4, 6)", "(-4, 6)", "(6, -4)", "(-4, -6)"],
        correctIndex: 1,
        explanation: "Moving left of the origin means the x-coordinate becomes negative (-4). Moving up means the y-coordinate remains positive (6). So, we land at (-4, 6)!"
      },
      {
        id: "c3",
        context: "🛰️ Theme: GPS Navigation",
        question: "A beacon is located at (-2, -5). We shift its position by adding +5 to the x-coordinate and +2 to the y-coordinate. What is its new location?",
        choices: ["(3, -3)", "(-7, -7)", "(3, -7)", "(-3, 3)"],
        correctIndex: 0,
        explanation: "Add the offsets to each coordinate: x = -2 + 5 = 3. y = -5 + 2 = -3. The new transformed position is (3, -3)!"
      },
      {
        id: "c4",
        context: "📐 Theme: Geometry Baselines",
        question: "What is the mathematical name for the coordinate point (0, 0) where the horizontal X-axis and vertical Y-axis cross?",
        choices: ["The Anchor", "The Axis Center", "The Origin", "The Apex"],
        correctIndex: 2,
        explanation: "The point (0, 0) is called the Origin. It acts as the anchor reference starting point from which all coordinates are measured!"
      },
      {
        id: "c5",
        context: "🏰 Theme: Architectural Layouts",
        question: "Three corners of a rectangular fortress are plotted at (-3, 2), (4, 2), and (4, -1). What is the coordinate of the fourth corner?",
        choices: ["(-3, -1)", "(-1, -3)", "(-3, 1)", "(3, -1)"],
        correctIndex: 0,
        explanation: "A rectangle must have aligned opposite sides. The top side goes from x = -3 to x = 4 at y = 2. The right side goes from y = 2 to y = -1 at x = 4. The fourth corner must match the left x (-3) and the bottom y (-1), resulting in (-3, -1)!"
      }
    ]
  },
  {
    id: "volume_measurement",
    title: "Volume Architect 3D Review",
    emoji: "🧊",
    strand: "Strand: Measurement",
    description: "Find cubic centimeter counts, calculate prism dimensions with equations, and optimize storage volume.",
    starsReward: 15,
    colorClass: "bg-indigo-500",
    bgLightClass: "bg-indigo-50/75",
    borderClass: "border-indigo-200",
    textClass: "text-indigo-700",
    questions: [
      {
        id: "v1",
        context: "📦 Theme: How We Express Ourselves",
        question: "A modular storage box has length = 6 cm, width = 3 cm, and height = 4 cm. What is its holding volume?",
        choices: ["13 cm³", "36 cm³", "48 cm³", "72 cm³"],
        correctIndex: 3,
        explanation: "To calculate volume, multiply length, width, and height: V = L × W × H = 6 × 3 × 4. 6 × 3 = 18, and 18 × 4 = 72 cm³!"
      },
      {
        id: "v2",
        context: "🌲 Theme: Sharing the Planet",
        question: "A compost box has a bottom base area of 15 square meters, and a height of 3 meters. What is its total capacity volume?",
        choices: ["45 m³", "18 m³", "30 m³", "5 m³"],
        correctIndex: 0,
        explanation: "Volume of a rectangular prism can be calculated as Base Area × Height. 15 m² × 3 m = 45 cubic meters!"
      },
      {
        id: "v3",
        context: "🏢 Theme: How the World Works",
        question: "In our engineering lab, if we double the height of a container box while keeping its length and width exactly the same, what happens to its total volume?",
        choices: ["The volume stays the same", "The volume increases by 8 times", "The volume doubles", "The volume halves"],
        correctIndex: 2,
        explanation: "Since V = l × w × h, multiplying height by 2 multiplies the entire product by 2. The volume will exactly double!"
      },
      {
        id: "v4",
        context: "🎲 Theme: Toybox Design",
        question: "How many small cubes of size 1 cm³ can completely fit inside a larger box measuring 2 cm × 2 cm × 2 cm?",
        choices: ["6 cubes", "8 cubes", "4 cubes", "2 cubes"],
        correctIndex: 1,
        explanation: "The volume of the larger box is 2 × 2 × 2 = 8 cm³. Each small cube is 1 cm³, so exactly 8 small cubes fit!"
      },
      {
        id: "v5",
        context: "💧 Theme: Rainwater Harvesting",
        question: "We are designing a water storage prototype. If it must hold exactly 30 cubic decimeters (dm³), which of the following dimensions is correct?",
        choices: [
          "Length = 5 dm, Width = 4 dm, Height = 2 dm",
          "Length = 4 dm, Width = 4 dm, Height = 2 dm",
          "Length = 5 dm, Width = 3 dm, Height = 2 dm",
          "Length = 6 dm, Width = 5 dm, Height = 2 dm"
        ],
        correctIndex: 2,
        explanation: "Volume = L × W × H. For the correct choice: 5 dm × 3 dm × 2 dm = 15 × 2 = 30 dm³! The other choices give 40, 32, and 60."
      }
    ]
  },
  {
    id: "statistics_data",
    title: "Data & Statistics Survey",
    emoji: "📊",
    strand: "Strand: Data Handling",
    description: "Determine averages (mean), locate most popular modes, calculate range, and compute group total responses.",
    starsReward: 15,
    colorClass: "bg-emerald-500",
    bgLightClass: "bg-emerald-50/70",
    borderClass: "border-emerald-200",
    textClass: "text-emerald-700",
    questions: [
      {
        id: "d1",
        context: "🍎 Theme: Healthy Habits Study",
        question: "In a recess snack research project, 5 student teams recorded their discarded wrappers: 3, 5, 2, 8, and 2 wrappers. What is the MODE of this study?",
        choices: ["4 wrappers", "2 wrappers", "8 wrappers", "2.5 wrappers"],
        correctIndex: 1,
        explanation: "The mode is the value that appears most often in a dataset. Here, the number 2 appears twice, while all other numbers appear once. So, the mode is 2!"
      },
      {
        id: "d2",
        context: "🌡️ Theme: Weather & Earth Inquiry",
        question: "We measured lake temperatures over 4 hours: 15°C, 18°C, 22°C, and 17°C. What is the MEAN (average) temperature in degrees Celsius?",
        choices: ["18°C", "17.5°C", "19°C", "16°C"],
        correctIndex: 0,
        explanation: "To find the mean, sum the temperatures: 15 + 18 + 22 + 17 = 72. Then divide by the count of hours (4): 72 ÷ 4 = 18°C!"
      },
      {
        id: "d3",
        context: "📚 Theme: Library Read-a-thon",
        question: "The total checklist of books checked out by 6 children equals 30 books. What is the 'Fair Share' average (Mean) of books checked out per child?",
        choices: ["6 books", "4.5 books", "5 books", "30 books"],
        correctIndex: 2,
        explanation: "Mean represents 'Fair Share' equal sharing! Dividing the absolute total of 30 books among 6 children (30 ÷ 6) gives exactly 5 books per child."
      },
      {
        id: "d4",
        context: "📏 Theme: Seedlings Growth Study",
        question: "Look at the height levels of five seedlings: 12 cm, 18 cm, 5 cm, 25 cm, 9 cm. What is the RANGE of this botanical data?",
        choices: ["20 cm", "25 cm", "13 cm", "18 cm"],
        correctIndex: 0,
        explanation: "The range is the difference between the maximum and minimum values of a dataset. Maximum = 25 cm and Minimum = 5 cm. Range = 25 - 5 = 20 cm!"
      },
      {
        id: "d5",
        context: "⚽ Theme: Playtime Recreation Survey",
        question: "In an inquiry of playground pastimes, 18 students chose Tag, 12 chose Soccer, 6 chose Hopscotch, and 14 chose Basketball. How many total children were surveyed?",
        choices: ["30 children", "50 children", "44 children", "56 children"],
        correctIndex: 1,
        explanation: "To calculate the total surveyed, add together all the responses: 18 + 12 + 6 + 14 = 50 children surveyed in total!"
      }
    ]
  },
  {
    id: "expert_numbers",
    title: "Order of Operations Masterclass",
    emoji: "⚡",
    strand: "Strand: Numbers (EXPERT)",
    description: "Conquer complex PEMDAS equations featuring exponents, nested brackets, and large numbers.",
    starsReward: 30,
    colorClass: "bg-red-500",
    bgLightClass: "bg-red-50/70",
    borderClass: "border-red-200",
    textClass: "text-red-700",
    questions: [
      {
        id: "ex_n1",
        context: "🧠 Theme: Advanced Coding Logic",
        question: "Solve the following order of operations problem containing exponents and larger numbers: 6^2 - [24 ÷ (2 × 3)] + 15.",
        choices: ["47", "32", "35", "51"],
        correctIndex: 0,
        explanation: "First calculate exponents: 6^2 = 36. Then parenthetical blocks: (2 × 3) = 6. Then division inside brackets: 24 ÷ 6 = 4. Finally, perform additions and subtractions left-to-right: 36 - 4 + 15 = 32 + 15 = 47!"
      },
      {
        id: "ex_n2",
        context: "🚀 Theme: Rocket Propulsion Speed",
        question: "What is the value of this math expression: (5 + 3^3) × 4 - 28?",
        choices: ["100", "72", "128", "80"],
        correctIndex: 0,
        explanation: "Exponents first! 3^3 = 27. Solve inside parenthesis: 5 + 27 = 32. Perform multiplication: 32 × 4 = 128. Finally, subtract: 128 - 28 = 100!"
      },
      {
        id: "ex_n3",
        context: "🌱 Theme: Ecological Population Growth",
        question: "Leo simplifies a wildlife tracking formula: 2 × (10^2 - 15 × 4) + 12. What is the final correct numerical outcome?",
        choices: ["92", "112", "72", "80"],
        correctIndex: 0,
        explanation: "Simplify the exponent inside the parenthesis first: 10^2 = 100. Then multiply: 15 × 4 = 60. Subtract: 100 - 60 = 40. Now multiply outer term: 2 × 40 = 80. Add final number: 80 + 12 = 92!"
      }
    ]
  },
  {
    id: "expert_fractions",
    title: "Mixed Numbers & Shopping Bonanza",
    emoji: "🛒",
    strand: "Strand: Numbers (EXPERT)",
    description: "Multiply complex mixed-number weights and calculate percentage discounts in multi-step shopping situations.",
    starsReward: 30,
    colorClass: "bg-amber-500",
    bgLightClass: "bg-amber-50/70",
    borderClass: "border-amber-200",
    textClass: "text-amber-700",
    questions: [
      {
        id: "ex_f1",
        context: "🎒 Theme: Recycled Goods Market",
        question: "A store sells custom math journals for $4 1/2 each. If Barnaby buys 1 1/3 journals (conceptually) and receives a 20% discount on the total cost, how much does he pay?",
        choices: ["$4.80", "$6.00", "$4.50", "$3.60"],
        correctIndex: 0,
        explanation: "First convert mixed numbers to improper fractions: $4 1/2 = 9/2, 1 1/3 = 4/3. Calculate total: 9/2 × 4/3 = 36/6 = $6.00. Apply a 20% discount: 20% of $6.00 is $1.20 off. Final payable amount: $6.00 - $1.20 = $4.80!"
      },
      {
        id: "ex_f2",
        context: "🚲 Theme: Eco-Friendly Skateboard Store",
        question: "A skateboard is priced at $60. The store offers a 25% (1/4) off coupon. If a secondary student coupon of 10% is then applied to the discounted price, what is the final cost?",
        choices: ["$40.50", "$45.00", "$39.00", "$42.00"],
        correctIndex: 0,
        explanation: "First discount: 25% of $60 is $15 off, so the price becomes $45.00. Then apply 10% on top of $45: 10% of $45 is $4.50 off. Final cost is $45 - $4.50 = $40.50!"
      },
      {
        id: "ex_f3",
        context: "🍫 Theme: Equal Sharing & Ratios",
        question: "A massive chocolate slab weighs 3 1/3 kg. Barnaby needs 3/4 of the slab for a class recipe. How many kilograms of chocolate does Barnaby cut?",
        choices: ["2 1/2 kg", "2 1/4 kg", "2 3/4 kg", "3 kg"],
        correctIndex: 0,
        explanation: "Multiply 3 1/3 and 3/4. Convert 3 1/3 to 10/3. Perform multiplication: 10/3 × 3/4 = (10 × 3)/(3 × 4) = 30/12. Divide both parts by 6: 5/2, which equals exactly 2 1/2 kg!"
      }
    ]
  },
  {
    id: "expert_geometry",
    title: "Geometric Transverse Justifier",
    emoji: "🌀",
    strand: "Strand: Shape & Space (EXPERT)",
    description: "Transform 2D points on the plane, combine reflections and rotations, and justify area assertions.",
    starsReward: 30,
    colorClass: "bg-cyan-500",
    bgLightClass: "bg-cyan-50/70",
    borderClass: "border-cyan-200",
    textClass: "text-cyan-700",
    questions: [
      {
        id: "ex_g1",
        context: "🛰️ Theme: GPS Coordinate Transformation",
        question: "A satellite point is located at A(-3, 5). Point A is reflected over the Y-axis to form B, then rotated 90° clockwise around (0,0) to form C. What is the coordinate of C, and why?",
        choices: [
          "C(5, -3) because reflecting over Y yields (3, 5), and 90° clockwise rotation transforms (x,y) to (y, -x)",
          "C(5, 3) because Y-reflection negates Y, and clockwise rotation leaves x static",
          "C(-5, 3) because reflection swaps axes and rotation negates both values",
          "C(-3, -5) because transformations do not affect the positive/negative signs of coordinate vectors"
        ],
        correctIndex: 0,
        explanation: "Reflecting A(-3, 5) over Y-axis keeps Y same but negates X, yielding B(3, 5). 90° clockwise rotation swaps and negates the second term: (x, y) becomes (y, -x), so (3, 5) becomes (5, -3) exactly!"
      },
      {
        id: "ex_g2",
        context: "🏰 Theme: Architectural Layout Preservations",
        question: "If we translate point A(2, -4) exactly 3 units left and 5 up to get B(-1, 1), and argue whether the perimeter of our translated shape changes, which is correct?",
        choices: [
          "B(-1, 1), and the perimeter is preserved because translations are rigid motions that preserve size and shape",
          "B(5, 1) because translation stretches the grid and dilates original perimeter",
          "B(-1, -9) because translating upward subtracts from Y dimensions",
          "B(2, 1) because horizontal positions do not shift on translation"
        ],
        correctIndex: 0,
        explanation: "Subtract 3 units from x: 2 - 3 = -1. Add 5 units to y: -4 + 5 = 1. Reaching B(-1, 1). Since translation is a rigid motion, it preserves perimeters and sizes exactly!"
      }
    ]
  },
  {
    id: "expert_equations",
    title: "Linear Equations & Plane Functions",
    emoji: "📈",
    strand: "Strand: Algebra & Equations (EXPERT)",
    description: "Inquire about linear slope functions (y = mx + c), coordinate intersection math, and variable grids on 2D surfaces.",
    starsReward: 30,
    colorClass: "bg-purple-650",
    bgLightClass: "bg-purple-50/70",
    borderClass: "border-purple-200",
    textClass: "text-purple-700",
    questions: [
      {
        id: "ex_eq1",
        context: "📈 Theme: Finding Solutions to Linear Planes",
        question: "A linear function follows the rule y = 2x + 1. If we plot a point with x = 3 on this line, what must its corresponding y-coordinate be?",
        choices: ["y = 7", "y = 6", "y = 5", "y = 8"],
        correctIndex: 0,
        explanation: "Substitute x = 3 into the linear function equation: y = 2(3) + 1 = 6 + 1 = 7. Thus, the coordinate on the plane is (3, 7)!"
      },
      {
        id: "ex_eq2",
        context: "🛰️ Theme: Intersecting Transit Paths",
        question: "Two space shuttles travel on lines y = x + 2 and y = -x + 4. At what unique coordinate on the ±10 coordinate plane do their paths intersect?",
        choices: ["(1, 3)", "(2, 4)", "(0, 2)", "(-1, 1)"],
        correctIndex: 0,
        explanation: "Set equations equal to find intersection: x + 2 = -x + 4 => 2x = 2 => x = 1. Substitute x = 1 back into either equation to find y: y = 1 + 2 = 3. The intersection point is (1, 3)!"
      },
      {
        id: "ex_eq3",
        context: "🏗️ Theme: Structural Slope Constants",
        question: "An engineered ramp is drawn on a coordinate grid from (0,0) to (5,10). What is the constant slope (change in y divided by change in x) of this linear path?",
        choices: ["2", "1/2", "5", "10"],
        correctIndex: 0,
        explanation: "Slope m is calculated as (y2 - y1) / (x2 - x1) = (10 - 0) / (5 - 0) = 10 / 5 = 2. This represents a steep rise rate of 2!"
      }
    ]
  }
];

interface ReviewQuizProps {
  onEarnStars: (count: number) => void;
  onSetBarnaby: (mood: "happy" | "thinking" | "resting" | "correct" | "incorrect", msg: string) => void;
}

export default function ReviewQuiz({ onEarnStars, onSetBarnaby }: ReviewQuizProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizHistory, setQuizHistory] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("math5ib_quiz_scores");
    return saved ? JSON.parse(saved) : {};
  });

  const [userExplanationText, setUserExplanationText] = useState<string>("");
  const [savedExplanations, setSavedExplanations] = useState<SavedExplanation[]>(() => {
    const saved = localStorage.getItem("math5ib_saved_explanations");
    return saved ? JSON.parse(saved) : [];
  });
  const [forceExplanationGlobal, setForceExplanationGlobal] = useState<boolean>(false);
  const [teacherModeActive, setTeacherModeActive] = useState<boolean>(false);

  // NEW STATES FOR THE 100 PROGRESSIVE EXERCISES SYSTEM
  const [assessmentMode, setAssessmentMode] = useState<"quizzes" | "progressive">("quizzes");
  const [progressiveUnit, setProgressiveUnit] = useState<"fractions_decimals" | "coordinates_plane" | "volume_measurement" | "statistics_data">("fractions_decimals");
  const [selectedExerciseLevel, setSelectedExerciseLevel] = useState<number>(1);
  const [progAnswerIndex, setProgAnswerIndex] = useState<number | null>(null);
  const [progAnswerSubmitted, setProgAnswerSubmitted] = useState<boolean>(false);
  const [progExplanationText, setProgExplanationText] = useState<string>("");

  const [progressiveSolved, setProgressiveSolved] = useState<Record<string, number[]>>(() => {
    const saved = localStorage.getItem("math5ib_progressive_solved");
    try {
      return saved ? JSON.parse(saved) : {
        fractions_decimals: [],
        coordinates_plane: [],
        volume_measurement: [],
        statistics_data: []
      };
    } catch (e) {
      return {
        fractions_decimals: [],
        coordinates_plane: [],
        volume_measurement: [],
        statistics_data: []
      };
    }
  });

  // Load generated question deterministically
  const currentProgQuestion = useMemo(() => {
    return generateExercise(progressiveUnit, selectedExerciseLevel);
  }, [progressiveUnit, selectedExerciseLevel]);

  const handleSelectProgOption = (idx: number) => {
    if (progAnswerSubmitted) return;
    setProgAnswerIndex(idx);
    onSetBarnaby("thinking", `Option ${String.fromCharCode(65 + idx)} selected. Formulate your reasoning proof in the segment below to verify!`);
  };

  const handleSubmitProgAnswer = () => {
    if (progAnswerIndex === null || progAnswerSubmitted) return;

    const isExpRequired = selectedExerciseLevel > 66 || forceExplanationGlobal;
    if (isExpRequired && progExplanationText.trim().length < 12) {
      onSetBarnaby(
        "thinking",
        "Explain your methodology! 📋 Grade 5 PYP inquiries require at least 12 characters of deductive reasoning before submission."
      );
      return;
    }

    setProgAnswerSubmitted(true);
    const isCorrect = progAnswerIndex === currentProgQuestion.correctIndex;

    // Save solving entry to Portfolio ledger!
    const newSavedEntry: SavedExplanation = {
      id: "prog_" + progressiveUnit + "_" + selectedExerciseLevel + "_" + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + new Date().toLocaleDateString(),
      categoryTitle: `🚀 Level ${selectedExerciseLevel} Exercise (${progressiveUnit.replace("_", " ").toUpperCase()})`,
      questionText: currentProgQuestion.question,
      playerExplanation: progExplanationText.trim() || "(No reasoning written)",
      selectedAnswer: currentProgQuestion.choices[progAnswerIndex],
      correctAnswer: currentProgQuestion.choices[currentProgQuestion.correctIndex],
      isCorrect,
      teacherRating: 0,
      teacherFeedback: "Pending review for progressive math inquiry streak!"
    };

    const updatedLedger = [newSavedEntry, ...savedExplanations];
    setSavedExplanations(updatedLedger);
    localStorage.setItem("math5ib_saved_explanations", JSON.stringify(updatedLedger));

    if (isCorrect) {
      // Calculate reward stars depending on difficulty:
      // Easy (1-33): +3 Stars. Medium (34-66): +6 Stars. Difficult (67-100): +10 Stars!
      let reward = 3;
      if (selectedExerciseLevel > 33 && selectedExerciseLevel <= 66) reward = 6;
      if (selectedExerciseLevel > 66) reward = 10;

      onEarnStars(reward);

      // Save solved level progress
      const currentUnitSolved = progressiveSolved[progressiveUnit] || [];
      if (!currentUnitSolved.includes(selectedExerciseLevel)) {
        const nextSolved = {
          ...progressiveSolved,
          [progressiveUnit]: [...currentUnitSolved, selectedExerciseLevel]
        };
        setProgressiveSolved(nextSolved);
        localStorage.setItem("math5ib_progressive_solved", JSON.stringify(nextSolved));
      }

      onSetBarnaby(
        "correct",
        `Phenomenal math deduction! 🎉 Correct choice! Received +${reward} Stars. Solution walkthrough: ${currentProgQuestion.explanation}`
      );

      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else {
      onSetBarnaby(
        "incorrect",
        `Keep climbing, math explorer! 🦉 Research the correct steps. Correct walkthrough: ${currentProgQuestion.explanation}`
      );
    }
  };

  const handleNextProgLevel = () => {
    setProgAnswerIndex(null);
    setProgAnswerSubmitted(false);
    setProgExplanationText("");

    if (selectedExerciseLevel < 100) {
      setSelectedExerciseLevel(selectedExerciseLevel + 1);
      onSetBarnaby("thinking", `Progressed to Exercise ${selectedExerciseLevel + 1}! Let's maintain the momentum.`);
    } else {
      onSetBarnaby("happy", `Outstanding! You reached Level 100 of this unit! Challenge other topics to complete all 400! 👑`);
    }
  };
  
  // State for editing comments in portfolio
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [tempRating, setTempRating] = useState<number>(5);
  const [tempComment, setTempComment] = useState<string>("");
  const [tempStudentExplanation, setTempStudentExplanation] = useState<string>("");

  // Pick categories or construct random mixed quiz
  const activeQuiz = useMemo(() => {
    if (!selectedCategoryId) return null;

    if (selectedCategoryId === "mixed_pyp_challenge") {
      // Gather all questions, shuffle and pick 8 random ones (or first 8 to remain deterministic)
      const allQs = QUIZ_CATEGORIES.flatMap((c) => c.questions);
      // For stability of layout, let's take a balanced mix of 2 questions from each category
      const mixedQs = QUIZ_CATEGORIES.flatMap((c) => c.questions.slice(0, 2));
      return {
        id: "mixed_pyp_challenge",
        title: "The Ultimate PYP Master Explorer Quiz",
        emoji: "👑",
        strand: "Mixed Inquiry Review",
        description: "Test your skills with an all-inclusive 8-question review covering fractions, coordinates, volume metrics, and surveys!",
        starsReward: 25,
        colorClass: "bg-indigo-600",
        bgLightClass: "bg-indigo-50/70",
        borderClass: "border-indigo-200",
        textClass: "text-indigo-800",
        questions: mixedQs
      };
    }

    return QUIZ_CATEGORIES.find((c) => c.id === selectedCategoryId) || null;
  }, [selectedCategoryId]);

  const startEditExplanation = (item: SavedExplanation) => {
    setEditingExpId(item.id);
    setTempStudentExplanation(item.playerExplanation);
    setTempRating(item.teacherRating || 5);
    setTempComment(item.teacherFeedback || "Excellent deductive reasoning!");
  };

  const saveEdit = (id: string) => {
    const updated = savedExplanations.map(exp => {
      if (exp.id === id) {
        return {
          ...exp,
          playerExplanation: tempStudentExplanation,
          teacherRating: tempRating,
          teacherFeedback: tempComment
        };
      }
      return exp;
    });
    setSavedExplanations(updated);
    localStorage.setItem("math5ib_saved_explanations", JSON.stringify(updated));
    setEditingExpId(null);
  };

  const deleteExplanation = (id: string) => {
    const updated = savedExplanations.filter(exp => exp.id !== id);
    setSavedExplanations(updated);
    localStorage.setItem("math5ib_saved_explanations", JSON.stringify(updated));
  };

  const exportPortfolioToClipboard = () => {
    if (savedExplanations.length === 0) {
      onSetBarnaby("thinking", "No portfolio items to share yet. Take a quiz first! 📚");
      return;
    }
    const txt = savedExplanations.map((exp, idx) => {
      const ratingStars = "★".repeat(exp.teacherRating) + "☆".repeat(5 - exp.teacherRating);
      return `${idx + 1}. [${exp.categoryTitle}] - ${exp.timestamp}
Question: ${exp.questionText}
Student Proof: "${exp.playerExplanation}"
Grade Validation: ${exp.isCorrect ? "Correct answer selected" : "Incorrect selection"}
Teacher Evaluation: ${exp.teacherRating > 0 ? ratingStars + " (" + exp.teacherRating + "/5)" : "Pending Review"}
Feedback Notes: "${exp.teacherFeedback}"
--------------------`;
    }).join("\n\n");
    navigator.clipboard.writeText(txt);
    onSetBarnaby("happy", "A beautiful text portfolio report has been compiled and copied to your clipboard! 📋");
  };

  const exportPortfolioAsJSON = () => {
    if (savedExplanations.length === 0) {
      onSetBarnaby("thinking", "No items to export yet! Solve questions to gather entries. 🧭");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedExplanations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `math5ib_inquiry_portfolio_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onSetBarnaby("happy", "Your complete Portfolio Ledger has been downloaded as a JSON file! 💾");
  };

  const handleSelectCategory = (id: string) => {
    setSelectedCategoryId(id);
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setAnswerSubmitted(false);
    setQuizScore(0);
    setUserExplanationText("");

    const targetCategory = id === "mixed_pyp_challenge" 
      ? { title: "Ultimate PYP Master Explorer Quiz" } 
      : QUIZ_CATEGORIES.find((c) => c.id === id);

    onSetBarnaby(
      "thinking",
      `Welcome to the ${targetCategory?.title || "Quiz"}! Multiple choice prompts will test your critical thinking. Good luck! 📚`
    );
  };

  const currentQuestion = activeQuiz?.questions[currentQuestionIndex];

  const isExpertCategory = useMemo(() => {
    if (!activeQuiz) return false;
    return activeQuiz.id.startsWith("expert_") || activeQuiz.strand.toLowerCase().includes("(expert)");
  }, [activeQuiz]);

  const isExplanationRequired = useMemo(() => {
    return isExpertCategory || forceExplanationGlobal;
  }, [isExpertCategory, forceExplanationGlobal]);

  const handleSelectOption = (index: number) => {
    if (answerSubmitted) return;
    setSelectedAnswerIndex(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswerIndex === null || answerSubmitted || !currentQuestion) return;

    if (isExplanationRequired && userExplanationText.trim().length < 12) {
      onSetBarnaby(
        "thinking",
        "Deep reasoning is required! 🧠 Please write a detailed step-by-step explanation (at least 12 characters) of how you solved the math before submitting."
      );
      return;
    }

    setAnswerSubmitted(true);
    const isCorrect = selectedAnswerIndex === currentQuestion.correctIndex;

    // Save student work to the persistent Portfolio Ledger for teacher review
    const newSavedEntry: SavedExplanation = {
      id: "lex_" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + new Date().toLocaleDateString(),
      categoryTitle: activeQuiz?.title || "Mixed PYP Challenge",
      questionText: currentQuestion.question,
      playerExplanation: userExplanationText.trim() || "(No explanation written)",
      selectedAnswer: currentQuestion.choices[selectedAnswerIndex],
      correctAnswer: currentQuestion.choices[currentQuestion.correctIndex],
      isCorrect: isCorrect,
      teacherRating: 0, // 0 means unrated
      teacherFeedback: "Pending review"
    };

    const updated = [newSavedEntry, ...savedExplanations];
    setSavedExplanations(updated);
    localStorage.setItem("math5ib_saved_explanations", JSON.stringify(updated));

    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      onSetBarnaby(
        "correct",
        `Brilliant research! 🎉 You got it right! ${currentQuestion.explanation}`
      );
    } else {
      onSetBarnaby(
        "incorrect",
        `A minor slip, math scout! 🦉 Let's analyze: ${currentQuestion.explanation}`
      );
    }
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;

    setUserExplanationText(""); // Clear for the next question

    if (currentQuestionIndex + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswerIndex(null);
      setAnswerSubmitted(false);
      onSetBarnaby(
        "thinking",
        `Ready for Question ${currentQuestionIndex + 2} of ${activeQuiz.questions.length}? You are making great progress!`
      );
    } else {
      // Quiz finished! Calculate results
      const finalScore = quizScore + (selectedAnswerIndex === currentQuestion?.correctIndex ? 1 : 0);
      const totalCount = activeQuiz.questions.length;
      const percentage = Math.round((finalScore / totalCount) * 105); // Just a scaling of satisfaction

      // Stars reward logic: 3 stars per correct answer + 5 stars bonus for 100%!
      const correctAnswersCount = finalScore;
      let starsEarned = correctAnswersCount * 2;
      const isPerfect = correctAnswersCount === totalCount;
      if (isPerfect) {
        starsEarned += 5;
      }

      onEarnStars(starsEarned);

      // Save highscore
      const newHistory = { ...quizHistory };
      const previousBest = newHistory[activeQuiz.id] || 0;
      if (finalScore > previousBest) {
        newHistory[activeQuiz.id] = finalScore;
        setQuizHistory(newHistory);
        localStorage.setItem("math5ib_quiz_scores", JSON.stringify(newHistory));
      }

      // Confetti splash for success!
      if (finalScore >= totalCount / 2) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      setSelectedAnswerIndex(null);
      setAnswerSubmitted(false);
      setCurrentQuestionIndex(activeQuiz.questions.length); // Out of bounds marks results mode

      onSetBarnaby(
        isPerfect ? "happy" : "resting",
        `Quiz Completed! 🌟 You scored ${correctAnswersCount}/${totalCount}. You earned +${starsEarned} Stars to decorate Barnaby! Let's keep exploring!`
      );
    }
  };

  const handleQuitQuiz = () => {
    setSelectedCategoryId(null);
    setUserExplanationText("");
    onSetBarnaby(
      "resting",
      "Back to the general quiz center! Choose any strand challenge or take the Ultimate Master Explorer test when you feel ready."
    );
  };

  return (
    <div className="space-y-6" id="quiz-feature-container">
      {/* Dynamic Tab Switcher */}
      {!selectedCategoryId && (
        <div className="flex bg-slate-150 p-1 rounded-2xl max-w-md mx-auto gap-1 border border-slate-200/80 shadow-xs mb-2">
          <button
            onClick={() => {
              setAssessmentMode("quizzes");
              onSetBarnaby("resting", "Let's explore curriculum study channels across the four target strands!");
            }}
            className={`flex-1 py-2.5 text-center rounded-xl text-xs font-black transition-all cursor-pointer ${
              assessmentMode === "quizzes"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🏆 Standard Quizzes
          </button>
          <button
            onClick={() => {
              setAssessmentMode("progressive");
              onSetBarnaby("happy", "Let's conquer the 100 Progressive Exercises Suite! Easy, Medium, and Difficult levels await.");
            }}
            className={`flex-1 py-2.5 text-center rounded-xl text-xs font-black transition-all cursor-pointer ${
              assessmentMode === "progressive"
                ? "bg-white text-indigo-750 shadow-xs border border-indigo-100"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🚀 100 Exercises Hub
          </button>
        </div>
      )}

      {/* Quiz Introduction Banner inside standard PYP Theme context */}
      {!selectedCategoryId && assessmentMode === "quizzes" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
                Interactive Assessment Center
              </span>
              <h2 className="text-2xl font-black text-indigo-950">Math 5 Inquiry Quiz Center</h2>
              <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                Demonstrate your math understanding through PYP inquiries! Answer real multiple-choice questions with instant feedback and earn stars to purchase custom items at Barnaby's Accessory Store.
              </p>
            </div>
            <div className="bg-amber-100 p-4 rounded-2xl flex items-center gap-3">
              <Trophy className="w-10 h-10 text-amber-500 animate-bounce" />
              <div>
                <span className="block text-[10px] text-slate-500 font-bold uppercase">Quick Reward</span>
                <span className="font-extrabold text-amber-800 text-xs">Earn +2 Stars for each correct answer!</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER CATEGORIES SELECTION if no active quiz active */}
      {!selectedCategoryId && assessmentMode === "quizzes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
          {QUIZ_CATEGORIES.map((cat) => {
            const highscore = quizHistory[cat.id] || 0;
            return (
              <div
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`bg-white rounded-3xl p-5 border-2 border-slate-100 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group h-full`}
                id={`cat-card-${cat.id}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-4xl bg-slate-50 p-2.5 rounded-2xl block">{cat.emoji}</span>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded bg-slate-100 text-slate-600 uppercase tracking-wider">
                      {cat.strand}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1.5 h-12 overflow-hidden">
                    {cat.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 text-[11px] font-bold">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Award className="w-4 h-4 text-slate-400" />
                    <span>Best Score: <span className="text-slate-700 font-black">{highscore}/5</span></span>
                  </div>
                  <div className="flex items-center gap-1 text-indigo-600 uppercase tracking-wider">
                    Start Quiz <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}

          {/* THE ULTIMATE PYP MIXED MASTER EXPLORER CHALLENGE BOX */}
          <div
            onClick={() => handleSelectCategory("mixed_pyp_challenge")}
            className="col-span-1 md:col-span-2 bg-gradient-to-r from-indigo-50 to-indigo-100/40 rounded-3xl p-6 border-2 border-dashed border-indigo-200 hover:border-indigo-400 cursor-pointer group transition-all relative overflow-hidden"
            id="mixed-pyp-challenge-box"
          >
            <div className="absolute right-4 bottom-4 text-8xl opacity-10 select-none pointer-events-none">👑</div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-4xl">👑</span>
                  <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded uppercase tracking-widest">
                    The Ultimate Challenge
                  </span>
                </div>
                <h3 className="text-xl font-black text-indigo-950 group-hover:text-indigo-600 transition-colors">
                  The Ultimate Math 5 PYP Mixed Review Quiz!
                </h3>
                <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                  Ready to test your math mastery across fractions, negative coordinate axes, 3D measurements, and school graphs? Answer 8 representative questions for a mega star payload!
                </p>
              </div>

              <div className="flex-shrink-0 self-start sm:self-center">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-1.5 shadow-md transform group-hover:-translate-y-0.5 transition-all cursor-pointer">
                  <Play className="w-3.5 h-3.5 fill-white" /> Start Master Quiz (+25 ⭐ Benefit)
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-indigo-200/60 text-xs font-bold text-slate-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>8 Questions Mixed</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />
                <span>Earn up to 41 stars! (Perfect score bonus)</span>
              </div>
              <div className="ml-auto text-indigo-700">
                High score: {quizHistory["mixed_pyp_challenge"] || 0} / 8 solved
              </div>
            </div>
          </div>

          {/* Advanced Configurations and Strict Mode Toggle */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5 font-sans">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  <span>Enforce Global Step-by-Step Explanations</span>
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl">
                  By default, written reasoning proofs are strictly required only for <strong>Expert channels</strong>. Toggle this ON to demand detailed steps for all intermediate quizzes!
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">
                  {forceExplanationGlobal ? "🚨 ENFORCED ON ALL" : "💡 EXPERT ONLY"}
                </span>
                <button
                  onClick={() => {
                    setForceExplanationGlobal(!forceExplanationGlobal);
                    onSetBarnaby(
                      "happy",
                      !forceExplanationGlobal
                        ? "Amazing! We have enforced mathematical reasoning proofs across all inquiry quizzes! 🧠"
                        : "Returned explanation rules to Expert-only quizzes."
                    );
                  }}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                    forceExplanationGlobal ? "bg-indigo-600" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      forceExplanationGlobal ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 100 PROGRESSIVE EXERCISES SYSTEM */}
      {!selectedCategoryId && assessmentMode === "progressive" && (
        <div className="space-y-6">
          {/* Main unit selection row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: "fractions_decimals", title: "Fractions & Decimals", emoji: "🍰", solved: progressiveSolved.fractions_decimals?.length || 0 },
              { id: "coordinates_plane", title: "Coordinate Plane", emoji: "🎯", solved: progressiveSolved.coordinates_plane?.length || 0 },
              { id: "volume_measurement", title: "Volume Architect", emoji: "🧊", solved: progressiveSolved.volume_measurement?.length || 0 },
              { id: "statistics_data", title: "Data Handling", emoji: "📊", solved: progressiveSolved.statistics_data?.length || 0 },
            ].map((unit) => {
              const isSelected = progressiveUnit === unit.id;
              const percentSolved = Math.round((unit.solved / 100) * 100);
              return (
                <div
                  key={unit.id}
                  onClick={() => {
                    setProgressiveUnit(unit.id as any);
                    setSelectedExerciseLevel(Math.min(100, Math.max(1, unit.solved + 1))); // automatically load next unsolved level
                    setProgAnswerSubmitted(false);
                    setProgAnswerIndex(null);
                    setProgExplanationText("");
                    onSetBarnaby("thinking", `Inspecting progressive challenges in ${unit.title}! Let's aim to clear all 100 exercises.`);
                  }}
                  className={`bg-white p-5 rounded-3xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-indigo-600 ring-2 ring-indigo-200 shadow-md scale-102"
                      : "border-slate-100 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-3xl bg-slate-50 p-2 rounded-xl block">{unit.emoji}</span>
                    <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full">
                      {unit.solved}/100 Solved
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-xs">{unit.title}</h4>
                  
                  {/* Progress segment */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[9px] font-extrabold text-slate-500">
                      <span>Inquiry Road</span>
                      <span>{percentSolved}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percentSolved}%` }}
                        className="bg-indigo-600 h-full transition-all"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Level Quest & Question rendering block */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left selector panel: 1-100 level grid map */}
            <div className="lg:col-span-5 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
              <div className="space-y-1">
                <h3 className="font-sans font-black text-slate-850 text-sm flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-550" />
                  <span>Choose Exercise Level (1-100)</span>
                </h3>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Exercises increase progressively in difficulty. Select any box to load its mathematical inquiry!
                </p>
              </div>

              {/* Legend styling */}
              <div className="flex flex-wrap gap-2.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Easy (1-33)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-400" /> Med (34-66)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> Diff (67-100)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded border border-indigo-600" /> Solved</span>
              </div>

              {/* Scrollable grid container for 100 level boxes */}
              <div className="grid grid-cols-10 gap-1.5 max-h-[300px] overflow-y-auto pr-1">
                {Array.from({ length: 100 }, (_, i) => {
                  const lvl = i + 1;
                  const isSelected = selectedExerciseLevel === lvl;
                  const isSolved = (progressiveSolved[progressiveUnit] || []).includes(lvl);

                  let colorClass = "bg-emerald-50 text-emerald-800 hover:bg-emerald-100";
                  if (lvl > 33 && lvl <= 66) {
                    colorClass = "bg-amber-50 text-amber-800 hover:bg-amber-100";
                  } else if (lvl > 66) {
                    colorClass = "bg-rose-50 text-rose-800 hover:bg-rose-100";
                  }

                  if (isSolved) {
                    colorClass = "bg-indigo-650 text-white font-black hover:bg-indigo-700 shadow-sm";
                  }

                  return (
                    <button
                      key={lvl}
                      onClick={() => {
                        setSelectedExerciseLevel(lvl);
                        setProgAnswerSubmitted(false);
                        setProgAnswerIndex(null);
                        setProgExplanationText("");
                        onSetBarnaby(
                          "thinking",
                          `Loaded Level ${lvl}! ${
                            lvl <= 33 ? "A smooth easy quest to spark memory." : lvl <= 66 ? "A solid intermediate word puzzle!" : "An expert-grade scenario requiring structured step explanation!"
                          }`
                        );
                      }}
                      className={`h-9 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center relative ${colorClass} ${
                        isSelected ? "ring-2 ring-indigo-950 scale-105 z-10 font-black border border-white" : ""
                      }`}
                      title={`Level ${lvl} ${isSolved ? "(Solved)" : ""}`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right details panel for the loaded active exercise */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* Active Level Header info */}
                <div className="flex justify-between items-center bg-slate-50/80 p-2.5 rounded-2xl border border-slate-150">
                  <div className="flex items-center gap-2">
                    <span className="text-xl bg-white p-1.5 rounded-xl shadow-xs">👑</span>
                    <div>
                      <span className="block text-[9px] text-slate-400 font-extrabold uppercase">ACTIVE WORKSPACE</span>
                      <span className="text-xs font-black text-slate-800">
                        {progressiveUnit.replace("_", " ").toUpperCase()} • LEVEL {selectedExerciseLevel}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                    selectedExerciseLevel <= 33 ? "bg-emerald-100 text-emerald-800" :
                    selectedExerciseLevel <= 66 ? "bg-amber-100 text-amber-805" : "bg-rose-100 text-rose-800"
                  }`}>
                    {selectedExerciseLevel <= 33 ? "Easy reward: +3 ⭐" :
                     selectedExerciseLevel <= 66 ? "Medium reward: +6 ⭐" : "Hard reward: +10 ⭐"}
                  </span>
                </div>

                {/* Display context tag */}
                <span className="inline-block text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-lg">
                  {currentProgQuestion.context}
                </span>

                {/* Question Paragraph with high-contrast human-friendly layout */}
                <div className="space-y-3">
                  <h3 className="font-sans font-black text-slate-900 text-base leading-relaxed select-text">
                    {currentProgQuestion.question}
                  </h3>

                  {/* Choice option list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {currentProgQuestion.choices.map((choice, oidx) => {
                      const isSelected = progAnswerIndex === oidx;
                      const isCorrectAnswer = oidx === currentProgQuestion.correctIndex;

                      let cStyle = "border-slate-200 hover:border-indigo-400 hover:bg-slate-50";
                      let indicator = <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-black text-slate-400">{String.fromCharCode(65 + oidx)}</span>;

                      if (isSelected) {
                        cStyle = "border-indigo-600 bg-indigo-50/40 text-indigo-950 font-black ring-2 ring-indigo-200";
                        indicator = <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">{String.fromCharCode(65 + oidx)}</span>;
                      }

                      if (progAnswerSubmitted) {
                        if (isCorrectAnswer) {
                          cStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-black ring-2 ring-emerald-250";
                          indicator = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
                        } else if (isSelected) {
                          cStyle = "border-rose-500 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-250";
                          indicator = <XCircle className="w-5 h-5 text-rose-600" />;
                        }
                      }

                      return (
                        <button
                          key={oidx}
                          onClick={() => handleSelectProgOption(oidx)}
                          disabled={progAnswerSubmitted}
                          className={`p-3.5 rounded-2xl border-2 text-left text-xs font-semibold transition-all flex items-center gap-3 cursor-pointer ${cStyle}`}
                        >
                          {indicator}
                          <span className="leading-snug">{choice}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Explanations segment input section */}
                {progAnswerIndex !== null && (
                  <div className="space-y-2 mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                        📝 Write Step-by-Step Reasonings: 
                        {(selectedExerciseLevel > 66 || forceExplanationGlobal) && <span className="text-rose-500 font-bold ml-1">*Required for Difficulties</span>}
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">
                        {progExplanationText.length} chars
                      </span>
                    </div>

                    <textarea
                      value={progExplanationText}
                      onChange={(e) => setProgExplanationText(e.target.value)}
                      disabled={progAnswerSubmitted}
                      placeholder="Show your complete logical proofs first! E.g.: 'Leo had 6 slices out of 8, which simplifies to 3/4 and equals 0.75 decimal.'"
                      className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl bg-white shadow-inner focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      rows={2}
                    />

                    {/* Submit exercise action */}
                    {!progAnswerSubmitted && (
                      <div className="flex justify-between items-center pt-1.5">
                        <span className="text-[10px] text-slate-505 leading-normal">
                          {(selectedExerciseLevel > 66 || forceExplanationGlobal) ? "⚠️ Explanations must be ≥ 12 characters to unlock submitting." : "Tip: Explanations build 5x faster memory."}
                        </span>
                        
                        <button
                          onClick={handleSubmitProgAnswer}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                        >
                          Submit Proof
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Answer outcome & walkthrough display */}
                {progAnswerSubmitted && (
                  <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 flex items-start gap-3 mt-4">
                    <span className="text-2xl">🦉</span>
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-indigo-700 block">Walkthrough Deduction:</span>
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed italic select-text">
                        {currentProgQuestion.explanation}
                      </p>
                      
                      <div className="pt-2">
                        <button
                          onClick={handleNextProgLevel}
                          className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          Next Exercise Level ({selectedExerciseLevel === 100 ? 100 : selectedExerciseLevel + 1}/100) <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Teacher Review Log / Student Portfolio Ledger */}
      {!selectedCategoryId && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full">
                  PYP Inquiry Journal
                </span>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  <span>Interactive Student Portfolio Ledger</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Reviews and submissions recorded for teacher grading. Refine your written steps or grade achievements.
                </p>
              </div>

              {/* Toggle Teacher grading Mode */}
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-600">Teacher Panel:</span>
                <button
                  onClick={() => {
                    setTeacherModeActive(!teacherModeActive);
                    onSetBarnaby(
                      "happy",
                      !teacherModeActive
                        ? "Teacher Access Portal Unlocked! 🔓 You can now write evaluations and score the portfolio."
                        : "Returned to Student View."
                    );
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                    teacherModeActive
                      ? "bg-amber-500 text-white shadow-inner"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-305"
                  }`}
                >
                  {teacherModeActive ? (
                    <>
                      <Unlock className="w-3 h-3" /> Teacher Mode (Active)
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" /> Student View (Unlock)
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Portfolio Actions Block */}
            {savedExplanations.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100">
                <span className="text-[11px] font-extrabold text-slate-600 mr-2">Export Toolkit:</span>
                <button
                  onClick={exportPortfolioToClipboard}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-[10px] px-3.5 py-2 rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-slate-550" /> Copy Report to Clipboard
                </button>
                <button
                  onClick={exportPortfolioAsJSON}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm hover:shadow cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download Portfolio (.json)
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to clear your local portfolio ledger? This cannot be undone.")) {
                      setSavedExplanations([]);
                      localStorage.removeItem("math5ib_saved_explanations");
                      onSetBarnaby("resting", "Cleared all portfolio history successfully.");
                    }
                  }}
                  className="ml-auto bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash className="w-3.5 h-3.5" /> Reset Ledger
                </button>
              </div>
            )}

            {/* List of Portfolio Ledger Items */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {savedExplanations.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl space-y-2">
                  <span className="text-3xl block">📚</span>
                  <h4 className="text-sm font-bold text-slate-750 font-sans">Your Portfolio Ledger is Empty</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Complete any quiz or expert mathematical strand inquiry to begin populating your persistent journal proofs!
                  </p>
                </div>
              ) : (
                savedExplanations.map((exp) => {
                  const isEditing = editingExpId === exp.id;
                  return (
                    <div
                      key={exp.id}
                      className="bg-slate-50/60 rounded-2xl p-5 border border-slate-200 space-y-4 shadow-sm hover:shadow md:hover:shadow-md transition-shadow"
                    >
                      {/* Entry Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black uppercase text-indigo-700 font-mono">
                            {exp.categoryTitle}
                          </span>
                          <div className="text-[10px] text-slate-400 font-bold">
                            Solved: {exp.timestamp}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] tracking-wide font-extrabold uppercase ${
                              exp.isCorrect
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {exp.isCorrect ? "Correct answer" : "Incorrect selection"}
                          </span>

                          <button
                            onClick={() => deleteExplanation(exp.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete entry"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Question Details */}
                      <div className="space-y-1">
                        <span className="block text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">
                          Question Prompt:
                        </span>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed font-sans">
                          {exp.questionText}
                        </p>
                        <div className="text-[11px] text-slate-500 font-medium pt-1">
                          Chosen: <span className="text-slate-700 font-bold font-mono">"{exp.selectedAnswer}"</span> |
                          Correct: <span className="text-emerald-700 font-bold font-mono">"{exp.correctAnswer}"</span>
                        </div>
                      </div>

                      {/* Student's explanation edit state or passive state */}
                      <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="block text-[9px] text-slate-450 uppercase tracking-wider font-extrabold">
                            Student step-by-step reasoning proof:
                          </span>
                          {!isEditing && (
                            <button
                              onClick={() => startEditExplanation(exp)}
                              className="text-[10px] font-black text-indigo-600 hover:text-indigo-850 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" /> Edit Proof
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <textarea
                            value={tempStudentExplanation}
                            onChange={(e) => setTempStudentExplanation(e.target.value)}
                            className="w-full text-xs font-bold text-slate-705 p-2.5 border border-indigo-200 rounded-lg h-20 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                          />
                        ) : (
                          <p className="text-xs font-semibold text-slate-700 font-sans italic leading-relaxed">
                            "{exp.playerExplanation}"
                          </p>
                        )}
                      </div>

                      {/* Passive reviews show teacher grading comments */}
                      <div className="bg-amber-50/50 border border-amber-200 p-3.5 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="block text-[9px] text-amber-800 uppercase tracking-wider font-extrabold">
                            Teacher feedback & grading card:
                          </span>

                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((starVal) => {
                              const checked = isEditing ? tempRating >= starVal : exp.teacherRating >= starVal;
                              return (
                                <button
                                  key={starVal}
                                  disabled={!isEditing && !teacherModeActive}
                                  onClick={() => {
                                    if (isEditing) {
                                      setTempRating(starVal);
                                    } else {
                                      // Quick rate directly
                                      const updated = savedExplanations.map(e => e.id === exp.id ? { ...e, teacherRating: starVal } : e);
                                      setSavedExplanations(updated);
                                      localStorage.setItem("math5ib_saved_explanations", JSON.stringify(updated));
                                    }
                                  }}
                                  className={`p-0.5 focus:outline-none ${
                                    isEditing || teacherModeActive ? "cursor-pointer hover:scale-110 transition-transform" : ""
                                  }`}
                                >
                                  <Star
                                    className={`w-3.5 h-3.5 ${
                                      checked
                                        ? "fill-amber-400 text-amber-500"
                                        : "text-amber-200"
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={tempComment}
                              onChange={(e) => setTempComment(e.target.value)}
                              placeholder="Type teacher grade feedback..."
                              className="w-full text-xs bg-white border border-slate-200 p-2.5 rounded-lg"
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setEditingExpId(null)}
                                className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-[10px] font-bold text-slate-650 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveEdit(exp.id)}
                                className="px-3 py-1 bg-indigo-600 text-white hover:bg-indigo-700 text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3 h-3" /> Save Portfolio Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {exp.teacherRating > 0 ? (
                              <p className="text-[11px] font-bold text-amber-905 font-sans">
                                Assessment Score: <span className="text-amber-700">{exp.teacherRating}/5 Stars</span>
                              </p>
                            ) : (
                              <p className="text-[10px] font-extrabold text-slate-400 font-sans">
                                (Not graded yet. Toggle 'Teacher Mode' above to assign feedback star evaluations)
                              </p>
                            )}
                            <p className="text-xs font-semibold text-slate-700 font-mono italic leading-relaxed">
                              "{exp.teacherFeedback || "Reflective reasoning shown! Well done!"}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
      )}

      {/* QUIZ ACTIVE VIEW REPLAY CARD AND PROGRESS */}
      {selectedCategoryId && activeQuiz && (
        <AnimatePresence mode="wait">
          {currentQuestionIndex < activeQuiz.questions.length ? (
            <motion.div
              key={`q-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-6"
            >
              {/* Question Header Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleQuitQuiz}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    ← Exit Quiz
                  </button>
                  <span className="text-slate-300 font-light">/</span>
                  <span className="text-xs font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                    {activeQuiz.emoji} {activeQuiz.title}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs text-slate-500 font-bold">
                    Question <span className="text-slate-800 font-extrabold">{currentQuestionIndex + 1}</span> of {activeQuiz.questions.length}
                  </div>
                  <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full transition-all duration-300"
                      style={{
                        width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Theme description */}
              {currentQuestion && (
                <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-indigo-800">
                  <span className="bg-indigo-100 text-indigo-700 p-1 rounded-md text-sm">💡</span>
                  <span>{currentQuestion.context}</span>
                </div>
              )}

              {/* Question prompt */}
              {currentQuestion && (
                <div className="space-y-4">
                  <h3 className="text-lg md:text-xl font-extrabold text-slate-900 leading-relaxed font-sans">
                    {currentQuestion.question}
                  </h3>

                  {/* 4 Multi-choice options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {currentQuestion.choices.map((choice, index) => {
                      // Styling state variables
                      const isSelected = selectedAnswerIndex === index;
                      const isCorrectAnswer = index === currentQuestion.correctIndex;

                      let btnStyle = "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/10";
                      let iconRender = <div className="w-5 h-5 rounded-full border border-slate-300 flex-shrink-0" />;

                      if (isSelected) {
                        btnStyle = "border-indigo-500 bg-indigo-50/30 text-indigo-900 font-black ring-2 ring-indigo-200";
                        iconRender = <div className="w-5 h-5 rounded-full bg-indigo-500 border border-indigo-600 flex items-center justify-center flex-shrink-0"><span className="w-2 h-2 rounded-full bg-white" /></div>;
                      }

                      if (answerSubmitted) {
                        if (isCorrectAnswer) {
                          btnStyle = "border-emerald-500 bg-emerald-50/50 text-emerald-900 font-black shadow-sm ring-2 ring-emerald-200";
                          iconRender = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;
                        } else if (isSelected) {
                          btnStyle = "border-red-500 bg-red-50/50 text-red-900 shadow-sm ring-2 ring-red-200";
                          iconRender = <XCircle className="w-5 h-5 text-red-650 flex-shrink-0" />;
                        } else {
                          btnStyle = "border-slate-100 bg-slate-50/50 text-slate-400 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={index}
                          onClick={() => handleSelectOption(index)}
                          disabled={answerSubmitted}
                          className={`p-4 rounded-2xl border-2 text-left text-sm font-semibold transition-all flex items-center gap-3 cursor-pointer ${btnStyle}`}
                          id={`option-${index}`}
                        >
                          <span className="font-bold text-slate-400 w-5 text-center flex-shrink-0">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <span className="flex-grow">{choice}</span>
                          {iconRender}
                        </button>
                      );
                    })}
                  </div>

                  {/* Step-by-Step Reasoning Input Box */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 mt-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" strokeWidth={3} />
                        <span>Student Reasoning Proof & Math Steps</span>
                        {isExplanationRequired ? (
                          <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded text-[9px] tracking-wide uppercase font-black">
                            Required (Expert Mode)
                          </span>
                        ) : (
                          <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded text-[9px] tracking-wide uppercase font-extrabold">
                            Optional (Bonus Portfolio Entry)
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-mono font-bold ${userExplanationText.trim().length >= 12 ? "text-emerald-600" : "text-slate-400"}`}>
                        {userExplanationText.trim().length} chars (min: 12)
                      </span>
                    </div>

                    <textarea
                      disabled={answerSubmitted}
                      value={userExplanationText}
                      onChange={(e) => setUserExplanationText(e.target.value)}
                      placeholder="Explain your scientific/mathematical inquiry steps! (E.g. What values did you translate, simplify, or multiply? Why?)"
                      className="w-full h-24 p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-505 text-xs text-slate-800 bg-white placeholder-slate-400 resize-none font-medium leading-relaxed"
                    />

                    <p className="text-[10px] text-slate-500 leading-normal flex items-start gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <span>
                        In Grade 5 IB, outlining your step-by-step methods makes you a <strong>Thinker</strong> and a <strong>Communicator</strong>. This proof saves directly to your teacher-review notebook!
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Explanations block that appears immediately upon checking */}
              <AnimatePresence>
                {answerSubmitted && currentQuestion && (
                  <div className="space-y-3 mt-4">
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2 text-xs"
                    >
                      <div className="flex items-center gap-1.5 font-extrabold text-indigo-950">
                        <span>🦉 Barnaby's Inquiry Explanation:</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-semibold">
                        {currentQuestion.explanation}
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2 text-emerald-800 font-bold">
                        <Bookmark className="w-4 h-4 text-emerald-600 animate-pulse" />
                        <span>Saved explanation successfully to Portfolio Locker!</span>
                      </div>
                      <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-black uppercase">
                        Teacher Review Enabled
                      </span>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Buttons footer */}
              <div className="flex justify-between items-center border-t border-slate-150 pt-4 gap-3">
                <button
                  onClick={handleQuitQuiz}
                  className="px-4 py-2 text-slate-400 hover:text-slate-600 font-bold text-xs"
                >
                  Give Up / Quit Quiz
                </button>

                {!answerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswerIndex === null || (isExplanationRequired && userExplanationText.trim().length < 12)}
                    className={`px-6 py-3 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedAnswerIndex !== null && (!isExplanationRequired || userExplanationText.trim().length >= 12)
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white transform hover:-translate-y-0.5"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Submit Answer <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transform hover:-translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {currentQuestionIndex + 1 < activeQuiz.questions.length ? (
                      <>
                        Next Question <ChevronRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show Final Scorecard <Trophy className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            /* QUIZ COMPLETED RESULTS MODE */
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-lg p-8 text-center space-y-6"
            >
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-4xl shadow-inner mx-auto animate-bounce">
                  🏆
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                    Strand Cleared!
                  </span>
                  <h3 className="text-2xl font-black text-slate-900">
                    Perfect Achievement scorecard!
                  </h3>
                  <p className="text-xs text-slate-500">
                    You have finished the <strong>{activeQuiz.title}</strong> inquiry exercises.
                  </p>
                </div>

                {/* score percentage chart */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col items-center space-y-2 select-text">
                  <span className="text-xs font-bold text-slate-400">YOUR TOTAL SCORE</span>
                  <div className="text-5xl font-black text-indigo-600 leading-none">
                    {quizScore} <span className="text-slate-300 font-light text-2xl">/</span> <span className="text-slate-500 text-3xl">{activeQuiz.questions.length}</span>
                  </div>
                  <span className="text-indigo-400 font-mono text-[10px] uppercase font-bold tracking-widest mt-1">
                    {quizScore === activeQuiz.questions.length ? "👑 100% PERFECT SCORE! (Bonus Added)" : quizScore >= activeQuiz.questions.length / 2 ? "📈 Exceeding Standards" : "🌱 Growth Mindset Active"}
                  </span>
                </div>

                {/* Star Reward summary */}
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-amber-700 bg-amber-50/50 p-3 rounded-2xl border border-amber-200">
                  <Star className="w-5 h-5 fill-amber-500 stroke-amber-600 animate-spin-slow" />
                  <span>
                    Stars Earned: <span className="font-extrabold text-amber-800 font-mono">+{quizScore * 2 + (quizScore === activeQuiz.questions.length ? 5 : 0)} Stars!</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    onClick={() => handleSelectCategory(selectedCategoryId)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-1 border border-slate-300/60 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retry strand
                  </button>
                  <button
                    onClick={handleQuitQuiz}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3.5 px-4 rounded-xl shadow cursor-pointer transition-all hover:-translate-y-0.5"
                  >
                    Review Other Strands
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
