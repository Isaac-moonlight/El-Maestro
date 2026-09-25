/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { Header } from './components/Header';
import { MenuCatalog } from './components/MenuCatalog';
import { DishDetailModal } from './components/DishDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { KitchenDashboard } from './components/KitchenDashboard';
import { CallWaiterModal } from './components/CallWaiterModal';
import { Footer } from './components/Footer';
import { MenuItem } from './types/restaurant';
import { ArrowRight } from 'lucide-react';

function RestaurantAppContent() {
  const { currentView, cartCount, cartSubtotal, setIsCartOpen, currentTable } = useRestaurant();
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

  return (
    <div className="min-h-screen bg-[#0e0e11] text-[#f4f4f6] flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Top Header with secret 3-click logo handler */}
      <Header />

      {/* Main Views */}
      <main className="flex-1">
        {currentView === 'menu' && (
          <MenuCatalog onSelectDish={dish => setSelectedDish(dish)} />
        )}

        {currentView === 'tracking' && <OrderTrackingModal />}

        {currentView === 'kitchen' && <KitchenDashboard />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Overlays */}
      <DishDetailModal dish={selectedDish} onClose={() => setSelectedDish(null)} />
      <CartDrawer />
      <CallWaiterModal />

      {/* Sticky Mobile Cart Bar: Clean rectangular styling */}
      {cartCount > 0 && currentView === 'menu' && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 p-3 bg-zinc-950/95 border-t border-zinc-800 backdrop-blur-md">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-4 bg-[#d4af37] active:scale-98 text-zinc-950 font-bold shadow-lg flex items-center justify-between border border-amber-600/40"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 bg-zinc-950/20 flex items-center justify-center font-mono text-sm font-bold">
                {cartCount}
              </span>
              <span className="text-sm uppercase tracking-wider font-bold">
                Voir le panier ({currentTable})
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-sm font-bold">
              <span>{cartSubtotal.toLocaleString()} FCFA</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <RestaurantProvider>
      <RestaurantAppContent />
    </RestaurantProvider>
  );
}
