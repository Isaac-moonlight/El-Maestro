import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Send, ShoppingBag, Banknote, Smartphone, CreditCard, MessageSquare } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { PaymentMethod } from '../types/restaurant';
import { RESTAURANT_INFO } from '../data/menuData';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    cartSubtotal,
    currentTable,
    createOrder,
  } = useRestaurant();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_table');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCartOpen) return null;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      createOrder({
        customerName: customerName.trim() || `Client ${currentTable}`,
        customerPhone: customerPhone.trim() || undefined,
        notes: notes.trim() || undefined,
        paymentMethod,
        orderType: 'dine_in',
      });
      setIsSubmitting(false);
    }, 300);
  };

  const handleWhatsAppDirect = () => {
    if (cart.length === 0) return;

    const itemsSummary = cart
      .map(
        i =>
          `- ${i.quantity}x ${i.name} ${i.variantName ? `(${i.variantName})` : ''} : ${(
            i.totalPrice
          ).toLocaleString()} FCFA ${
            i.specialInstructions ? `[${i.specialInstructions}]` : ''
          }`
      )
      .join('\n');

    const paymentLabel =
      paymentMethod === 'cash_table'
        ? 'Au serveur à la table (Espèces)'
        : paymentMethod === 'mobile_money'
        ? 'Mobile Money (MTN / Moov)'
        : 'En caisse';

    const msg = `Bonjour El Maestro,\n\nCommande depuis la table : *${currentTable}*\nClient : ${
      customerName || 'Client'
    }\n\n*Articles :*\n${itemsSummary}\n\n*Total : ${cartSubtotal.toLocaleString()} FCFA*\nRèglement : ${paymentLabel}${
      notes ? `\nNote : ${notes}` : ''
    }`;

    const url = `https://wa.me/${RESTAURANT_INFO.phoneRaw}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-700 text-zinc-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
              <div>
                <h3 className="text-base sm:text-lg font-bold font-serif-display text-white">
                  Votre Commande
                </h3>
                <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                  {currentTable} · Service en salle
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs sm:text-sm text-zinc-400 hover:text-red-400 transition-colors uppercase tracking-wider px-2 py-1"
                >
                  Vider
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white flex items-center justify-center transition-colors border border-zinc-700"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-20 text-center text-zinc-400">
                <ShoppingBag className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-base font-serif-display font-bold text-zinc-200 mb-1">
                  Votre panier est vide
                </p>
                <p className="text-sm text-zinc-400 mb-6">
                  Sélectionnez vos plats sur la carte pour commander.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold transition-colors"
                >
                  Découvrir le menu
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div
                    key={item.cartItemId}
                    className="p-3.5 bg-zinc-950 border border-zinc-800 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-sm sm:text-base font-bold text-white block">
                          {item.name}
                        </span>
                        {item.variantName && (
                          <span className="text-xs text-[#d4af37] font-semibold block mt-0.5">
                            Format : {item.variantName}
                          </span>
                        )}
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <span className="text-xs text-zinc-400 block mt-0.5">
                            + {item.selectedOptions.join(', ')}
                          </span>
                        )}
                        {item.specialInstructions && (
                          <span className="text-xs text-amber-200/90 italic block mt-1">
                            Note : « {item.specialInstructions} »
                          </span>
                        )}
                      </div>

                      <span className="font-mono text-sm sm:text-base font-bold text-white tabular-nums shrink-0">
                        {item.totalPrice.toLocaleString()} FCFA
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-850">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                          className="w-6 h-6 bg-zinc-850 hover:bg-zinc-750 text-zinc-200 flex items-center justify-center transition-colors"
                          aria-label="Moins"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-sm font-bold text-white tabular-nums px-1.5">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                          className="w-6 h-6 bg-zinc-850 hover:bg-zinc-750 text-zinc-200 flex items-center justify-center transition-colors"
                          aria-label="Plus"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                        title="Supprimer cet article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Form fields */}
                <form onSubmit={handleSubmitOrder} className="pt-4 border-t border-zinc-800 space-y-3.5">
                  <div>
                    <label className="text-sm font-bold text-zinc-200 uppercase tracking-wider block mb-1">
                      Votre prénom ou nom :
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={`Client ${currentTable}`}
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-zinc-200 uppercase tracking-wider block mb-1">
                      Remarque pour la cuisine (facultatif) :
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: boissons fraîches d'abord, sauce piquante..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-zinc-200 uppercase tracking-wider block mb-2">
                      Règlement :
                    </label>
                    <div className="space-y-2">
                      <label
                        className={`p-3 border flex items-center gap-3 cursor-pointer transition-colors text-sm ${
                          paymentMethod === 'cash_table'
                            ? 'bg-zinc-800 border-zinc-500 text-white font-medium'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'cash_table'}
                          onChange={() => setPaymentMethod('cash_table')}
                          className="hidden"
                        />
                        <Banknote className="w-4 h-4 text-[#d4af37]" />
                        <span>Espèces au serveur à table</span>
                      </label>

                      <label
                        className={`p-3 border flex items-center gap-3 cursor-pointer transition-colors text-sm ${
                          paymentMethod === 'mobile_money'
                            ? 'bg-zinc-800 border-zinc-500 text-white font-medium'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'mobile_money'}
                          onChange={() => setPaymentMethod('mobile_money')}
                          className="hidden"
                        />
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <span>Mobile Money (MTN / Moov)</span>
                      </label>

                      <label
                        className={`p-3 border flex items-center gap-3 cursor-pointer transition-colors text-sm ${
                          paymentMethod === 'cashier'
                            ? 'bg-zinc-800 border-zinc-500 text-white font-medium'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'cashier'}
                          onChange={() => setPaymentMethod('cashier')}
                          className="hidden"
                        />
                        <CreditCard className="w-4 h-4 text-blue-400" />
                        <span>Paiement en caisse</span>
                      </label>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950 space-y-3">
              <div className="flex items-center justify-between text-sm sm:text-base">
                <span className="text-zinc-300 font-medium">
                  Total net ({cartCount} article{cartCount > 1 ? 's' : ''})
                </span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-white tabular-nums">
                  {cartSubtotal.toLocaleString()}{' '}
                  <span className="text-sm font-normal text-[#d4af37]">FCFA</span>
                </span>
              </div>

              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-[#d4af37] hover:bg-[#e2c15c] text-zinc-950 font-bold text-sm sm:text-base shadow transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 border border-amber-600/40"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Transmission en cuisine...'
                    : `Valider la commande (${currentTable})`}
                </span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppDirect}
                className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Envoyer directement par WhatsApp</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
