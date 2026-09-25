import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Check, UtensilsCrossed } from 'lucide-react';
import { MENU_ITEMS, CATEGORY_DEFINITIONS } from '../data/menuData';
import { ProductCategory, MenuItem } from '../types/restaurant';
import { DishCard } from './DishCard';
import { useRestaurant } from '../context/RestaurantContext';

interface MenuCatalogProps {
  onSelectDish: (dish: MenuItem) => void;
}

export const MenuCatalog: React.FC<MenuCatalogProps> = ({ onSelectDish }) => {
  const { currentTable, setCurrentTable } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('pizzas');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);

  const availableTables = Array.from({ length: 24 }, (_, i) => `Table ${i + 1}`);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return MENU_ITEMS.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchIngredients = item.ingredients?.some(ing => ing.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchIngredients) return false;
      }

      return true;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-7">
      {/* Table & Search Header: Crisp rectilinear bistro bar (no generic AI rounded-2xl) */}
      <div className="bg-zinc-900/80 border border-zinc-800 p-4 sm:p-5 mb-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-300">Votre table :</span>
          <div className="relative">
            <button
              onClick={() => setIsTableDropdownOpen(!isTableDropdownOpen)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-zinc-950 border border-zinc-700 hover:border-zinc-500 text-sm font-bold text-white transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{currentTable}</span>
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            </button>

            {isTableDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsTableDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-1 w-48 max-h-60 overflow-y-auto bg-zinc-900 border border-zinc-700 shadow-2xl p-1 z-50">
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
          <span className="text-xs text-zinc-400 hidden md:inline">
            · Service direct à table & bar
          </span>
        </div>

        {/* Clean Search Input with generous touch area */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Rechercher une pizza, grillade, burger..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-2 bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200 uppercase tracking-wider"
            >
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs: Editorial horizontal menu bar with classic underline & crisp styling */}
      <div className="border-b border-zinc-800 mb-7">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2.5 text-sm sm:text-base whitespace-nowrap transition-colors border-b-2 font-medium shrink-0 ${
              selectedCategory === 'all'
                ? 'border-[#d4af37] text-white font-bold bg-zinc-900/40'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
            }`}
          >
            Tous les plats
          </button>

          {CATEGORY_DEFINITIONS.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 text-sm sm:text-base whitespace-nowrap transition-colors border-b-2 font-medium shrink-0 ${
                  isSelected
                    ? 'border-[#d4af37] text-white font-bold bg-zinc-900/40'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dish Grid: Sharp, authentic bistro grid */}
      {filteredDishes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredDishes.map(dish => (
            <DishCard key={dish.id} item={dish} onSelectDish={onSelectDish} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-zinc-900/40 border border-zinc-800 max-w-md mx-auto">
          <UtensilsCrossed className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-base font-bold text-zinc-200 mb-1.5 font-serif-display">
            Aucun plat trouvé
          </p>
          <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
            Aucun mets ne correspond à votre recherche pour le moment.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold transition-colors"
          >
            Afficher toute la carte
          </button>
        </div>
      )}
    </div>
  );
};
