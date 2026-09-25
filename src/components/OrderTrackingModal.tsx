import React from 'react';
import { Clock, Bell, MessageSquare, ArrowLeft, UtensilsCrossed } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { RESTAURANT_INFO } from '../data/menuData';

export const OrderTrackingModal: React.FC = () => {
  const {
    activeOrder,
    orders,
    currentTable,
    setCurrentView,
    setIsWaiterModalOpen,
  } = useRestaurant();

  const tableOrders = orders.filter(
    o => o.tableNumber === currentTable || (activeOrder && o.id === activeOrder.id)
  );

  const displayOrder = activeOrder || tableOrders[0] || null;

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'preparing':
        return 2;
      case 'ready':
        return 3;
      case 'served':
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = displayOrder ? getStatusStep(displayOrder.status) : 0;

  const handleShareWhatsApp = (order: typeof displayOrder) => {
    if (!order) return;
    const itemsText = order.items
      .map(i => `- ${i.quantity}x ${i.name} ${i.variantName ? `(${i.variantName})` : ''} (${i.totalPrice.toLocaleString()} F)`)
      .join('\n');

    const msg = `Bonjour El Maestro,\n\nSuivi de ma commande : *${order.orderNumber}* (${order.tableNumber})\n\n${itemsText}\n\n*Total : ${order.totalAmount.toLocaleString()} FCFA*\nStatut : ${order.status}`;
    window.open(`https://wa.me/${RESTAURANT_INFO.phoneRaw}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => setCurrentView('menu')}
          className="flex items-center gap-2 text-sm font-bold text-zinc-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retourner à la carte</span>
        </button>

        <button
          onClick={() => setIsWaiterModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-sm font-bold text-white transition-colors"
        >
          <Bell className="w-4 h-4 text-[#d4af37]" />
          <span>Appeler le serveur</span>
        </button>
      </div>

      {!displayOrder ? (
        <div className="bg-zinc-900/40 border border-zinc-800 p-10 text-center max-w-md mx-auto">
          <UtensilsCrossed className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h2 className="text-lg font-serif-display font-bold text-white mb-2">
            Aucune commande active
          </h2>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            Vous n'avez pas de commande en cours pour la {currentTable}.
          </p>
          <button
            onClick={() => setCurrentView('menu')}
            className="px-5 py-2.5 bg-[#d4af37] text-zinc-950 font-bold text-sm transition-all border border-amber-600/40"
          >
            Consulter le menu et commander
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Tracking Card: Crisp rectilinear framing */}
          <div className="bg-zinc-900/80 border border-zinc-700 shadow-xl">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-sm font-mono font-bold text-[#d4af37] bg-zinc-900 px-2 py-0.5 border border-zinc-800">
                    #{displayOrder.orderNumber}
                  </span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-sm font-bold text-white uppercase tracking-wider">
                    {displayOrder.tableNumber}
                  </span>
                </div>
                <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-white">
                  {displayOrder.status === 'pending' && 'Commande reçue par la cuisine'}
                  {displayOrder.status === 'preparing' && 'En préparation au grill / four'}
                  {displayOrder.status === 'ready' && 'Plats prêts ! Service en cours'}
                  {displayOrder.status === 'served' && 'Commande servie à table'}
                  {displayOrder.status === 'cancelled' && 'Commande annulée'}
                </h2>
                <span className="text-xs sm:text-sm text-zinc-400 mt-1 block">
                  Client : <strong className="text-zinc-200">{displayOrder.customerName}</strong>
                </span>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-850">
                <span className="text-xs text-zinc-500 uppercase tracking-wider block font-bold">
                  Montant à régler
                </span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-white tabular-nums">
                  {displayOrder.totalAmount.toLocaleString()}{' '}
                  <span className="text-sm font-normal text-[#d4af37]">FCFA</span>
                </span>
              </div>
            </div>

            {/* Stepper */}
            <div className="p-5 sm:p-6 border-b border-zinc-800 bg-zinc-950/40">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Step 1 */}
                <div className={`p-3.5 border text-center transition-colors ${currentStep >= 1 ? 'bg-zinc-850 border-zinc-500 text-white' : 'bg-zinc-950 border-zinc-850 text-zinc-600'}`}>
                  <span className="text-sm font-bold block mb-0.5">1. Transmise</span>
                  <span className="text-xs text-zinc-400 block">Enregistrée</span>
                </div>

                {/* Step 2 */}
                <div className={`p-3.5 border text-center transition-colors ${currentStep >= 2 ? 'bg-zinc-850 border-[#d4af37] text-white' : 'bg-zinc-950 border-zinc-850 text-zinc-600'}`}>
                  <span className="text-sm font-bold block mb-0.5">2. En cuisine</span>
                  <span className="text-xs text-zinc-400 block">Cuisson & préparation</span>
                </div>

                {/* Step 3 */}
                <div className={`p-3.5 border text-center transition-colors ${currentStep >= 3 ? 'bg-zinc-850 border-emerald-500 text-white' : 'bg-zinc-950 border-zinc-850 text-zinc-600'}`}>
                  <span className="text-sm font-bold block mb-0.5">3. Prête</span>
                  <span className="text-xs text-zinc-400 block">Service à table</span>
                </div>

                {/* Step 4 */}
                <div className={`p-3.5 border text-center transition-colors ${currentStep >= 4 ? 'bg-zinc-850 border-emerald-600 text-white' : 'bg-zinc-950 border-zinc-850 text-zinc-600'}`}>
                  <span className="text-sm font-bold block mb-0.5">4. Servie</span>
                  <span className="text-xs text-zinc-400 block">Bon appétit</span>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-zinc-400 gap-2">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#d4af37]" />
                  <span>Délai moyen estimé : 15 à 25 minutes</span>
                </span>
                <span>
                  Mode de règlement :{' '}
                  <strong className="text-zinc-200">
                    {displayOrder.paymentMethod === 'cash_table'
                      ? 'Espèces au serveur'
                      : displayOrder.paymentMethod === 'mobile_money'
                      ? 'Mobile Money'
                      : 'En caisse'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="p-5 sm:p-6">
              <span className="text-xs sm:text-sm font-bold text-zinc-400 uppercase tracking-wider block mb-3">
                Détail de votre commande
              </span>

              <div className="divide-y divide-zinc-800">
                {displayOrder.items.map(item => (
                  <div key={item.cartItemId} className="py-3 flex items-start justify-between gap-4 text-sm sm:text-base">
                    <div>
                      <span className="font-bold text-white">
                        {item.quantity}x {item.name}
                      </span>
                      {item.variantName && (
                        <span className="text-[#d4af37] block text-xs font-semibold mt-0.5">
                          Format : {item.variantName}
                        </span>
                      )}
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <span className="text-zinc-400 block text-xs mt-0.5">
                          + {item.selectedOptions.join(', ')}
                        </span>
                      )}
                      {item.specialInstructions && (
                        <span className="text-amber-200/90 italic block text-xs mt-0.5">
                          « {item.specialInstructions} »
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-zinc-200 font-bold tabular-nums shrink-0">
                      {item.totalPrice.toLocaleString()} FCFA
                    </span>
                  </div>
                ))}
              </div>

              {displayOrder.notes && (
                <div className="mt-4 p-3 bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-300">
                  <strong className="text-white">Note pour le chef :</strong> {displayOrder.notes}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => handleShareWhatsApp(displayOrder)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors border border-zinc-700"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Partager par WhatsApp</span>
              </button>

              <button
                onClick={() => setCurrentView('menu')}
                className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs sm:text-sm font-semibold transition-colors"
              >
                Commander d'autres plats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
