import { CharacterId, BotPersonality } from '../engines/types';

export interface CharacterConfig {
  id: CharacterId;
  name: string;
  title: string;
  color: string;
  defaultPersonality: BotPersonality;
  description: string;
  quote: string;
}

export const CHARACTERS: CharacterConfig[] = [
  {
    id: 'thorne',
    name: 'Captain Thorne',
    title: 'The Oceanic Explorer',
    color: '#0284c7', // Sky Blue
    defaultPersonality: 'BALANCED',
    description: 'A sea-hardened navigator who treats real estate like uncharted archipelagos.',
    quote: 'Every deed is an anchor in uncharted waters.',
  },
  {
    id: 'marcel',
    name: 'Chef Marcel',
    title: 'Grand Culinary Virtuoso',
    color: '#ea580c', // Orange
    defaultPersonality: 'CAUTIOUS',
    description: 'Michelin-starred creator whose patience and meticulous precision conquer districts.',
    quote: 'Patience and the finest ingredients yield a monopoly.',
  },
  {
    id: 'cloud',
    name: 'Amelia Cloud',
    title: 'The Ace Aviatrix',
    color: '#06b6d4', // Cyan
    defaultPersonality: 'AGGRESSIVE',
    description: 'A high-flying daredevil who scoops up transit hubs and strikes fast.',
    quote: 'From twenty thousand feet, all land is ready for acquisition.',
  },
  {
    id: 'fox',
    name: 'Inspector Fox',
    title: 'Chief Inquisitor',
    color: '#7c3aed', // Violet
    defaultPersonality: 'TRADER',
    description: 'A cunning detective with an eye for legal loopholes, mortgages, and arbitrage.',
    quote: 'The evidence always points directly to the highest bidder.',
  },
  {
    id: 'starling',
    name: 'Nova Starling',
    title: 'Cosmic Navigator',
    color: '#ec4899', // Pink
    defaultPersonality: 'AGGRESSIVE',
    description: 'An astrophysicist turned city developer, building citadels that touch the stars.',
    quote: 'The stars have charted my course to the high throne.',
  },
  {
    id: 'monet',
    name: 'Madame Monet',
    title: 'Avant-Garde Artisan',
    color: '#d946ef', // Fuchsia
    defaultPersonality: 'TRADER',
    description: 'An influential gallerist who turns neglected districts into high-value masterpieces.',
    quote: 'Architecture is simply sculpture that collects rent.',
  },
  {
    id: 'salt',
    name: 'Barnaby Salt',
    title: 'Harbor Veteran',
    color: '#b45309', // Amber / Rust
    defaultPersonality: 'CAUTIOUS',
    description: 'A pragmatic industrialist who never overpays and stockpiles cash reserves.',
    quote: 'A steady harbor weathers the steepest rental storm.',
  },
  {
    id: 'nitro',
    name: 'Axel Nitro',
    title: 'Grand Prix Champion',
    color: '#ef4444', // Red
    defaultPersonality: 'AGGRESSIVE',
    description: 'A speed fanatic who aggressively builds citadels before rivals can even roll.',
    quote: 'Second place is simply the first to go bankrupt.',
  },
  {
    id: 'spark',
    name: 'Professor Spark',
    title: 'Steampunk Polymath',
    color: '#10b981', // Emerald
    defaultPersonality: 'BALANCED',
    description: 'An eccentric inventor who calculates the mathematical probability of every roll.',
    quote: 'Thermodynamics dictates that your capital must flow to me.',
  },
  {
    id: 'valoria',
    name: 'Lady Valoria',
    title: 'The Vigilant Knight',
    color: '#6366f1', // Indigo
    defaultPersonality: 'BALANCED',
    description: 'An aristocratic strategist sworn to protect her sovereign estates at all costs.',
    quote: 'Honor demands that every debt to my house be collected.',
  },
  {
    id: 'blackfin',
    name: 'Dread Blackfin',
    title: 'The Sky Corsair',
    color: '#334155', // Charcoal
    defaultPersonality: 'AGGRESSIVE',
    description: 'A legendary sky privateer who loves high-stakes auctions and hostile buyouts.',
    quote: 'Surrender your deeds or walk the high altitude plank.',
  },
  {
    id: 'vane',
    name: 'Merlin Vane',
    title: 'Grand Illusionist',
    color: '#f59e0b', // Gold
    defaultPersonality: 'TRADER',
    description: 'A master of sleight of hand who trades mortgages into dazzling windfalls.',
    quote: 'Now you see your cash... and now it is mine.',
  },
];
