import { Accessory, Badge } from "./types";

export const ACCESSORIES: Accessory[] = [
  {
    id: "wizard_hat",
    name: "Wizard Hat",
    cost: 15,
    emoji: "🧙‍♂️",
    description: "Makes Barnaby look like a spell-casting math magician!",
    category: "hat",
  },
  {
    id: "cool_shades",
    name: "Super-Cool Shades",
    cost: 25,
    emoji: "😎",
    description: "Block out the math stress, bring on the math cool!",
    category: "eyes",
  },
  {
    id: "explorer_headphones",
    name: "Explorer Headphones",
    cost: 10,
    emoji: "🎧",
    description: "For listening to epic classical geometry soundtracks.",
    category: "neck",
  },
  {
    id: "royal_crown",
    name: "Royal Golden Crown",
    cost: 40,
    emoji: "👑",
    description: "The ultimate crown for the True King/Queen of PYP Mathematics!",
    category: "hat",
  },
  {
    id: "explorer_backpack",
    name: "Compass Badge Necktie",
    cost: 20,
    emoji: "🧣",
    description: "A trusty neck ribbon for PYP coordinates orienteering direction.",
    category: "neck",
  },
  {
    id: "detective_monocle",
    name: "Math Detective Monocle",
    cost: 12,
    emoji: "🧐",
    description: "For spotting hidden decimals and equivalent variables.",
    category: "eyes",
  },
];

export const BADGES: Badge[] = [
  {
    id: "fraction_captain",
    name: "Fraction Slicer",
    emoji: "🍰",
    description: "Gained for slicing equivalents and knowing the decimal matches!",
    unlockedAtStars: 10,
  },
  {
    id: "transformation_master",
    name: "Transformation Master",
    emoji: "🌀",
    description: "Earned for conquering coordinate plane geometry, reflections, rotations, and symmetry!",
    unlockedAtStars: 35,
  },
  {
    id: "grid_master",
    name: "Coordinates Captain",
    emoji: "🎯",
    description: "Unlocked for finding treasures exactly on the (x, y) coordinates!",
    unlockedAtStars: 25,
  },
  {
    id: "volume_architect",
    name: "Volume Architect",
    emoji: "🧊",
    description: "Unlocked for calculating rectangular prisms and counting isometric cubes!",
    unlockedAtStars: 45,
  },
  {
    id: "data_scout",
    name: "Data Scout",
    emoji: "📊",
    description: "Earned for exploring statistical averages, modes, and totals of charts!",
    unlockedAtStars: 60,
  },
  {
    id: "pyp_scholar",
    name: "Grade 5 Math Legend",
    emoji: "🦉",
    description: "Sovereign of PYP Math! Outstanding math journey!",
    unlockedAtStars: 80,
  },
];

export interface LessonContent {
  title: string;
  emoji: string;
  concept: string;
  inquiryPrompt: string;
  points: string[];
}

export const LESSONS: Record<string, LessonContent> = {
  fractions: {
    title: "Fraction Slices & Decimals",
    emoji: "🍰",
    concept: "How many slices are there, and what parts are covered? Fractions represent division ($Numerator \\div Denominator$). If you slice a whole pizza into 4 parts, and shade 2, you have $2/4$, which behaves exactly like $1/2$, or $0.5$ in decimals!",
    inquiryPrompt: "Inquiry: Can you spot why 4/8 and 2/4 represent the same amount of pizza?",
    points: [
      "The Numerator (top) counts how many parts we are interested in.",
      "The Denominator (bottom) counts how many total parts make up a whole.",
      "To convert a fraction to a decimal, divide the top number by the bottom. Try: 1/4 = 0.25, 1/2 = 0.5, 3/4 = 0.75!"
    ]
  },
  coordinates: {
    title: "The Coordinate Plane Treasure Hunt",
    emoji: "🎯",
    concept: "We live in space where landmarks have addresses! René Descartes figured out we could find points using two numbers: (x, y). First, walk along the hallway (the X-axis), then take the elevator up or down (the Y-axis). The intersection is where the treasure is buried!",
    inquiryPrompt: "Inquiry: Why does the order of (3, -2) and (-2, 3) land you in completely different locations?",
    points: [
      "The Coordinate Plane has two axes: X (horizontal line) and Y (vertical line).",
      "They cross at (0, 0), which is called the ORIGIN.",
      "The first number is X (left/right) and the second is Y (up/down). Walk before you climb!",
      "Grade 5 PYP looks at quadrants containing negative values too! (e.g. -4 horizontal is left of origin)."
    ]
  },
  volume: {
    title: "3D Space & Volume Architect",
    emoji: "🧊",
    concept: "Perimeter is 1D length. Area is 2D space. Volume is the depth of 3D objects! In Grade 5, we measure volume of rectangular prisms by looking at layers. Volume = Base Area × Height = Length × Width × Height.",
    inquiryPrompt: "Inquiry: If you double the length of a box, what happens to its total holding capacity?",
    points: [
      "Volume measures how much space a 3D solid holds, using cubic units (e.g. cm³, units³).",
      "Think of a rectangular box as layers of flat grids stacked on top of each other.",
      "Volume Formula: V = Length(l) × Width(w) × Height(h)."
    ]
  },
  data: {
    title: "Data and Statistics Survey",
    emoji: "📊",
    concept: "Math helps us understand people's opinions and measurements of earth systems. In PYP, we collect data in visual bar charts to solve statistical problems like the Mean (average value), Total, or Mode (most common result).",
    inquiryPrompt: "Inquiry: How do visual charts help make complex raw data easily understandable?",
    points: [
      "Bar Charts translate numbers into colorful heights that are easy to compare.",
      "Mode is the most common answer (the highest bar!).",
      "Total is the sum of all response data points.",
      "Mean is the fair share! Add all values up and divide by how many bars there are."
    ]
  }
};
