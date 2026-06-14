import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Calendar, Award, Sparkles, AlertCircle, CheckCircle2, Bookmark, HelpCircle } from "lucide-react";
import confetti from "canvas-confetti";

interface Question {
  id: string;
  theme: string;
  strand: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

interface DailyMathChallengeProps {
  onEarnStars: (count: number) => void;
  onSetBarnaby: (mood: "happy" | "thinking" | "resting" | "correct" | "incorrect", msg: string) => void;
}

const DAILY_POOL: Question[] = [
  {
    id: "d1",
    theme: "🐠 The Coral Reef Sanctuary",
    strand: "Strand: Data Handling",
    question: "At a coral sanctuary, the levels of healthy polyps recorded across 5 grids are: 14, 20, 18, 22, and 16. What is the 'Fair Share' Mean average of healthy polyps per grid?",
    choices: ["18 polyps", "16 polyps", "20 polyps", "17 polyps"],
    correctIndex: 0,
    explanation: "Add the levels together: 14 + 20 + 18 + 22 + 16 = 90. Divide by the count of grids (5): 90 ÷ 5 = 18! The fair share mean average is 18."
  },
  {
    id: "d2",
    theme: "🚀 René's Spaceship Map",
    strand: "Strand: Shape & Space (Coordinates)",
    question: "A spaceship coordinates pilot sets the engine to start at (-5, 3). If they translate the ship exactly 7 units right and 4 units down, what is the target (x, y) coordinate?",
    choices: ["(2, -1)", "(-12, 7)", "(12, -1)", "(-2, 1)"],
    correctIndex: 0,
    explanation: "Add 7 units to the horizontal coordinate: -5 + 7 = 2. Subtract 4 units from the vertical coordinate: 3 - 4 = -1. This places the spaceship exactly at coordinate (2, -1)."
  },
  {
    id: "d3",
    theme: "👨‍🍳 Barnaby's Cookie Kitchen",
    strand: "Strand: Numbers (Fractions)",
    question: "Leo is baking math snacks. The recipe calls for 3/4 kg of raw chocolate dust. If he wants to make only 1/3 of the recipe size, what fraction of a kilogram of chocolate dust does he need?",
    choices: ["1/4 kg", "1/3 kg", "5/12 kg", "3/4 kg"],
    correctIndex: 0,
    explanation: "Multiply the fraction values: 3/4 × 1/3 = 3/12 which simplifies exactly to 1/4 kg. So he needs 1/4 kg of chocolate dust!"
  },
  {
    id: "d4",
    theme: "📦 Storage Locker Packing",
    strand: "Strand: Measurement (Volume)",
    question: "A classroom storage cubic unit is 5 meters long, 2 meters wide, and 3 meters tall. If a student packs it exactly half full with science supplies, what volume in cubic meters remains empty?",
    choices: ["15 m³", "30 m³", "10 m³", "20 m³"],
    correctIndex: 0,
    explanation: "Total volume V = L × W × H = 5 × 2 × 3 = 30 m³. If it is half full, then half remains empty: 30 ÷ 2 = 15 m³!"
  },
  {
    id: "d5",
    theme: "🍬 The Mode Snack Bag",
    strand: "Strand: Data Handling",
    question: "In Mrs. Smith's class, students count the cherry drops in 7 snack bags: 8, 12, 10, 12, 9, 12, and 10. What is the statistical Mode of sweet drops per snack bag?",
    choices: ["12 drops", "10 drops", "11 drops", "9 drops"],
    correctIndex: 0,
    explanation: "The mode is the value that appears most frequently. In this dataset, the number 12 appears three times, while 10 appears twice, and 8, 9 appear only once. Thus, the Mode is 12!"
  },
  {
    id: "d6",
    theme: "🗺️ Geometry Quadrant Puzzle",
    strand: "Strand: Shape & Space",
    question: "Line segment AB is plotted in Quadrant II. If point A is at (-3, 6) and is reflected over the X-axis, what are the brand new coordinates of reflected point A'?",
    choices: ["(-3, -6)", "(3, 6)", "(-3, 6)", "(3, -6)"],
    correctIndex: 0,
    explanation: "Reflecting over the X-axis keeps the X-coordinate identical but negates the Y-coordinate. Thus, (-3, 6) becomes (-3, -6)!"
  },
  {
    id: "d7",
    theme: "🍕 The Spinachy Pizza Feast",
    strand: "Strand: Numbers (Decimals)",
    question: "Barnaby and his friends eat 2/5 of a giant spinach pizza. If they turn the remaining uneaten fraction into a decimal expression, what value do they discover?",
    choices: ["0.6", "0.4", "0.2", "0.8"],
    correctIndex: 0,
    explanation: "If they ate 2/5, the remaining part is 3/5. Dividing 3 by 5 yields exactly 0.6 in decimal format!)"
  },
  {
    id: "d8",
    theme: "🌊 Biological Submersibles",
    strand: "Strand: Measurement (Volume)",
    question: "A underwater submersible tank has a base area of 12 m² and height of 3 meters. If we keep the base area constant but triple the height, what is the new holding volume?",
    choices: ["108 m³", "36 m³", "48 m³", "72 m³"],
    correctIndex: 0,
    explanation: "The original volume V = Base Area × Height = 12 × 3 = 36 m³. Since we triple the height, the volume also triples: 36 × 3 = 108 m³!"
  },
  {
    id: "d9",
    theme: "📐 Constant Slope Architects",
    strand: "Strand: Algebra & Equations",
    question: "A high-precision ramp starts at (0,0) and ends at coordinate (4, 12). What is the constant slope (represented as change in y divided by change in x) of this linear ramp?",
    choices: ["3", "4", "1/3", "12"],
    correctIndex: 0,
    explanation: "Slope equals rise over run: (12 - 0) / (4 - 0) = 12 / 4 = 3. This means for every unit we move horizontally, we rise 3 units vertically!"
  },
  {
    id: "d10",
    theme: "🌡️ Weather Stations Range",
    strand: "Strand: Data Handling",
    question: "Meteorologists record the highest daily temperatures across 6 stations: 18°C, 25°C, 30°C, 15°C, 21°C, and 28°C. What is the statistical Range of these recorded values?",
    choices: ["15°C", "30°C", "18°C", "12°C"],
    correctIndex: 0,
    explanation: "Range is calculated as Maximum value minus the Minimum value: Max is 30°C and Min is 15°C. Thus, Range = 30 - 15 = 15°C!"
  },
  {
    id: "d11",
    theme: "🔺 Isometric Vertices Shift",
    strand: "Strand: Shape & Space",
    question: "A triangle on a grid has vertex C at coordinates (1, 5). If the triangle is translated exactly 2 units downward, what is the new coordinate of C'?",
    choices: ["(1, 3)", "(1, 7)", "(-1, 5)", "(3, 5)"],
    correctIndex: 0,
    explanation: "Translating a point downward subtracts specifically from the Y axis. Thus, subtracting 2 units from the Y position of C(1, 5) gives C'(1, 3)!"
  },
  {
    id: "d12",
    theme: "🎒 Shopping Double Coupons",
    strand: "Strand: Numbers",
    question: "A Math Backpack is listed at $50. It has a initial 20% discount. If Barnaby then applies a 10% coupon on top of that discounted price, what is the final cost?",
    choices: ["$36", "$35", "$40", "$30"],
    correctIndex: 0,
    explanation: "First, apply 20% off: 20% of $50 is $10, so the intermediate cost becomes $40. Second, apply 10% off of $40, which is $4. Final cost equals $40 - $4 = $36!"
  },
  {
    id: "d13",
    theme: "🏗️ Block Stacker volume",
    strand: "Strand: Measurement (Volume)",
    question: "A student stacks unit cubic blocks to create a monument. The base layer uses 16 cubes, the second uses 9, and the topper uses 4. What is the total volume in cubic units?",
    choices: ["29 units³", "25 units³", "36 units³", "20 units³"],
    correctIndex: 0,
    explanation: "The volume is the sum of the physical blocks used: 16 + 9 + 4 = 29 cubic units."
  },
  {
    id: "d14",
    theme: "🗳️ Mascot Voting Turnout",
    strand: "Strand: Fractions",
    question: "Out of 32 children in Class 5A, 24 chose Barnaby as their favorite mascot. What is this voting ratio simplified to its lowest equivalent fraction?",
    choices: ["3/4", "6/8", "12/16", "2/3"],
    correctIndex: 0,
    explanation: "24/32 has a greatest common factor (GCF) of 8. Dividing both numerator and denominator by 8 leaves exactly 3/4."
  },
  {
    id: "d15",
    theme: "🪵 Solid Corner subtraction",
    strand: "Strand: Measurement (Volume)",
    question: "A solid wooden box has length 4m, width 3m, and height 2m. If we cut out a single small 1m x 1m x 1m cube from the corner, what is the box's remaining volume?",
    choices: ["23 m³", "24 m³", "22 m³", "20 m³"],
    correctIndex: 0,
    explanation: "The initial volume of the box is 4 × 3 × 2 = 24 cubic meters. Subtracting the 1 m³ cut-out gives 24 - 1 = 23 cubic meters!"
  }
];

export default function DailyMathChallenge({ onEarnStars, onSetBarnaby }: DailyMathChallengeProps) {
  // Determine date key
  const todayString = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  // Formatted date string to show on UI
  const formattedTodayDate = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // Pick question based on deterministic hash of raw todayString date coordinates
  const currentDailyQuestion = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < todayString.length; i++) {
      hash = todayString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % DAILY_POOL.length;
    return DAILY_POOL[idx];
  }, [todayString]);

  // States
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [userExplanationText, setUserExplanationText] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrectHandled, setIsCorrectHandled] = useState<boolean>(false);
  
  // Track has solved today across reloads
  const [completedToday, setCompletedToday] = useState<boolean>(() => {
    return localStorage.getItem(`math5ib_daily_solved_${todayString}`) === "true";
  });

  const [savedUserExplanation, setSavedUserExplanation] = useState<string>(() => {
    return localStorage.getItem(`math5ib_daily_explanation_${todayString}`) || "";
  });

  const [savedUserSelection, setSavedUserSelection] = useState<string>(() => {
    return localStorage.getItem(`math5ib_daily_selection_${todayString}`) || "";
  });

  // Load state if solved
  useEffect(() => {
    if (completedToday) {
      setIsSubmitted(true);
      setIsCorrectHandled(true);
      if (savedUserExplanation) {
        setUserExplanationText(savedUserExplanation);
      }
    }
  }, [completedToday, savedUserExplanation, todayString]);

  const minExplanationLength = 12;
  const isExplanationValid = userExplanationText.trim().length >= minExplanationLength;

  const handleSubmitAnswer = () => {
    if (selectedAnswerIndex === null || isSubmitted) return;

    if (!isExplanationValid) {
      onSetBarnaby(
        "thinking",
        "Your math inquiry steps are valuable! Please write at least 12 characters explaining your steps before submitting today's challenge."
      );
      return;
    }

    const isCorrect = selectedAnswerIndex === currentDailyQuestion.correctIndex;
    setIsSubmitted(true);
    setIsCorrectHandled(isCorrect);

    // Save states to local storage
    localStorage.setItem(`math5ib_daily_solved_${todayString}`, "true");
    localStorage.setItem(`math5ib_daily_selection_${todayString}`, currentDailyQuestion.choices[selectedAnswerIndex]);
    localStorage.setItem(`math5ib_daily_explanation_${todayString}`, userExplanationText.trim());

    // Inject this directly to student interactive portfolio ledger!
    try {
      const portfolioRaw = localStorage.getItem("math5ib_saved_explanations");
      const currentLedger = portfolioRaw ? JSON.parse(portfolioRaw) : [];
      const newPortfolioEntry = {
        id: "daily_" + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + new Date().toLocaleDateString(),
        categoryTitle: `⭐️ Daily Challenge: ${currentDailyQuestion.strand}`,
        questionText: currentDailyQuestion.question,
        playerExplanation: userExplanationText.trim() || "(No explanation written)",
        selectedAnswer: currentDailyQuestion.choices[selectedAnswerIndex],
        correctAnswer: currentDailyQuestion.choices[currentDailyQuestion.correctIndex],
        isCorrect: isCorrect,
        teacherRating: 0,
        teacherFeedback: "Pending review for Daily challenge inquiry streak!"
      };
      const updatedLedger = [newPortfolioEntry, ...currentLedger];
      localStorage.setItem("math5ib_saved_explanations", JSON.stringify(updatedLedger));
    } catch (e) {
      console.error("Failed storing daily challenge into portfolio ledger", e);
    }

    if (isCorrect) {
      // 15 bonus stars!
      onEarnStars(15);
      setCompletedToday(true);
      onSetBarnaby(
        "correct",
        `Splendid, math master! 🎉 You solved today's Daily Mathematics Challenge correctly! Recieved 15 bonus stars!`
      );
      
      // Burst confetti
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 }
      });
    } else {
      onSetBarnaby(
        "incorrect",
        `Nice try, math scout! 🦉 Look closely at Barnaby's inquiry steps below to conquer it next time. Your work has been saved!`
      );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-indigo-150 shadow-sm overflow-hidden select-text">
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-850 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2.5 rounded-2xl text-2xl">
            <Calendar className="w-6 h-6 text-yellow-300 animate-pulse animate-none" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-yellow-400 text-indigo-950 px-2 py-0.5 rounded-full font-black uppercase tracking-widest leading-none">
                Daily Bonus
              </span>
              <span className="text-xs text-indigo-200 font-bold tracking-wide">
                15 Stars Reward
              </span>
            </div>
            <h3 className="text-lg font-black tracking-tight leading-normal mt-0.5">
              Daily Mathematics Challenge
            </h3>
          </div>
        </div>
        <div className="text-right sm:text-right">
          <p className="text-xs text-indigo-100 font-bold font-sans">
            {formattedTodayDate}
          </p>
          <p className="text-[10px] text-yellow-350 font-black tracking-widest uppercase mt-0.5">
            {completedToday ? "✅ Solved and Saved" : "🎯 New Quest Awaiting"}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Topic Strand */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-150">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
            {currentDailyQuestion.strand}
          </span>
          <span className="text-xs text-slate-700 font-extrabold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" strokeWidth={3} />
            <span>Theme: {currentDailyQuestion.theme}</span>
          </span>
        </div>

        {/* Question Text */}
        <div className="space-y-4">
          <h4 className="text-base font-extrabold text-slate-900 leading-relaxed font-sans">
            {currentDailyQuestion.question}
          </h4>

          {/* Choices Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentDailyQuestion.choices.map((choice, idx) => {
              const isSelected = selectedAnswerIndex === idx || (completedToday && choice === savedUserSelection);
              const isCorrectOption = idx === currentDailyQuestion.correctIndex;
              
              let choiceStyle = "border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50 text-slate-800";
              if (isSelected) {
                choiceStyle = "border-indigo-500 bg-indigo-50/70 text-indigo-900 font-black ring-2 ring-indigo-500";
              }
              if (isSubmitted) {
                if (isCorrectOption) {
                  choiceStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-black ring-2 ring-emerald-500";
                } else if (isSelected && !isCorrectHandled) {
                  choiceStyle = "border-rose-500 bg-rose-50 text-rose-900 font-black ring-1 ring-rose-500";
                } else {
                  choiceStyle = "border-slate-100 bg-slate-55/40 text-slate-400 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isSubmitted}
                  onClick={() => {
                    setSelectedAnswerIndex(idx);
                    onSetBarnaby(
                      "thinking",
                      `Ah, choice "${choice}"! Now outline your mathematical steps below so your teacher can review your inquiry process!`
                    );
                  }}
                  className={`p-4 rounded-2xl border text-left text-xs transition-all cursor-pointer flex items-center gap-3 ${choiceStyle}`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black border uppercase shrink-0 ${
                    isSelected ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="leading-snug">{choice}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step-by-Step Explanation area */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 font-sans">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" strokeWidth={3} />
              <span>Deductive Inquiry Proof & Steps</span>
              {!isSubmitted && (
                <span className="bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide">
                  Required step
                </span>
              )}
            </div>
            <span className={`text-[10px] font-mono font-bold ${isExplanationValid ? "text-emerald-600" : "text-slate-400"}`}>
              {userExplanationText.trim().length} chars (min: {minExplanationLength})
            </span>
          </div>

          <textarea
            disabled={isSubmitted}
            value={userExplanationText}
            onChange={(e) => setUserExplanationText(e.target.value)}
            placeholder="Outline your step-by-step math methodology here index by index. Why is this correct? (e.g. My steps: total volume is 30...)"
            className="w-full h-24 p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-slate-800 bg-white placeholder-slate-400 resize-none font-medium leading-relaxed"
          />

          <p className="text-[10px] text-slate-500 leading-normal flex items-start gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <span>
              Your explanation proof automatically binds to your persistent <strong>Interactive Student Portfolio Ledger</strong>, allowing instructors or parents to grade your inquiry process.
            </span>
          </p>
        </div>

        {/* Action Button & Solution reveal */}
        <div className="space-y-4">
          {!isSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswerIndex === null || !isExplanationValid}
              className={`w-full py-3.5 font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedAnswerIndex !== null && isExplanationValid
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white transform hover:-translate-y-0.5"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Award className="w-4 h-4" /> Submit Daily Challenge Verification
            </button>
          ) : (
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start gap-3.5 ${
                  isCorrectHandled
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : "bg-rose-50 border-rose-200 text-rose-950"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCorrectHandled ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-rose-600" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <h5 className="font-extrabold text-sm leading-none flex items-center gap-1.5">
                    {isCorrectHandled ? (
                      <span>Splendid Achievement! Verified Proof 🌟</span>
                    ) : (
                      <span>Nice Attempt! Let's Analyze the Steps 🦉</span>
                    )}
                  </h5>
                  <p className="text-xs font-semibold leading-relaxed text-slate-650 italic">
                    My written steps: "{userExplanationText}"
                  </p>
                  <p className="text-xs leading-relaxed text-slate-700 font-medium">
                    <strong>Correct Solution Walkthrough:</strong> {currentDailyQuestion.explanation}
                  </p>
                </div>
              </motion.div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-950">
                <span className="font-bold flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-indigo-600 animate-pulse" />
                  <span>Interactive Portfolio Ledger synchronized successfully.</span>
                </span>
                <span className="text-[9px] bg-indigo-100 text-indigo-700 font-extrabold tracking-wide uppercase px-2.5 py-1 rounded">
                  Status: Solved Today
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
