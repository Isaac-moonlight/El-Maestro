import React, { useState } from 'react';
import { ChefHat, Clock, ArrowLeft, Bell } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { OrderStatus } from '../types/restaurant';

export const KitchenDashboard: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    waiterCalls,
    resolveWaiterCall,
    setCurrentView,
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<'live' | 'all'>('live');
  const [filterTable, setFilterTable] = useState<string>('all');

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.totalAmount : sum), 0);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-zinc-800 text-zinc-200 border border-zinc-700">Reçue</span>;
      case 'preparing':
        return <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-zinc-850 text-[#d4af37] border border-[#d4af37]/60">En cuisine</span>;
      case 'ready':
        return <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-zinc-850 text-emerald-400 border border-emerald-500/60">Prête</span>;
      case 'served':
        return <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-zinc-900 text-zinc-500">Servie</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-zinc-900 text-rose-400">Annulée</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
        <div>
          <button
            onClick={() => setCurrentView('menu')}
            className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quitter et retourner au menu client</span>
          </button>
          <div className="flex items-center gap-3">
            <ChefHat className="w-6 h-6 text-[#d4af37]" />
            <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-white tracking-tight">
              Espace Cuisine & Service (Accès Réservé)
            </h2>
          </div>
        </div>

        {/* Clean Subdued Metrics */}
        <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm">
          <div>
            <span className="text-xs text-zinc-400 uppercase tracking-wider block font-bold">En cours</span>
            <span className="font-mono font-bold text-white text-base tabular-nums">
              {pendingOrders.length + preparingOrders.length + readyOrders.length}
            </span>
          </div>
          <span className="text-zinc-700">|</span>
          <div>
            <span className="text-xs text-zinc-400 uppercase tracking-wider block font-bold">Appels</span>
            <span className="font-mono font-bold text-[#d4af37] text-base tabular-nums">
              {waiterCalls.length}
            </span>
          </div>
          <span className="text-zinc-700">|</span>
          <div>
            <span className="text-xs text-zinc-400 uppercase tracking-wider block font-bold">Total Service</span>
            <span className="font-mono font-bold text-emerald-400 text-base tabular-nums">
              {totalRevenue.toLocaleString()} F
            </span>
          </div>
        </div>
      </div>

      {/* Waiter Calls Alert Strip */}
      {waiterCalls.length > 0 && (
        <div className="mb-6 p-4 bg-zinc-900 border border-[#d4af37]/60 shadow-lg">
          <div className="flex items-center gap-2 text-white font-bold text-sm mb-3 uppercase tracking-wider">
            <Bell className="w-4 h-4 text-[#d4af37]" />
            <span>Demandes d'intervention à table en direct ({waiterCalls.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {waiterCalls.map(call => (
              <div
                key={call.id}
                className="p-3 bg-zinc-950 border border-zinc-700 flex items-center justify-between gap-3 text-sm"
              >
                <div>
                  <span className="font-bold text-white block text-base">
                    {call.tableNumber}
                  </span>
                  <span className="text-zinc-300 text-xs block mt-0.5">
                    {call.reason === 'addition' ? "Demande l'addition" : call.reason === 'eau' ? "Demande de l'eau" : 'Assistance requise'}
                  </span>
                </div>
                <button
                  onClick={() => resolveWaiterCall(call.id)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors border border-zinc-700"
                >
                  Marquer traité
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center border border-zinc-800 bg-zinc-900 text-sm">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 transition-colors ${
              activeTab === 'live' ? 'bg-zinc-800 text-white font-bold border-b-2 border-[#d4af37]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Commandes en cours ({pendingOrders.length + preparingOrders.length + readyOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 transition-colors ${
              activeTab === 'all' ? 'bg-zinc-800 text-white font-bold border-b-2 border-[#d4af37]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Historique ({orders.length})
          </button>
        </div>

        <select
          value={filterTable}
          onChange={e => setFilterTable(e.target.value)}
          className="px-3.5 py-2 bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 font-medium"
        >
          <option value="all">Filtrer par table : Toutes les tables</option>
          {Array.from(new Set(orders.map(o => o.tableNumber))).map(tbl => (
            <option key={tbl} value={tbl}>{tbl}</option>
          ))}
        </select>
      </div>

      {activeTab === 'live' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Column 1: A préparer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                À préparer ({pendingOrders.length})
              </span>
            </div>
            <div className="space-y-3">
              {pendingOrders
                .filter(o => filterTable === 'all' || o.tableNumber === filterTable)
                .map(order => (
                  <OrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
                ))}
              {pendingOrders.length === 0 && (
                <div className="p-6 bg-zinc-900/30 border border-zinc-850 text-center text-sm text-zinc-500">
                  Aucune commande en attente
                </div>
              )}
            </div>
          </div>

          {/* Column 2: En cuisine */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-sm font-bold text-[#d4af37] uppercase tracking-wider">
                En cuisine ({preparingOrders.length})
              </span>
            </div>
            <div className="space-y-3">
              {preparingOrders
                .filter(o => filterTable === 'all' || o.tableNumber === filterTable)
                .map(order => (
                  <OrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
                ))}
              {preparingOrders.length === 0 && (
                <div className="p-6 bg-zinc-900/30 border border-zinc-850 text-center text-sm text-zinc-500">
                  Aucun plat en cours de cuisson
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Prêtes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                Prêtes à servir ({readyOrders.length})
              </span>
            </div>
            <div className="space-y-3">
              {readyOrders
                .filter(o => filterTable === 'all' || o.tableNumber === filterTable)
                .map(order => (
                  <OrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
                ))}
              {readyOrders.length === 0 && (
                <div className="p-6 bg-zinc-900/30 border border-zinc-850 text-center text-sm text-zinc-500">
                  Aucune commande prête
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* History list */
        <div className="bg-zinc-900 border border-zinc-800 text-sm">
          <div className="divide-y divide-zinc-800">
            {orders
              .filter(o => filterTable === 'all' || o.tableNumber === filterTable)
              .map(order => (
                <div key={order.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-850/60">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono font-bold text-white text-base">#{order.orderNumber}</span>
                      <span className="text-zinc-600">·</span>
                      <span className="font-bold text-[#d4af37]">{order.tableNumber}</span>
                      <span className="text-zinc-400">({order.customerName})</span>
                    </div>
                    <p className="text-zinc-300 text-xs sm:text-sm">
                      {order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-white text-base tabular-nums">
                      {order.totalAmount.toLocaleString()} FCFA
                    </span>
                    {getStatusBadge(order.status)}
                    <select
                      value={order.status}
                      onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 text-xs sm:text-sm text-white font-medium"
                    >
                      <option value="pending">Reçue</option>
                      <option value="preparing">En cuisine</option>
                      <option value="ready">Prête</option>
                      <option value="served">Servie</option>
                      <option value="cancelled">Annulée</option>
                    </select>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

const OrderCard: React.FC<{ order: any; onUpdateStatus: (id: string, s: OrderStatus) => void }> = ({
  order,
  onUpdateStatus,
}) => {
  const timeElapsed = Math.floor((Date.now() - order.createdAt) / 60000);

  return (
    <div className="bg-zinc-900 border border-zinc-700 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-2.5 pb-2 border-b border-zinc-800">
        <div>
          <span className="font-mono font-bold text-[#d4af37] text-sm block">
            #{order.orderNumber}
          </span>
          <span className="text-base font-bold text-white block">
            {order.tableNumber}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-zinc-400 flex items-center gap-1 justify-end font-mono">
            <Clock className="w-3.5 h-3.5" />
            {timeElapsed} min
          </span>
          <span className="text-sm font-semibold text-zinc-200">
            {order.customerName}
          </span>
        </div>
      </div>

      <div className="space-y-1.5 my-3 text-sm">
        {order.items.map((item: any) => (
          <div key={item.cartItemId} className="flex items-start justify-between gap-2">
            <span className="text-zinc-200">
              <strong className="text-white text-base">{item.quantity}x</strong> {item.name}
              {item.variantName && <span className="text-[#d4af37] text-xs font-semibold ml-1.5">({item.variantName})</span>}
              {item.specialInstructions && (
                <span className="text-amber-200/90 italic text-xs block ml-4">
                  « {item.specialInstructions} »
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="p-2 mb-3 bg-zinc-950 border border-zinc-800 text-xs text-zinc-300">
          <strong className="text-white">Note :</strong> {order.notes}
        </div>
      )}

      <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
        <span className="font-mono text-sm font-bold text-white tabular-nums">
          {order.totalAmount.toLocaleString()} FCFA
        </span>

        {order.status === 'pending' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'preparing')}
            className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs sm:text-sm font-bold border border-zinc-700 transition-colors"
          >
            Lancer cuisine
          </button>
        )}

        {order.status === 'preparing' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'ready')}
            className="px-3.5 py-1.5 bg-[#d4af37] hover:bg-[#e2c15c] text-zinc-950 text-xs sm:text-sm font-bold border border-amber-600/40 transition-colors"
          >
            Marquer prête
          </button>
        )}

        {order.status === 'ready' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'served')}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-colors"
          >
            Marquer servie
          </button>
        )}

        {order.status === 'served' && (
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Terminée</span>
        )}
      </div>
    </div>
  );
};
