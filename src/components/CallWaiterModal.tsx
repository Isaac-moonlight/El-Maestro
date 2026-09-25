import React, { useState } from 'react';
import { X, Bell, Receipt, Wine, Droplets, CheckCircle2, HelpCircle } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { WaiterCall } from '../types/restaurant';

export const CallWaiterModal: React.FC = () => {
  const { isWaiterModalOpen, setIsWaiterModalOpen, currentTable, callWaiter } = useRestaurant();
  const [calledSuccess, setCalledSuccess] = useState(false);

  if (!isWaiterModalOpen) return null;

  const handleCall = (reason: WaiterCall['reason']) => {
    callWaiter(reason);
    setCalledSuccess(true);
    setTimeout(() => {
      setCalledSuccess(false);
      setIsWaiterModalOpen(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={() => setIsWaiterModalOpen(false)}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-700 shadow-2xl z-10 p-6 text-zinc-100">
        <button
          onClick={() => setIsWaiterModalOpen(false)}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {calledSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-serif-display text-white">
              Signalement transmis
            </h3>
            <p className="text-sm text-zinc-300">
              Un serveur arrive immédiatement à votre <strong>{currentTable}</strong>.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-5 h-5 text-[#d4af37]" />
              <h3 className="text-lg font-bold font-serif-display text-white">
                Appel Serveur · {currentTable}
              </h3>
            </div>

            <p className="text-sm text-zinc-300 mb-5">
              Sélectionnez l'objet de votre demande pour orienter l'équipe :
            </p>

            <div className="space-y-2.5 text-sm">
              <button
                onClick={() => handleCall('addition')}
                className="w-full p-3.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-600 flex items-center gap-3 transition-colors text-left"
              >
                <Receipt className="w-5 h-5 text-[#d4af37] shrink-0" />
                <div>
                  <span className="font-bold text-white block">
                    Demander l'addition
                  </span>
                  <span className="text-xs text-zinc-400 block mt-0.5">
                    Règlement par espèces ou Mobile Money à table
                  </span>
                </div>
              </button>

              <button
                onClick={() => handleCall('service')}
                className="w-full p-3.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-600 flex items-center gap-3 transition-colors text-left"
              >
                <Wine className="w-5 h-5 text-zinc-300 shrink-0" />
                <div>
                  <span className="font-bold text-white block">
                    Commander un supplément
                  </span>
                  <span className="text-xs text-zinc-400 block mt-0.5">
                    Boissons fraîches, plats ou desserts supplémentaires
                  </span>
                </div>
              </button>

              <button
                onClick={() => handleCall('eau')}
                className="w-full p-3.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-600 flex items-center gap-3 transition-colors text-left"
              >
                <Droplets className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">
                    Carafe d'eau ou couverts
                  </span>
                  <span className="text-xs text-zinc-400 block mt-0.5">
                    Serviettes, assiettes, verres ou condiments
                  </span>
                </div>
              </button>

              <button
                onClick={() => handleCall('question')}
                className="w-full p-3.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-600 flex items-center gap-3 transition-colors text-left"
              >
                <HelpCircle className="w-5 h-5 text-zinc-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">
                    Assistance ou autre question
                  </span>
                  <span className="text-xs text-zinc-400 block mt-0.5">
                    Un membre de l'équipe vient à votre rencontre
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
