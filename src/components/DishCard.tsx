import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { MenuItem } from '../types/restaurant';
import { useRestaurant } from '../context/RestaurantContext';

interface DishCardProps {
  item: MenuItem;
  onSelectDish: (dish: MenuItem) => void;
}

export const DishCard: React.FC<DishCardProps> = ({ item, onSelectDish }) => {
  const { cart, addToCart, updateQuantity } = useRestaurant();

  const inCartItems = cart.filter(c => c.menuItemId === item.id);
  const totalInCart = inCartItems.reduce((acc, c) => acc + c.quantity, 0);

  const hasMultipleOptions =
    (item.variants && item.variants.length > 0) ||
    (item.availableOptions && item.availableOptions.length > 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasMultipleOptions) {
      onSelectDish(item);
    } else {
      addToCart({
        menuItemId: item.id,
        name: item.name,
        unitPrice: item.basePrice,
        quantity: 1,
        optionsPrice: 0,
      });
    }
  };

  const handleQuickIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCartItems.length === 1) {
      updateQuantity(inCartItems[0].cartItemId, 1);
    } else {
      onSelectDish(item);
    }
  };

  const handleQuickDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCartItems.length === 1) {
      updateQuantity(inCartItems[0].cartItemId, -1);
    } else {
      onSelectDish(item);
    }
  };

  return (
    <article
      onClick={() => onSelectDish(item)}
      className="group bg-zinc-900/70 hover:bg-zinc-850/90 border border-zinc-800 hover:border-zinc-600 transition-all duration-200 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Photo Container - Clean crisp framing with no bubble corners */}
        <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden border-b border-zinc-800/80">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-400 text-sm font-serif-display">
              El Maestro
            </div>
          )}

          {/* Clean unboxed editorial labels (no candy pill badges) */}
          {(item.isHouseSpecial || item.isSpicy || item.isVegetarian) && (
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 pointer-events-none">
              {item.isHouseSpecial && (
                <span className="px-2 py-1 text-xs font-semibold uppercase tracking-wider bg-black/85 text-[#d4af37] border-l-2 border-[#d4af37]">
                  Spécialité Maison
                </span>
              )}
              {item.isSpicy && (
                <span className="px-2 py-1 text-xs font-semibold uppercase tracking-wider bg-black/85 text-rose-300 border-l-2 border-rose-500">
                  Pimenté
                </span>
              )}
              {item.isVegetarian && (
                <span className="px-2 py-1 text-xs font-semibold uppercase tracking-wider bg-black/85 text-emerald-300 border-l-2 border-emerald-500">
                  Végétarien
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card Body - Generous & readable text */}
        <div className="p-4 sm:p-5">
          <h3 className="font-serif-display text-base sm:text-lg font-bold text-zinc-100 group-hover:text-[#d4af37] transition-colors leading-snug mb-1.5">
            {item.name}
          </h3>

          <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>

          {item.ingredients && item.ingredients.length > 0 && (
            <p className="text-xs text-zinc-400 line-clamp-1 border-t border-zinc-800/60 pt-2">
              <span className="text-zinc-500 font-medium">Composition :</span>{' '}
              {item.ingredients.slice(0, 4).join(', ')}
              {item.ingredients.length > 4 && '...'}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer: Straight line divider, clear price & bold action button */}
      <div className="px-4 pb-4 pt-3 flex items-center justify-between border-t border-zinc-800/80 bg-zinc-950/40">
        <div>
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-medium">
            {item.variants && item.variants.length > 0 ? 'À partir de' : 'Prix net'}
          </span>
          <span className="text-base sm:text-lg font-bold text-white font-mono tabular-nums">
            {item.basePrice.toLocaleString()}{' '}
            <span className="text-xs font-normal text-zinc-400">FCFA</span>
          </span>
        </div>

        {/* Quantity Controls or Add Button */}
        {totalInCart > 0 ? (
          <div
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 px-2 py-1.5"
          >
            <button
              onClick={handleQuickDecrement}
              className="w-6 h-6 bg-zinc-900 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition-colors active:scale-95"
              aria-label="Moins"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-sm font-bold text-white tabular-nums px-1.5">
              {totalInCart}
            </span>
            <button
              onClick={handleQuickIncrement}
              className="w-6 h-6 bg-[#d4af37] hover:bg-[#c5a880] text-zinc-950 flex items-center justify-center font-bold transition-colors active:scale-95"
              aria-label="Plus"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleQuickAdd}
            className="px-3.5 py-2 text-xs sm:text-sm font-bold text-zinc-950 bg-[#d4af37] hover:bg-[#e2c15c] active:scale-95 transition-all flex items-center gap-1.5 border border-amber-600/40 shadow-sm"
            aria-label={`Ajouter ${item.name}`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{hasMultipleOptions ? 'Choisir' : 'Ajouter'}</span>
          </button>
        )}
      </div>
    </article>
  );
};
