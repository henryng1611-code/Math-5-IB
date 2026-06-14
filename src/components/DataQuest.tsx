import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { BarChart2, RefreshCw, Star, HelpCircle, Check, Play } from "lucide-react";
import confetti from "canvas-confetti";

interface DataQuestProps {
  onEarnStars: (count: number) => void;
  onSetBarnabyMood: (mood: "happy" | "thinking" | "resting" | "correct" | "incorrect", msg: string) => void;
}

interface ChartItem {
  id: string;
  name: string;
  value: number;
  color: string;
}

export default function DataQuest({ onEarnStars, onSetBarnabyMood }: DataQuestProps) {
  // Chart categories and values
  const [items, setItems] = useState<ChartItem[]>([
    { id: "mon", name: "Mon", value: 4, color: "bg-red-400" },
    { id: "tue", name: "Tue", value: 8, color: "bg-amber-400" },
    { id: "wed", name: "Wed", value: 2, color: "bg-emerald-400" },
    { id: "thu", name: "Thu", value: 6, color: "bg-cyan-400" },
  ]);

  // Quiz states
  const [questType, setQuestType] = useState<"mode" | "total" | "mean">("total");
  const [multipleChoices, setMultipleChoices] = useState<string[]>([]);
  const [correctChoice, setCorrectChoice] = useState<string>("");
  const [selectedUserChoice, setSelectedUserChoice] = useState<string | null>(null);
  
  const [questSolved, setQuestSolved] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean | null; text: string }>({
    isCorrect: null,
    text: "Adjust chart bars to help inspect standard survey data!",
  });

  // Calculate stats based on current items
  const stats = useMemo(() => {
    let sum = 0;
    let modeValue = -1;
    let modeLabel = "";
    const counts: Record<number, number> = {};
    
    items.forEach((item) => {
      sum += item.value;
      counts[item.value] = (counts[item.value] || 0) + 1;
    });

    // Simple mode (highest bar category)
    let highestIdx = 0;
    for (let i = 1; i < items.length; i++) {
      if (items[i].value > items[highestIdx].value) {
        highestIdx = i;
      }
    }
    modeLabel = items[highestIdx].name;

    const mean = (sum / items.length).toFixed(1);

    return { total: sum, mean, mode: modeLabel };
  }, [items]);

  // Generate new lesson task
  const generateNewQuest = () => {
    setQuestSolved(false);
    setSelectedUserChoice(null);
    setFeedback({ isCorrect: null, text: "" });

    // Setup random starting values
    const startingValues = [
      Math.floor(Math.random() * 8) + 2,
      Math.floor(Math.random() * 8) + 2,
      Math.floor(Math.random() * 8) + 2,
      Math.floor(Math.random() * 8) + 2,
    ];

    const newItems = [
      { id: "apple", name: "🍎 Apple", value: startingValues[0], color: "#ef4444" },
      { id: "banana", name: "🍌 Banana", value: startingValues[1], color: "#f59e0b" },
      { id: "kiwi", name: "🥝 Kiwi", value: startingValues[2], color: "#10b981" },
      { id: "orange", name: "🍊 Orange", value: startingValues[3], color: "#06b6d4" },
    ];
    setItems(newItems);

    const types: ("mode" | "total" | "mean")[] = ["mode", "total", "mean"];
    const type = types[Math.floor(Math.random() * types.length)];
    setQuestType(type);

    // Calculate answers
    const sum = startingValues.reduce((a, b) => a + b, 0);
    const meanVal = sum / 4;

    // Find the mode
    let max = -1;
    let modeFruit = "";
    newItems.forEach((f) => {
      if (f.value > max) {
        max = f.value;
        modeFruit = f.name;
      }
    });

    if (type === "mode") {
      setCorrectChoice(modeFruit);
      // Choices are categories
      setMultipleChoices(newItems.map((f) => f.name));
      onSetBarnabyMood("thinking", "Look at the survey chart! Which fruit received the highest votes of all (the statistical MODE)?");
    } 
    else if (type === "total") {
      setCorrectChoice(String(sum));
      // Generate some dummy choices
      const choicesSet = new Set<string>();
      choicesSet.add(String(sum));
      while (choicesSet.size < 4) {
        const dev = Math.floor(Math.random() * 6) - 3;
        const choiceVal = Math.max(4, sum + dev);
        choicesSet.add(String(choiceVal));
      }
      setMultipleChoices(Array.from(choicesSet).sort((a, b) => parseInt(a) - parseInt(b)));
      onSetBarnabyMood("thinking", `The Grade 5 science class collected votes for field trips. Can you calculate the TOTAL number of children surveyed? Sum all matching bars!`);
    } 
    else {
      // Mean/Average question, we will design values to divide cleanly, or round to nearest decimal
      // Let's create choice list
      const correctStr = String(meanVal);
      setCorrectChoice(correctStr);
      
      const choicesSet = new Set<string>();
      choicesSet.add(correctStr);
      while (choicesSet.size < 4) {
        const dev = (Math.floor(Math.random() * 8) - 4) * 0.25;
        const choiceVal = Math.max(1, meanVal + dev);
        choicesSet.add(String(choiceVal));
      }
      setMultipleChoices(Array.from(choicesSet).sort((a, b) => parseFloat(a) - parseFloat(b)));
      onSetBarnabyMood("thinking", `Can you find the statistical MEAN of this student feedback? Total up the votes and divide by the 4 categories to find the fair share!`);
    }
  };

  useEffect(() => {
    generateNewQuest();
  }, []);

  const handleSelectChoice = (choice: string) => {
    if (questSolved) return;
    setSelectedUserChoice(choice);
    
    if (choice === correctChoice) {
      setQuestSolved(true);
      setFeedback({
        isCorrect: true,
        text: `Splendid Data analysis! The answer "${choice}" is 100% correct! ⭐`,
      });
      onEarnStars(5);
      onSetBarnabyMood("correct", `Correct analysis! You solved the statistical query. Have 5 Stars! 🌟`);
      confetti({ particleCount: 75, spread: 55, origin: { y: 0.8 } });
    } else {
      setFeedback({
        isCorrect: false,
        text: `Oops! "${choice}" is incorrect. Try recalculating the heights.`,
      });
      onSetBarnabyMood("incorrect", `Take a deep breath and recount the visual blocks. You can do this!`);
    }
  };

  // Adjust bar heights manually just for fun or to help count them!
  const changeBarValue = (index: number, diff: number) => {
    if (questSolved) return;
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          return { ...item, value: Math.max(0, Math.min(10, item.value + diff)) };
        }
        return item;
      })
    );
  };

  return (
    <div id="data-quest" className="bg-white rounded-3xl p-6 shadow-md border border-emerald-100 flex flex-col gap-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">📊</span>
          <div>
            <h2 className="text-2xl font-bold text-emerald-600">Statistical Data Explorer</h2>
            <p className="text-xs text-slate-500">PYP Grade 5 Data Handling (Bar Charts, Mode, Mean & Total)</p>
          </div>
        </div>
        <button
          onClick={generateNewQuest}
          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Skip / New Problem
        </button>
      </div>

      {/* Concept guide */}
      <div className="bg-emerald-50 border border-emerald-100/60 rounded-2xl p-4 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-emerald-800 text-sm">Active Quest Rule:</h4>
          {questType === "mode" && (
            <p className="text-slate-700 text-sm">
              The <span className="font-semibold text-emerald-700">Mode</span> is the most frequent feedback option. Simply spot which fruit bar stretches highest on the chart, and select that fruit!
            </p>
          )}
          {questType === "total" && (
            <p className="text-slate-700 text-sm">
              To calculate the <span className="font-semibold text-emerald-700">Total</span>, read the value number on the top of each bar, and sum them all together: <code className="font-mono bg-white px-1 py-0.5 rounded border">Bar 1 + Bar 2 + Bar 3 + Bar 4</code>.
            </p>
          )}
          {questType === "mean" && (
            <p className="text-slate-700 text-sm">
              To find the <span className="font-semibold text-emerald-700">Mean (Average)</span>, add up all visual bars, then divide that total value by <span className="font-semibold">4</span> (since there are 4 types). Think of it as sharing the cubes evenly!
            </p>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
        
        {/* Left Side: Interactive Dynamic Bar Graph */}
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative bg-white p-5 rounded-2xl border border-slate-200/80 w-full max-w-[280px] select-none shadow-sm">
            
            {/* Visual Axis lines and Columns */}
            <div className="h-[180px] w-full flex items-end justify-between border-b-2 border-slate-400 border-l-2 pl-3 relative pr-1 pt-4">
              
              {/* Horizontal grid guide lines */}
              {[2, 4, 6, 8, 10].map((level) => (
                <div
                  key={`guide-${level}`}
                  style={{ bottom: `${level * 10}%` }}
                  className="absolute left-0 right-0 border-t border-slate-100 border-dashed pointer-events-none w-full"
                >
                  <span className="absolute -left-5 -top-1.5 text-[8px] font-mono font-bold text-slate-400">
                    {level}
                  </span>
                </div>
              ))}

              {/* Rendering Dynamic Columns */}
              {items.map((f, idx) => {
                // height calculation
                const heightPct = f.value * 10; // since Max is 10 standard
                return (
                  <div key={f.id} className="flex flex-col items-center flex-1 mx-1 group">
                    {/* Hover Tooltip Value */}
                    <span className="text-[10px] bg-slate-800 text-white font-mono px-1.5 py-0.5 rounded -mb-1 z-10 font-bold opacity-90 transition-all">
                      {f.value}
                    </span>

                    {/* Bar visual with custom background */}
                    <div
                      style={{ height: `${heightPct}%`, backgroundColor: f.color }}
                      className="w-8 rounded-t-md relative transition-all duration-500 shadow-md border-t border-white/60"
                    >
                      <div className="absolute inset-x-0 bottom-0 bg-black/5 h-full rounded-t-md"></div>
                    </div>

                    {/* Plus/Minus small tweak controls */}
                    <div className="flex gap-0.5 mt-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => changeBarValue(idx, -1)}
                        className="w-4 h-4 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold rounded flex items-center justify-center cursor-pointer border text-slate-600"
                      >
                        -
                      </button>
                      <button
                        onClick={() => changeBarValue(idx, 1)}
                        className="w-4 h-4 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold rounded flex items-center justify-center cursor-pointer border text-slate-600"
                      >
                        +
                      </button>
                    </div>

                    {/* Category fruit label */}
                    <span className="text-[10px] md:text-xs font-bold text-slate-600 mt-1 whitespace-nowrap">
                      {f.name.split(" ")[1]}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Graph title metadata */}
            <div className="text-center font-bold text-slate-500 text-[10px] mt-4 uppercase tracking-widest font-sans">
              Survey: Favorite Grade 5 Healthy Snack
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 font-medium">
            (Hover columns to modify or verify numerical tallies!)
          </div>
        </div>

        {/* Right Side: Multiple Choices Question form */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-3">
              Task Questions:
            </h3>

            {questType === "mode" && (
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                What snack is the <span className="font-bold text-emerald-600">Mode Category</span> of this survey?
              </p>
            )}
            {questType === "total" && (
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Calculate the <span className="font-bold text-emerald-600">Total votes</span> recorded across all snack bars combined:
              </p>
            )}
            {questType === "mean" && (
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                If the kids shared all snacks evenly, what would be the <span className="font-bold text-emerald-600">Mean Average (Fair Share)</span> of fruits?
              </p>
            )}

            {/* Answer buttons - Grid of buttons */}
            <div className="grid grid-cols-2 gap-3">
              {multipleChoices.map((choice) => {
                const isSelected = selectedUserChoice === choice;
                const isCorrectChoice = choice === correctChoice;
                
                let btnStyle = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";
                if (isSelected) {
                  if (questSolved) {
                    btnStyle = "bg-emerald-500 text-white border-emerald-600";
                  } else {
                    btnStyle = "bg-rose-500 text-white border-rose-600";
                  }
                }

                return (
                  <button
                    key={choice}
                    disabled={questSolved && selectedUserChoice !== choice}
                    onClick={() => handleSelectChoice(choice)}
                    className={`px-4 py-3 text-xs md:text-sm font-bold rounded-xl border-2 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${btnStyle}`}
                  >
                    {questSolved && isCorrectChoice && <Check className="w-4 h-4 text-white" />}
                    {choice}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback banner */}
          <div className="space-y-2">
            {questSolved && (
              <button
                onClick={generateNewQuest}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md transform hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                Let's inspect next Dataset! 📊
              </button>
            )}

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
                <div className="font-bold flex items-center gap-1.5 mb-0.5">
                  {feedback.isCorrect ? "⭐ Correct!" : "🤔 Think again!"}
                </div>
                {feedback.text}
              </motion.div>
            )}
          </div>
        </div>

      </div>

      {/* Helpful data math summary table */}
      <div className="bg-slate-50/80 p-4 border border-slate-200 rounded-2xl text-xs text-slate-500 select-text">
        <h5 className="font-semibold text-slate-800 uppercase tracking-wider text-[10px] mb-2">Live Statistics Report 📊</h5>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white p-2 rounded-lg border border-slate-250">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Total Votes</span>
            <span className="font-mono text-sm font-bold text-indigo-600">{stats.total}</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-250">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Mean Average</span>
            <span className="font-mono text-sm font-bold text-indigo-600">{stats.mean}</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-250">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Mode Category</span>
            <span className="font-mono text-xs font-bold text-indigo-600 truncate">{stats.mode.split(" ")[1]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
