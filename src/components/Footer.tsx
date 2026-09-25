import React from 'react';
import { MapPin, Phone, Clock, MessageSquare } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/menuData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 text-zinc-300 text-sm mt-16 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-zinc-850">
          <div>
            <span className="font-serif-display text-xl font-bold tracking-wider text-white block mb-1">
              {RESTAURANT_INFO.name}
            </span>
            <span className="text-xs sm:text-sm text-zinc-400 font-medium">
              {RESTAURANT_INFO.tagline}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-zinc-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#d4af37]" />
              <span>{RESTAURANT_INFO.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#d4af37]" />
              <a href={`tel:${RESTAURANT_INFO.phoneRaw}`} className="hover:text-white underline">
                {RESTAURANT_INFO.phone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#d4af37]" />
              <span>{RESTAURANT_INFO.hours}</span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-zinc-400">
          <span>El Maestro · Carte & commande en salle</span>
          <div className="flex items-center gap-4">
            <a
              href={`https://wa.me/${RESTAURANT_INFO.phoneRaw}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white flex items-center gap-1.5 text-zinc-300"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Contacter la direction sur WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
