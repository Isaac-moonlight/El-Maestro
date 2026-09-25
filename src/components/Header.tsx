import React, { useState, useRef } from 'react';
import { ShoppingBag, Bell, UtensilsCrossed, Check, ChevronDown, Clock } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';

export const Header: React.FC = () => {
  const {
    currentTable,
    setCurrentTable,
    cartCount,
    cartSubtotal,
    setIsCartOpen,
    setIsWaiterModalOpen,
    currentView,
    setCurrentView,
    activeOrder,
  } = useRestaurant();

  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const clickCountRef = useRef<number>(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const availableTables = Array.from({ length: 24 }, (_, i) => `Table ${i + 1}`);

  // Hidden 3-clicks logo trigger for Kitchen/Service console
  const handleLogoClick = () => {
    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      setCurrentView('kitchen');
      return;
    }

    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
      if (currentView !== 'menu') {
        setCurrentView('menu');
      }
    }, 600);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#101013]/95 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-6 py-3.5 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Restaurant Brand (Triple-click secret staff trigger) */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-3 text-left group focus:outline-none select-none"
            title="Restaurant El Maestro"
            aria-label="Accueil El Maestro (Triple-clic accès réservé cuisine)"
          >
            <div className="w-9 h-9 bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0 group-hover:border-[#d4af37] transition-colors">
              <UtensilsCrossed className="w-5 h-5 text-[#d4af37]" />
            </div>
            <div>
              <span className="font-serif-display text-lg sm:text-xl font-bold tracking-wider text-white block leading-tight">
                EL MAESTRO
              </span>
              <span className="text-xs text-zinc-400 tracking-widest uppercase font-semibold">
                Abomey-Calavi · Restaurant
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean architectural typography, no pill shapes) */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setCurrentView('menu')}
            className={`px-3 py-1.5 text-sm sm:text-base transition-colors ${
              currentView === 'menu'
                ? 'text-[#d4af37] font-bold border-b-2 border-[#d4af37]'
                : 'text-zinc-300 hover:text-white border-b-2 border-transparent'
            }`}
          >
            Menu
          </button>

          <button
            onClick={() => setCurrentView('tracking')}
            className={`px-3 py-1.5 text-sm sm:text-base transition-colors flex items-center gap-2 ${
              currentView === 'tracking'
                ? 'text-[#d4af37] font-bold border-b-2 border-[#d4af37]'
                : 'text-zinc-300 hover:text-white border-b-2 border-transparent'
            }`}
          >
            <Clock className="w-4 h-4 text-zinc-400" />
            <span>Suivi</span>
            {activeOrder && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </nav>

        {/* Zone 3: Waiter Call, Table Selector & Cart */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Subtle Call Waiter Button */}
          <button
            onClick={() => setIsWaiterModalOpen(true)}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-colors"
            title="Appeler un serveur à table"
            aria-label="Appeler un serveur"
          >
            <Bell className="w-4 h-4 text-[#d4af37]" />
          </button>

          {/* Table Selector */}
          <div className="relative">
            <button
              onClick={() => setIsTableDropdownOpen(!isTableDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold text-zinc-100 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-all whitespace-nowrap"
              title="Changer de table"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{currentTable}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {isTableDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsTableDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-48 max-h-64 overflow-y-auto bg-zinc-900 border border-zinc-700 shadow-2xl p-1 z-50">
                  <div className="px-3 py-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                    Sélectionner votre table
                  </div>
                  {availableTables.map(tbl => (
                    <button
                      key={tbl}
                      onClick={() => {
                        setCurrentTable(tbl);
                        setIsTableDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                        currentTable === tbl
                          ? 'bg-zinc-800 text-white font-bold'
                          : 'text-zinc-300 hover:bg-zinc-800/60'
                      }`}
                    >
                      <span>{tbl}</span>
                      {currentTable === tbl && <Check className="w-4 h-4 text-[#d4af37]" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold text-zinc-950 bg-[#d4af37] hover:bg-[#e2c15c] transition-all shadow active:scale-95 border border-amber-600/40"
            aria-label="Panier"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            <span className="tabular-nums font-mono">
              {cartCount > 0 ? (
                <span>{cartCount} · {cartSubtotal.toLocaleString()} F</span>
              ) : (
                <span className="font-sans font-bold">Panier</span>
              )}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
