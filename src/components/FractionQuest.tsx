import React, { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { HelpCircle, Star, Sparkles, RefreshCw, CheckCircle2, ChevronRight } from "lucide-react";
import confetti from "canvas-confetti";

interface FractionQuestProps {
  onEarnStars: (count: number) => void;
  onSetBarnabyMood: (mood: "happy" | "thinking" | "resting" | "correct" | "incorrect", msg: string) => void;
}

export default function FractionQuest({ onEarnStars, onSetBarnabyMood }: FractionQuestProps) {
  // Split level states
  const [slices, setSlices] = useState<number>(4);
  const [shadedSlices, setShadedSlices] = useState<Record<number, boolean>>({});

  // Question Generator states
  const [questType, setQuestType] = useState<"shade" | "decimal" | "equivalent">("shade");
  const [nTarget, setNTarget] = useState<number>(3);
  const [dTarget, setDTarget] = useState<number>(4);
  
  // Decimal target state
  const [userDecimalInput, setUserDecimalInput] = useState<string>("");
  // Equivalent target state
  const [userEquivNumerator, setUserEquivNumerator] = useState<string>("");

  const [feedback, setFeedback] = useState<{ isCorrect: boolean | null; text: string }>({
    isCorrect: null,
    text: "Review the math tip and help Barnaby complete this fraction slice puzzle!",
  });

  const [questSolved, setQuestSolved] = useState<boolean>(false);

  // Generate a random appropriate Grade 5 question
  const generateNewQuestion = () => {
    setQuestSolved(false);
    setUserDecimalInput("");
    setUserEquivNumerator("");
    setFeedback({ isCorrect: null, text: "" });

    const types: ("shade" | "decimal" | "equivalent")[] = ["shade", "decimal", "equivalent"];
    const randomType = types[Math.floor(Math.random() * types.length)];
    setQuestType(randomType);

    if (randomType === "shade") {
      // Pick a fraction to shade
      const denominators = [2, 3, 4, 5, 6, 8, 10];
      const d = denominators[Math.floor(Math.random() * denominators.length)];
      const n = Math.floor(Math.random() * (d - 1)) + 1; // 1 to d-1
      setDTarget(d);
      setNTarget(n);
      setSlices(d);
      setShadedSlices({});
      onSetBarnabyMood("thinking", `Can you slice the pie into ${d} equal pieces and shade exactly ${n}/${d} parts? Click the sectors to shade them!`);
    } else if (randomType === "decimal") {
      // Pick a fraction with clean decimal representation: 1/2, 1/4, 3/4, 1/5, 2/5, 3/5, 4/5, 1/10, 7/10
      const pairs = [
        { n: 1, d: 2 },
        { n: 1, d: 4 },
        { n: 3, d: 4 },
        { n: 1, d: 5 },
        { n: 2, d: 5 },
        { n: 3, d: 5 },
        { n: 4, d: 5 },
        { n: 3, d: 10 },
        { n: 7, d: 10 },
      ];
      const picked = pairs[Math.floor(Math.random() * pairs.length)];
      setNTarget(picked.n);
      setDTarget(picked.d);
      setSlices(picked.d);
      
      // Auto-shade the perfect amount
      const shaded: Record<number, boolean> = {};
      for (let i = 0; i < picked.n; i++) {
        shaded[i] = true;
      }
      setShadedSlices(shaded);
      onSetBarnabyMood("thinking", `Look at this shaded pizza! It spans ${picked.n} parts out of ${picked.d}. What is the decimal matching the fraction ${picked.n}/${picked.d}? (Hint: Divide top by bottom!)`);
    } else {
      // Equivalent fractions: e.g. 2/4 is equivalent to x/2, 4/8 is x/2, 2/6 is x/3
      const equivalents = [
        { origN: 2, origD: 4, targetD: 2, correctN: 1 },
        { origN: 4, origD: 8, targetD: 2, correctN: 1 },
        { origN: 6, origD: 8, targetD: 4, correctN: 3 },
        { origN: 2, origD: 6, targetD: 3, correctN: 1 },
        { origN: 4, origD: 6, targetD: 3, correctN: 2 },
        { origN: 2, origD: 8, targetD: 4, correctN: 1 },
        { origN: 4, origD: 10, targetD: 5, correctN: 2 },
        { origN: 8, origD: 10, targetD: 5, correctN: 4 },
      ];
      const picked = equivalents[Math.floor(Math.random() * equivalents.length)];
      setNTarget(picked.origN);
      setDTarget(picked.origD);
      // Set slices to the secondary target
      setSlices(picked.origD);
      
      // Pre-shade the original fraction
      const shaded: Record<number, boolean> = {};
      for (let i = 0; i < picked.origN; i++) {
        shaded[i] = true;
      }
      setShadedSlices(shaded);
      
      // We will ask them: original fraction = x / targetD
      setDTarget(picked.targetD); // We put the smaller target denominator in dTarget for comparison
      setNTarget(picked.correctN); // correct answer for equiv numerator
      onSetBarnabyMood("thinking", `Equivalence Challenge! We shaded ${picked.origN}/${picked.origD} of this pie. This fits the exact same space as what number of slices if our denominator is ${picked.targetD}?`);
    }
  };

  // Run on mount
  useEffect(() => {
    generateNewQuestion();
  }, []);

  // Compute standard pie slices for the SVG
  const piePaths = useMemo(() => {
    const paths = [];
    const R = 75;
    const Cx = 100;
    const Cy = 100;
    
    for (let i = 0; i < slices; i++) {
      const angle1 = (i * 2 * Math.PI) / slices - Math.PI / 2;
      const angle2 = ((i + 1) * 2 * Math.PI) / slices - Math.PI / 2;
      
      const x1 = Cx + R * Math.cos(angle1);
      const y1 = Cy + R * Math.sin(angle1);
      
      const x2 = Cx + R * Math.cos(angle2);
      const y2 = Cy + R * Math.sin(angle2);
      
      paths.push({
        id: i,
        d: `M ${Cx} ${Cy} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`,
        textX: Cx + (R * 0.65) * Math.cos((angle1 + angle2) / 2),
        textY: Cy + (R * 0.65) * Math.sin((angle1 + angle2) / 2),
      });
    }
    return paths;
  }, [slices]);

  // Handle a click on a particular slice sector
  const toggleShade = (index: number) => {
    if (questSolved) return;
    setShadedSlices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const countShaded = useMemo(() => {
    return Object.values(shadedSlices).filter(Boolean).length;
  }, [shadedSlices]);

  // Check user solution
  const verifyAnswer = () => {
    if (questSolved) return;

    if (questType === "shade") {
      if (slices !== dTarget) {
        setFeedback({
          isCorrect: false,
          text: `Oops! Make sure to set the denominator to ${dTarget} first. Current total slices is ${slices}.`,
        });
        onSetBarnabyMood("incorrect", `Let's use the division sliders or buttons to set the total slices to ${dTarget}!`);
        return;
      }

      if (countShaded === nTarget) {
        setQuestSolved(true);
        setFeedback({
          isCorrect: true,
          text: `Fantastic slicing! You've shaded exactly ${nTarget}/${dTarget} of the pizza! 🍕`,
        });
        onEarnStars(5);
        onSetBarnabyMood("correct", "You did it! That is exactly the right visual representation of the fraction! Have 5 stars! ⭐");
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
      } else {
        setFeedback({
          isCorrect: false,
          text: `Not quite right! You've shaded ${countShaded} parts, but Barnaby asked for exactly ${nTarget} parts out of ${dTarget}.`,
        });
        onSetBarnabyMood("incorrect", `We need exactly ${nTarget} yellow-shaded parts. Tap sectors to add or remove shading!`);
      }
    } 
    
    else if (questType === "decimal") {
      const correctDecimalVal = (nTarget / dTarget).toString();
      const prepInput = userDecimalInput.trim();

      if (prepInput === correctDecimalVal || parseFloat(prepInput) === nTarget/dTarget) {
        setQuestSolved(true);
        setFeedback({
          isCorrect: true,
          text: `Correct! ${nTarget}/${dTarget} scales precisely to the decimal value ${correctDecimalVal}! 🌟`,
        });
        onEarnStars(5);
        onSetBarnabyMood("correct", `Awesome math decimal mapping! ${nTarget} divided by ${dTarget} equals exactly ${correctDecimalVal}. +5 Stars!`);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
      } else {
        setFeedback({
          isCorrect: false,
          text: `Incorrect decimal. Hint: ${nTarget} ÷ ${dTarget} is equal to half of ${nTarget * 2 / dTarget}. Try again!`,
        });
        onSetBarnabyMood("incorrect", `Take your time! What is ${nTarget} shared among ${dTarget} groups? Type a decimal like 0.25 or 0.5.`);
      }
    } 
    
    else if (questType === "equivalent") {
      const targetVal = nTarget; // The target equivalent numerator
      const parsedUser = parseInt(userEquivNumerator.trim(), 10);

      if (parsedUser === targetVal) {
        setQuestSolved(true);
        setFeedback({
          isCorrect: true,
          text: `Magnificent equivalent conversion! Yes, shaded area is identical! ${countShaded}/${slices} is exactly equivalent to ${targetVal}/${dTarget}!`,
        });
        onEarnStars(5);
        onSetBarnabyMood("correct", `Brilliant work on equivalent fractions! They share the exact same physical space. Here are 5 Math Stars! ⭐`);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
      } else {
        setFeedback({
          isCorrect: false,
          text: `Not equivalent. Think about the ratio: if we reduce the pieces, how many of those larger chunks are shaded?`,
        });
        onSetBarnabyMood("incorrect", `Try looking at the colored pie. If there are only ${dTarget} total pieces, how many would need shading?`);
      }
    }
  };

  return (
    <div id="fraction-quest" className="bg-white rounded-3xl p-6 shadow-md border border-amber-100 flex flex-col gap-6">
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🍰</span>
          <div>
            <h2 className="text-2xl font-bold text-amber-600">Fraction & Decimal Slicer</h2>
            <p className="text-xs text-slate-500">PYP Grade 5 Number Theory Strand</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={generateNewQuestion}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Skip / New Problem
          </button>
        </div>
      </div>

      {/* Main inquiry box */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100/60 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-800 text-sm">Active Quest Rule:</h4>
          {questType === "shade" && (
            <p className="text-slate-700 text-sm">
              Slices settings: set denominator to <span className="font-bold text-amber-600 text-base">{dTarget}</span> using the sliders or buttons. Then click the pizza sectors until exactly <span className="font-bold text-amber-600 text-base">{nTarget}</span> are highlighted yellow!
            </p>
          )}
          {questType === "decimal" && (
            <p className="text-slate-700 text-sm">
              Identify what decimal represents the colored proportion of this pizza. There are <span className="font-semibold text-amber-600">{nTarget}</span> parts shaded yellow out of <span className="font-semibold text-amber-600">{dTarget}</span> total pieces.
            </p>
          )}
          {questType === "equivalent" && (
            <p className="text-slate-700 text-sm">
              We shaded <span className="font-bold text-amber-600">{countShaded}</span> out of <span className="font-bold text-amber-600">{slices}</span> slices. If we divide this same pizza into <span className="font-bold text-indigo-600 text-base">{dTarget}</span> big slices instead, how many would be shaded?
            </p>
          )}
        </div>
      </div>

      {/* Main interaction workspace */}
      <div id="fraction-workspace" className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        
        {/* Left Side: Visual Interactive SVG Pizza representer */}
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 w-full max-w-[240px] aspect-square flex items-center justify-center">
            {/* Interactive Pie Chart */}
            <svg viewBox="0 0 200 200" className="w-[180px] h-[180px] overflow-visible">
              <circle cx="100" cy="100" r="77" className="fill-slate-100 stroke-slate-300 stroke-[5]" />
              
              {piePaths.map((item) => (
                <path
                  key={item.id}
                  d={item.d}
                  className={`cursor-pointer transition-all duration-300 stroke-/5 shadow-sm ${
                    shadedSlices[item.id]
                      ? "fill-amber-300 hover:fill-amber-400 stroke-amber-500 stroke-[2.5]"
                      : "fill-white hover:fill-amber-50 stroke-slate-300 stroke-[1.5]"
                  }`}
                  onClick={() => toggleShade(item.id)}
                />
              ))}

              {/* Pizza Crust border */}
              <circle cx="100" cy="100" r="75" className="fill-none stroke-amber-700/30 stroke-[3] pointer-events-none" />

              {/* Numerator index on each slice for easier counting */}
              {piePaths.map((item) => (
                <text
                  key={`text-${item.id}`}
                  x={item.textX}
                  y={item.textY}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className="font-bold text-[10px] text-slate-500 fill-current pointer-events-none"
                >
                  {item.id + 1}
                </text>
              ))}
            </svg>
            
            {/* Legend marker */}
            <div className="absolute bottom-2 right-2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded font-mono shadow-sm">
              {countShaded} / {slices}
            </div>
          </div>

          {/* Slices control (Only when in "shade" mode so kids can practice splitting pizzas) */}
          <div className="w-full max-w-[240px] flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-500 text-center">
              Total Pizza Slices (Denominator): <span className="text-amber-600 font-bold font-mono text-sm">{slices}</span>
            </span>
            
            {questType === "shade" ? (
              <div className="flex gap-1 justify-center flex-wrap">
                {[2, 3, 4, 5, 6, 8, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setSlices(num);
                      setShadedSlices({});
                    }}
                    className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-colors cursor-pointer ${
                      slices === num
                        ? "bg-amber-500 text-white border-amber-600"
                        : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-xs text-slate-400 font-medium">
                (Slices locked to target for this problem)
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Problem Input & Answers Form */}
        <div className="flex flex-col gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-3 uppercase tracking-wider text-slate-400">
              Your Answer Panel
            </h3>

            {/* Answer style depending on Quest type */}
            {questType === "shade" && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-slate-500 leading-normal">
                  Shade the circles by clicking on sectors. Make total slices <span className="font-semibold text-slate-700">{dTarget}</span>, then confirm your answer when exactly {nTarget} are shaded.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-lg text-xs font-bold leading-none">
                    Target fraction:
                  </div>
                  <span className="text-xl font-bold text-slate-700 font-mono">
                    {nTarget} / {dTarget}
                  </span>
                </div>
              </div>
            )}

            {questType === "decimal" && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-slate-500">
                  What is the matching decimal representing the fraction <span className="font-semibold text-slate-700 font-mono text-sm">{nTarget}/{dTarget}</span>?
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-600">Decimal Value:</span>
                  <input
                    type="text"
                    disabled={questSolved}
                    placeholder="0.XX"
                    value={userDecimalInput}
                    onChange={(e) => setUserDecimalInput(e.target.value)}
                    className="w-24 px-3 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-center font-mono font-bold text-lg"
                  />
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {["0.2", "0.25", "0.3", "0.4", "0.5", "0.6", "0.7", "0.75", "0.8"].map((val) => (
                    <button
                      key={val}
                      disabled={questSolved}
                      onClick={() => setUserDecimalInput(val)}
                      className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 rounded text-slate-600 font-mono"
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {questType === "equivalent" && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-slate-500">
                  Find the missing equivalent numerator. Share the proportion exactly!
                </p>
                
                <div className="flex items-center justify-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {/* Left Side Fraction */}
                  <div className="flex flex-col items-center">
                    <span className="text-base font-bold text-slate-700 font-mono">{countShaded}</span>
                    <div className="w-8 h-0.5 bg-slate-500 py-0 my-1"></div>
                    <span className="text-base font-bold text-slate-700 font-mono">{slices}</span>
                  </div>

                  {/* Equal sign */}
                  <span className="text-2xl font-bold text-amber-500 select-none">=</span>

                  {/* Right Side Fraction with Input */}
                  <div className="flex flex-col items-center">
                    <input
                      type="text"
                      disabled={questSolved}
                      placeholder="?"
                      value={userEquivNumerator}
                      onChange={(e) => setUserEquivNumerator(e.target.value)}
                      className="w-12 h-10 border-2 border-amber-500 rounded-lg text-center font-bold font-mono text-lg text-amber-700 focus:outline-none"
                    />
                    <div className="w-8 h-0.5 bg-slate-500 py-0 my-1"></div>
                    <span className="text-base font-bold text-slate-700 font-mono">{dTarget}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Verification feedback and Buttons */}
          <div className="flex flex-col gap-2">
            {!questSolved ? (
              <button
                onClick={verifyAnswer}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-2xl shadow-md transform hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Check Slicing Answer!
              </button>
            ) : (
              <button
                onClick={generateNewQuestion}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-2xl shadow-md transform hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                Next Challenge <ChevronRight className="w-4 h-4 animate-pulse" />
              </button>
            )}

            {/* Live Feedback Text Banner */}
            {feedback.isCorrect !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-3 rounded-xl border text-xs font-semibold ${
                  feedback.isCorrect
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  {feedback.isCorrect ? "⭐ Success!" : "🤔 Try Again!"}
                </div>
                {feedback.text}
              </motion.div>
            )}
          </div>

        </div>
      </div>

      {/* Helpful inquiry tip card */}
      <div className="bg-slate-50/80 p-4 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-2 select-text">
        <h5 className="font-semibold text-slate-800 uppercase tracking-wider text-[10px]">Barnaby's Tip File 📚</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-slate-700">How equivalents work: </p>
            <p>If you slice a candy bar into 2 parts and take 1, or slice it into 8 parts and take 4, you ate the same amount (half!). Mathematics counts this as: <code className="font-bold">1/2 = 4/8</code>.</p>
          </div>
          <div>
            <p className="font-semibold text-slate-700">Converting to Decimal: </p>
            <p>Always solve division ratio: <code className="font-bold">Numerator ÷ Denominator</code>. For example, 1/4 is one quarter, which is written as <code className="font-bold">0.25</code>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
