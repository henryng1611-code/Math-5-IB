import React from "react";
import { motion } from "motion/react";
import { ShoppingBag, Star, Check, Sparkles, UserCheck } from "lucide-react";
import { ACCESSORIES } from "../data";
import { Accessory } from "../types";
import confetti from "canvas-confetti";

interface MascotStoreProps {
  stars: number;
  unlockedList: string[];
  equippedId: string | null;
  onBuyItem: (id: string, cost: number) => void;
  onEquipItem: (id: string | null) => void;
}

export default function MascotStore({
  stars,
  unlockedList,
  equippedId,
  onBuyItem,
  onEquipItem,
}: MascotStoreProps) {
  
  const handlePurchase = (item: Accessory) => {
    if (stars < item.cost) return;
    onBuyItem(item.id, item.cost);
    confetti({
      particleCount: 60,
      spread: 50,
      colors: ["#fbbf24", "#34d399", "#60a5fa"],
      origin: { y: 0.8 },
    });
  };

  return (
    <div id="mascot-store" className="bg-white rounded-3xl p-6 shadow-md border border-amber-100 flex flex-col gap-6">
      
      {/* Shop Header banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-100/60">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2.5 rounded-xl text-2xl">🛍️</div>
          <div>
            <h2 className="text-xl font-bold text-amber-800">Barnaby's Accessory Cabin</h2>
            <p className="text-xs text-slate-500">Dress your owl math guide with stars earned from correct answers!</p>
          </div>
        </div>

        {/* Live wallet */}
        <div className="flex items-center gap-2 bg-amber-500 text-white font-black px-4 py-2 rounded-2xl shadow-sm text-base">
          <Star className="w-5 h-5 fill-current animate-spin-slow text-amber-100" />
          <span>{stars} Stars</span>
        </div>
      </div>

      {/* Grid of shopping attachments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACCESSORIES.map((item) => {
          const isUnlocked = unlockedList.includes(item.id);
          const isEquipped = equippedId === item.id;
          const canAfford = stars >= item.cost;

          return (
            <div
              key={item.id}
              className={`relative rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
                isEquipped
                  ? "border-emerald-500 bg-emerald-50/20 shadow-md"
                  : isUnlocked
                  ? "border-slate-200 bg-white hover:border-slate-300"
                  : "border-slate-100 bg-slate-50/50"
              }`}
            >
              {/* Corner status flag */}
              {isEquipped && (
                <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full text-[10px] shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              {/* Emoji illustration */}
              <div className="flex gap-4 items-start">
                <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
                  {item.emoji}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                  <span className="text-[10px] text-slate-400 capitalize bg-slate-200/55 px-1.5 py-0.5 rounded-full font-bold">
                    {item.category}
                  </span>
                  <p className="text-xs text-slate-500 leading-snug mt-1.5">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Bottom control row */}
              <div className="flex items-center justify-between border-t border-slate-100 mt-4 pt-3.5">
                {/* Cost Label */}
                {!isUnlocked ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                    <Star className="w-4 h-4 fill-current text-amber-500" />
                    <span className="font-mono text-sm leading-none">{item.cost} Stars</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">
                    <Sparkles className="w-3.5 h-3.5" /> Unlocked!
                  </div>
                )}

                {/* Purchase buttons */}
                {!isUnlocked ? (
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={!canAfford}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-transform duration-200 ${
                      canAfford
                        ? "bg-amber-500 hover:bg-amber-600 text-white hover:-translate-y-0.5"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Buy Accessory
                  </button>
                ) : (
                  <div className="flex gap-1.5">
                    {/* Equip button toggle */}
                    {isEquipped ? (
                      <button
                        onClick={() => onEquipItem(null)}
                        className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs text-slate-600 font-bold transition-all cursor-pointer"
                      >
                        Take Off
                      </button>
                    ) : (
                      <button
                        onClick={() => onEquipItem(item.id)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-650 text-white rounded-xl text-xs font-bold shadow-sm hover:-translate-y-0.5 transition-transform cursor-pointer"
                      >
                        Equip Layer
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
    </div>
  );
}
