import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Award, Grid, Compass, LayoutGrid, ShoppingBag, Trophy, ArrowRight, User, HelpCircle, BookOpen } from "lucide-react";
import MascotBarnaby from "./components/MascotBarnaby";
import FractionQuest from "./components/FractionQuest";
import CoordinateQuest from "./components/CoordinateQuest";
import VolumeQuest from "./components/VolumeQuest";
import DataQuest from "./components/DataQuest";
import MascotStore from "./components/MascotStore";
import ReviewQuiz from "./components/ReviewQuiz";
import DailyMathChallenge from "./components/DailyMathChallenge";
import { BADGES, LESSONS } from "./data";

export default function App() {
  // Navigation active screen
  const [activeScreen, setActiveScreen] = useState<"home" | "topics" | "quiz" | "store" | "progress">("home");
  
  // Game state
  const [stars, setStars] = useState<number>(20); // We provide 20 starter stars so kids can trial dress-up right away!
  const [unlockedAccessories, setUnlockedAccessories] = useState<string[]>([]);
  const [equippedAccessory, setEquippedAccessory] = useState<string | null>(null);

  // Active math topic inside lessons
  const [activeTopic, setActiveTopic] = useState<"fractions" | "coordinates" | "volume" | "data" | null>(null);

  // Barnaby Mascot conversation states
  const [barnabyMood, setBarnabyMood] = useState<"happy" | "thinking" | "resting" | "correct" | "incorrect">("resting");
  const [barnabyMessage, setBarnabyMessage] = useState<string>(
    "Hello explorer! Welcome to Math 5 IB. I'm Barnaby, your owl math guide. Choose one of our inquiry quests to start earning stars! 🪐"
  );

  // Stars earning reducer
  const handleEarnStars = (count: number) => {
    setStars((prev) => prev + count);
  };

  // Barnaby controller helper
  const handleSetBarnaby = (mood: "happy" | "thinking" | "resting" | "correct" | "incorrect", msg: string) => {
    setBarnabyMood(mood);
    setBarnabyMessage(msg);
  };

  // Buy item logic
  const handleBuyItem = (id: string, cost: number) => {
    setStars((prev) => prev - cost);
    setUnlockedAccessories((prev) => [...prev, id]);
    setEquippedAccessory(id);
    handleSetBarnaby("happy", `Aha! You got me a stunning accessory! How does this look on me? I feel 150% smarter! 🦉✨`);
  };

  const handleEquipItem = (id: string | null) => {
    setEquippedAccessory(id);
    if (id) {
      handleSetBarnaby("happy", "Style update! Ready for some math quests now!");
    } else {
      handleSetBarnaby("resting", "Back to natural plumage! Ready to study, regardless.");
    }
  };

  // Greeting based on time of day
  const getGreetingText = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning, Math Scout! 🦉";
    if (hours < 17) return "Good Afternoon, Math Scout! ☀️";
    return "Good Evening, Math Scout! 🌙";
  };

  // Sync state to local storage so progress feels permanent
  useEffect(() => {
    const savedStars = localStorage.getItem("math5ib_stars");
    if (savedStars !== null) {
      setStars(parseInt(savedStars, 10));
    }
    const savedUnlocked = localStorage.getItem("math5ib_unlocked");
    if (savedUnlocked) {
      setUnlockedAccessories(JSON.parse(savedUnlocked));
    }
    const savedEquipped = localStorage.getItem("math5ib_equipped");
    if (savedEquipped !== undefined) {
      setEquippedAccessory(savedEquipped);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("math5ib_stars", String(stars));
    localStorage.setItem("math5ib_unlocked", JSON.stringify(unlockedAccessories));
    localStorage.setItem("math5ib_equipped", equippedAccessory || "");
  }, [stars, unlockedAccessories, equippedAccessory]);

  return (
    <div className="min-h-screen bg-[#F0F9FF] text-slate-800 pb-12 flex flex-col font-sans select-none antialiased">
      {/* Dynamic Header navbar */}
      <nav className="bg-white border-b border-indigo-100 shadow-sm sticky top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveScreen("home"); setActiveTopic(null); }}>
            <span className="text-4xl hover:scale-110 transition-transform">🦉</span>
            <div>
              <h1 className="text-2xl font-black text-indigo-600 tracking-tight leading-none">Math 5 IB</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Grade 5 PYP • Ages 10-11</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => { setActiveScreen("home"); setActiveTopic(null); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeScreen === "home"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Dashboard
            </button>
            <button
              onClick={() => { setActiveScreen("topics"); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeScreen === "topics"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Math Quests
            </button>
            <button
              onClick={() => { setActiveScreen("quiz"); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeScreen === "quiz"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> Interactive Quiz
            </button>
            <button
              onClick={() => { setActiveScreen("store"); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeScreen === "store"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Accessory Store
            </button>
            <button
              onClick={() => { setActiveScreen("progress"); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeScreen === "progress"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" /> Badges
            </button>
          </div>

          {/* Stars tally component */}
          <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 py-1.5 px-3.5 rounded-full shadow-sm text-sm font-black text-amber-700">
            <Star className="w-4 h-4 fill-amber-500 stroke-amber-600 animate-spin-slow" />
            <span>{stars} Stars</span>
          </div>
        </div>
      </nav>

      {/* Main Container Workspace */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 pt-6 space-y-6">
        
        {/* Floating Barnaby the Mascot widget (Persistent across all views so kids feel accompanied) */}
        <MascotBarnaby mood={barnabyMood} message={barnabyMessage} equippedAccessory={equippedAccessory} />

        {/* Dynamic active screen render */}
        <AnimatePresence mode="wait">
          {activeScreen === "home" && (
            <motion.div
              key="screen-home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Welcomer Greeting */}
              <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <h2 className="text-2xl font-extrabold text-indigo-950">{getGreetingText()}</h2>
                  <p className="text-sm text-slate-500 font-medium">Ready to take on your Grade 5 Primary Years Programme inquiry math quests?</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => setActiveScreen("topics")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-md transform hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    Start Math Challenge <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveScreen("quiz")}
                    className="bg-white hover:bg-slate-50 text-indigo-650 font-bold text-xs px-5 py-3 rounded-2xl shadow-sm border border-indigo-200 transform hover:-translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-indigo-600" /> Interactive Quiz
                  </button>
                </div>
              </div>

              {/* Daily Math Challenge Box */}
              <DailyMathChallenge
                onEarnStars={handleEarnStars}
                onSetBarnaby={handleSetBarnaby}
              />

              {/* BENTO GRID OF 4 MATH TOPICS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Topic 1: Fractions & Decimals */}
                <div
                  onClick={() => { setActiveScreen("topics"); setActiveTopic("fractions"); }}
                  className="bg-white hover:bg-amber-50/20 rounded-3xl p-5 border border-amber-100 shadow-sm cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-4xl bg-amber-100 p-2.5 rounded-2xl block">🍰</span>
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded">Strand: Numbers</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-800 font-sans group-hover:text-amber-600 transition-colors">Fraction Slices & Decimals</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Divide a pizza pie into equivalent sectors, shade ratios, and discover the magical decimal values of fraction slices.
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mt-4 pt-4 border-t border-slate-100 uppercase">
                    Launch Slices Quest <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Topic 2: Coordinates plane */}
                <div
                  onClick={() => { setActiveScreen("topics"); setActiveTopic("coordinates"); }}
                  className="bg-white hover:bg-cyan-50/20 rounded-3xl p-5 border border-cyan-100 shadow-sm cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-4xl bg-cyan-100 p-2.5 rounded-2xl block">🎯</span>
                    <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest bg-cyan-50 px-2 py-1 rounded">Strand: Shape & Space</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-800 font-sans group-hover:text-cyan-600 transition-colors">Coordinates Plane Treasure</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Plot anchor pins in 4 quadrants, read hidden key coordinates, and pilot a spaceship around our star catcher grid.
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 mt-4 pt-4 border-t border-slate-100 uppercase">
                    Plot Coordinates Map <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform animate-none" />
                  </div>
                </div>

                {/* Topic 3: Volume capacity */}
                <div
                  onClick={() => { setActiveScreen("topics"); setActiveTopic("volume"); }}
                  className="bg-white hover:bg-indigo-50/20 rounded-3xl p-5 border border-indigo-100 shadow-sm cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-4xl bg-indigo-100 p-2.5 rounded-2xl block">🧊</span>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">Strand: Measurement</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-800 font-sans group-hover:text-indigo-600 transition-colors">Volume Architect 3D</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Adjust high-fidelity 3D sliders to build transparent cube models and verify capacity equations with custom volume factors.
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mt-4 pt-4 border-t border-slate-100 uppercase">
                    Construct Volume Prisms <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Topic 4: Statistics */}
                <div
                  onClick={() => { setActiveScreen("topics"); setActiveTopic("data"); }}
                  className="bg-white hover:bg-emerald-50/20 rounded-3xl p-5 border border-emerald-100 shadow-sm cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-4xl bg-emerald-100 p-2.5 rounded-2xl block">📊</span>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">Strand: Data Handling</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-800 font-sans group-hover:text-emerald-600 transition-colors">Statistical Graph Explorer</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Drag bar graph heights to analyze snack schedules and solve totals, most popular modes, and fair share averages.
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mt-4 pt-4 border-t border-slate-100 uppercase">
                    Explore Statistical Graphs <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

              </div>

              {/* Informative PYP Learner Profile attribution line */}
              <div className="bg-slate-100 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left select-text">
                <div className="bg-indigo-100 p-2 rounded-xl text-lg text-indigo-700">🎓</div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm text-slate-900 leading-none">IB Primary Years Programme Learner Profile</h4>
                  <p className="text-slate-500 text-xs">
                    This unit supports the **Inquirer** and **Knowledgeable** profiles, guiding students to mathematically think about coordinate models, fractional dimensions, and logical averages.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeScreen === "topics" && (
            <motion.div
              key="screen-topics"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Back Tab bar if a topic is active */}
              {activeTopic ? (
                <div className="space-y-6">
                  {/* Back button row */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setActiveTopic(null);
                        handleSetBarnaby("resting", "Choose another math topic from our PYP list! You're doing splendidly.");
                      }}
                      className="px-4 py-2 bg-white hover:bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      ← Back to Quest Categories
                    </button>
                    <span className="text-slate-300 text-xl font-light">/</span>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded">
                      Inquiry Active
                    </span>
                  </div>

                  {/* Dynamic Concept breakdown lesson review card */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{LESSONS[activeTopic].emoji}</span>
                      <h3 className="text-lg font-extrabold text-slate-900">{LESSONS[activeTopic].title} - Concept</h3>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed italic border-l-4 border-indigo-400 pl-4 bg-slate-50 py-3 rounded-r-xl">
                      {LESSONS[activeTopic].concept}
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Key inquiry findings:</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {LESSONS[activeTopic].points.map((pt, index) => (
                          <li key={index} className="bg-indigo-50/45 p-3 rounded-xl border border-indigo-150/50 text-xs leading-normal font-medium text-slate-700">
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Mounted exercise */}
                  {activeTopic === "fractions" && (
                    <FractionQuest onEarnStars={handleEarnStars} onSetBarnabyMood={handleSetBarnaby} />
                  )}
                  {activeTopic === "coordinates" && (
                    <CoordinateQuest onEarnStars={handleEarnStars} onSetBarnabyMood={handleSetBarnaby} />
                  )}
                  {activeTopic === "volume" && (
                    <VolumeQuest onEarnStars={handleEarnStars} onSetBarnabyMood={handleSetBarnaby} />
                  )}
                  {activeTopic === "data" && (
                    <DataQuest onEarnStars={handleEarnStars} onSetBarnabyMood={handleSetBarnaby} />
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Category selectors list */}
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-indigo-950">Active Grade 5 Math Quests</h2>
                    <p className="text-xs text-slate-400">Select any module box below to read mathematical theories and try puzzle practices.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Slices widget select */}
                    <div
                      onClick={() => {
                        setActiveTopic("fractions");
                        handleSetBarnaby("thinking", "Let's explore fractions and decimals with juicy pizza slices! 🍕 Click to begin!");
                      }}
                      className="bg-white hover:border-amber-400 p-5 rounded-3xl border-2 border-slate-100 transition-all cursor-pointer flex gap-4 items-start shadow-sm hover:shadow-md"
                    >
                      <span className="text-4xl bg-amber-50 p-2.5 rounded-2xl block">🍰</span>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-800 text-sm">🍰 Fraction Slices & Decimals</h4>
                        <p className="text-xs text-slate-500 leading-normal">
                          Inquire about circles segmentation, equivalent slice structures, and decimals translation.
                        </p>
                      </div>
                    </div>

                    {/* Coordinates plane select */}
                    <div
                      onClick={() => {
                        setActiveTopic("coordinates");
                        handleSetBarnaby("thinking", "Ahoy! Let's plot quadrant flags and capture glowing stars on our coordinate grid plane! 🧭 Start plotting!");
                      }}
                      className="bg-white hover:border-cyan-400 p-5 rounded-3xl border-2 border-slate-100 transition-all cursor-pointer flex gap-4 items-start shadow-sm hover:shadow-md"
                    >
                      <span className="text-4xl bg-cyan-50 p-2.5 rounded-2xl block">🎯</span>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-800 text-sm">🎯 Coordinate Plane Journeys</h4>
                        <p className="text-xs text-slate-500 leading-normal">
                          Read 2D map key coordinates across 4 positive/negative axes grids.
                        </p>
                      </div>
                    </div>

                    {/* Volume widget select */}
                    <div
                      onClick={() => {
                        setActiveTopic("volume");
                        handleSetBarnaby("thinking", "Let's stack transparent 3D cubes, alter length metrics, and count rectangular volume equations! 🧊 Construct now!");
                      }}
                      className="bg-white hover:border-indigo-400 p-5 rounded-3xl border-2 border-slate-100 transition-all cursor-pointer flex gap-4 items-start shadow-sm hover:shadow-md"
                    >
                      <span className="text-4xl bg-indigo-50 p-2.5 rounded-2xl block">🧊</span>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-800 text-sm">🧊 Volume Architect 3D</h4>
                        <p className="text-xs text-slate-500 leading-normal">
                          Slide length, width, and height factors to visually confirm cubes counts equations.
                        </p>
                      </div>
                    </div>

                    {/* Statistics widget select */}
                    <div
                      onClick={() => {
                        setActiveTopic("data");
                        handleSetBarnaby("thinking", "Let's drag bar graph heights and learn statistical totals, modes, and mean fair shares! 📊 Start survey!");
                      }}
                      className="bg-white hover:border-emerald-400 p-5 rounded-3xl border-2 border-slate-100 transition-all cursor-pointer flex gap-4 items-start shadow-sm hover:shadow-md"
                    >
                      <span className="text-4xl bg-emerald-50 p-2.5 rounded-2xl block">📊</span>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-800 text-sm">📊 Statistical Graphs</h4>
                        <p className="text-xs text-slate-500 leading-normal">
                          Manipulate survey heights to count totals, most popular modes, and fair share averages.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeScreen === "quiz" && (
            <motion.div
              key="screen-quiz"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <ReviewQuiz
                onEarnStars={handleEarnStars}
                onSetBarnaby={handleSetBarnaby}
              />
            </motion.div>
          )}

          {activeScreen === "store" && (
            <motion.div
              key="screen-store"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <MascotStore
                stars={stars}
                unlockedList={unlockedAccessories}
                equippedId={equippedAccessory}
                onBuyItem={handleBuyItem}
                onEquipItem={handleEquipItem}
              />
            </motion.div>
          )}

          {activeScreen === "progress" && (
            <motion.div
              key="screen-progress"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Profile Card summary */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between select-text">
                <div className="flex items-center gap-4 flex-col sm:flex-row text-center sm:text-left">
                  <div className="relative w-20 h-20 bg-indigo-50 rounded-full border-2 border-indigo-200 flex items-center justify-center text-4xl shadow-inner flex-shrink-0 font-bold">
                    🎓
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Grade 5 math Explorer</h2>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Acquired Score: {stars} stars</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      Unlocked attachments: {unlockedAccessories.length} / 6 accessories. Ready to learn more!
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-3">
                  <Award className="w-8 h-8 text-amber-500" />
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Current rank:</span>
                    <span className="font-extrabold text-slate-800 text-sm">
                      {stars >= 80 ? "🏆 PYP Math Sovereignty" : stars >= 60 ? "🌟 Data Handling Maven" : stars >= 45 ? "🧊 3D space builder" : stars >= 25 ? "🎯 Grid Specialist" : stars >= 10 ? "🍰 Fraction Captain" : "🐣 Active Math Novice"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Badges row list */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="space-y-0.5 flex items-center gap-2">
                  <Award className="w-6 h-6 text-indigo-500" />
                  <div>
                    <h3 className="font-bold text-slate-900">PYP Achievement Badges</h3>
                    <p className="text-xs text-slate-500 leading-none">Earn stars by completing mathematical quests. Clear stars levels to auto-unlock badges!</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  {BADGES.map((badge) => {
                    const isUnlocked = stars >= badge.unlockedAtStars;
                    const percent = Math.min(100, Math.floor((stars / badge.unlockedAtStars) * 100));

                    return (
                      <div
                        key={badge.id}
                        className={`p-4 rounded-2xl border-2 flex flex-col justify-between h-40 ${
                          isUnlocked
                            ? "bg-amber-50/20 border-amber-200"
                            : "bg-slate-50/45 border-slate-100 opacity-65"
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${
                            isUnlocked ? "bg-amber-100" : "bg-slate-200"
                          }`}>
                            {badge.emoji}
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-slate-800 text-xs">{badge.name}</h4>
                            <p className="text-[10px] text-slate-500 leading-normal">{badge.description}</p>
                          </div>
                        </div>

                        {/* Progress Bar meter */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500">
                            <span>{percent}% cleared</span>
                            <span>Target: {badge.unlockedAtStars} Stars</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              style={{ width: `${percent}%` }}
                              className={`h-full transition-all duration-300 ${
                                isUnlocked ? "bg-amber-400" : "bg-indigo-500"
                              }`}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Responsive footer */}
      <footer className="mt-12 text-center text-xs text-slate-400 max-w-lg mx-auto leading-normal">
        <p>© 2026 Math 5 IB Learning Quest. All Rights Reserved.</p>
        <p className="mt-1">Designed with PYP Primary Years Programme guidelines for Grade 5 mathematics curriculum support.</p>
      </footer>
    </div>
  );
}
