import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { MenuItem, MenuVariant } from '../types/restaurant';
import { useRestaurant } from '../context/RestaurantContext';

interface DishDetailModalProps {
  dish: MenuItem | null;
  onClose: () => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({ dish, onClose }) => {
  const { addToCart, currentTable } = useRestaurant();

  const [selectedVariant, setSelectedVariant] = useState<MenuVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (dish) {
      if (dish.variants && dish.variants.length > 0) {
        setSelectedVariant(dish.variants[0]);
      } else {
        setSelectedVariant(null);
      }
      setSelectedOptions([]);
      setQuantity(1);
      setInstructions('');
    }
  }, [dish]);

  if (!dish) return null;

  const baseUnitPrice = selectedVariant ? selectedVariant.price : dish.basePrice;

  const optionsPrice = (dish.availableOptions || [])
    .filter(opt => selectedOptions.includes(opt.name))
    .reduce((acc, opt) => acc + opt.price, 0);

  const singleItemTotal = baseUnitPrice + optionsPrice;
  const grandTotal = singleItemTotal * quantity;

  const toggleOption = (optName: string) => {
    setSelectedOptions(prev =>
      prev.includes(optName) ? prev.filter(o => o !== optName) : [...prev, optName]
    );
  };

  const handleAddToCart = () => {
    addToCart({
      menuItemId: dish.id,
      name: dish.name,
      variantName: selectedVariant?.name,
      unitPrice: baseUnitPrice,
      quantity,
      selectedOptions: selectedOptions.length > 0 ? selectedOptions : undefined,
      optionsPrice,
      specialInstructions: instructions.trim() ? instructions.trim() : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-zinc-900 border border-zinc-700 shadow-2xl z-10 flex flex-col text-zinc-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center border border-zinc-700 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dish Image */}
        {dish.image && (
          <div className="relative w-full h-56 sm:h-64 bg-zinc-950 overflow-hidden shrink-0 border-b border-zinc-800">
            <img
              src={dish.image}
              alt={dish.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-70" />
          </div>
        )}

        <div className="p-5 sm:p-7">
          <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">
            {dish.name}
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-4">
            {dish.description}
          </p>

          {dish.ingredients && dish.ingredients.length > 0 && (
            <div className="mb-5 p-3 bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-300">
              <span className="font-bold text-white mr-2">Composition :</span>
              <span>{dish.ingredients.join(', ')}</span>
            </div>
          )}

          {/* Variants Selector */}
          {dish.variants && dish.variants.length > 0 && (
            <div className="mb-5">
              <label className="text-sm font-bold text-zinc-200 uppercase tracking-wider block mb-2.5">
                Format disponible :
              </label>
              <div className="grid grid-cols-2 gap-3">
                {dish.variants.map(variant => (
                  <button
                    key={variant.name}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    className={`p-3.5 border text-left flex items-center justify-between transition-colors ${
                      selectedVariant?.name === variant.name
                        ? 'bg-zinc-800 border-[#d4af37] text-white shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <div>
                      <span className="block text-sm font-bold text-white">
                        {variant.name}
                      </span>
                      <span className="font-mono text-sm text-[#d4af37] font-semibold tabular-nums">
                        {variant.price.toLocaleString()} FCFA
                      </span>
                    </div>
                    {selectedVariant?.name === variant.name && (
                      <div className="w-5 h-5 bg-[#d4af37] text-zinc-950 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Options & Supplements */}
          {dish.availableOptions && dish.availableOptions.length > 0 && (
            <div className="mb-5">
              <label className="text-sm font-bold text-zinc-200 uppercase tracking-wider block mb-2.5">
                Suppléments au choix :
              </label>
              <div className="space-y-2">
                {dish.availableOptions.map(opt => {
                  const isChecked = selectedOptions.includes(opt.name);
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => toggleOption(opt.name)}
                      className={`w-full p-3 border text-left flex items-center justify-between transition-colors ${
                        isChecked
                          ? 'bg-zinc-800 border-zinc-500 text-white'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 flex items-center justify-center border ${
                            isChecked
                              ? 'bg-[#d4af37] border-[#d4af37] text-zinc-950'
                              : 'border-zinc-600 bg-zinc-900'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-sm font-medium text-zinc-200">{opt.name}</span>
                      </div>
                      <span className="font-mono text-sm text-zinc-300 font-semibold tabular-nums">
                        +{opt.price.toLocaleString()} FCFA
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special instructions */}
          <div className="mb-6">
            <label className="text-sm font-bold text-zinc-200 uppercase tracking-wider block mb-1.5">
              Demande particulière pour le chef :
            </label>
            <input
              type="text"
              placeholder="Ex: sans oignon, bien cuit, sauce à part..."
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 flex items-center justify-center transition-colors"
                aria-label="Moins"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-mono text-base font-bold text-white tabular-nums px-2">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 flex items-center justify-center transition-colors"
                aria-label="Plus"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 py-3 px-5 bg-[#d4af37] hover:bg-[#e2c15c] text-zinc-950 font-bold text-sm sm:text-base shadow transition-all flex items-center justify-between active:scale-98 border border-amber-600/40"
            >
              <span>Ajouter à la commande ({currentTable})</span>
              <span className="font-mono font-bold tabular-nums">
                {grandTotal.toLocaleString()} FCFA
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
