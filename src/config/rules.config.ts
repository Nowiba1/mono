import { GameSettings } from '../engines/types';

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  startingCash: 1500,
  goSalary: 200,
  doubleGoLanding: false,
  freeParkingJackpot: false,
  auctionEnabled: true,
  evenBuildRule: true,
  mortgageInterestRate: 0.10,
  jailFine: 50,
  turnTimerSeconds: 60,
};

export const SPEED_GAME_SETTINGS: GameSettings = {
  startingCash: 2000,
  goSalary: 300,
  doubleGoLanding: true,
  freeParkingJackpot: true,
  auctionEnabled: true,
  evenBuildRule: true,
  mortgageInterestRate: 0.10,
  jailFine: 50,
  turnTimerSeconds: 45,
};
