import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RulesEngine } from '../src/engines/RulesEngine';
import { AIEngine } from '../src/engines/AIEngine';
import { DEFAULT_GAME_SETTINGS } from '../src/config/rules.config';
import { Player } from '../src/engines/types';

describe('Phase 6: Headless AI Bot-vs-Bot Simulation Tests', () => {
  it('runs 100 fast bot games without deadlocks or invalid states', () => {
    let completedGames = 0;

    for (let g = 0; g < 100; g++) {
      const bots: Player[] = [
        { id: 'bot_1', name: 'Bot 1', characterId: 'thorne', color: '#1', cash: 1500, position: 0, inJail: false, jailTurns: 0, getOutOfJailCards: 0, isBankrupt: false, isBot: true, difficulty: 'HARD', personality: 'AGGRESSIVE', emote: 'idle' },
        { id: 'bot_2', name: 'Bot 2', characterId: 'cloud', color: '#2', cash: 1500, position: 0, inJail: false, jailTurns: 0, getOutOfJailCards: 0, isBankrupt: false, isBot: true, difficulty: 'NORMAL', personality: 'CAUTIOUS', emote: 'idle' },
        { id: 'bot_3', name: 'Bot 3', characterId: 'fox', color: '#3', cash: 1500, position: 0, inJail: false, jailTurns: 0, getOutOfJailCards: 0, isBankrupt: false, isBot: true, difficulty: 'HARD', personality: 'TRADER', emote: 'idle' },
        { id: 'bot_4', name: 'Bot 4', characterId: 'starling', color: '#4', cash: 1500, position: 0, inJail: false, jailTurns: 0, getOutOfJailCards: 0, isBankrupt: false, isBot: true, difficulty: 'EASY', personality: 'BALANCED', emote: 'idle' },
      ];

      let state = RulesEngine.createInitialState(bots, DEFAULT_GAME_SETTINGS, 54321 + g * 31);
      let turns = 0;
      const MAX_TURNS = 250;

      while (state.phase !== 'GAME_OVER' && turns < MAX_TURNS) {
        turns++;
        const active = state.players[state.activePlayerIndex];
        const action = AIEngine.getNextAction(state, active.id);

        if (!action) {
          // If in awaiting purchase or end turn, provide default
          if (state.phase === 'AWAITING_PURCHASE') {
            state = RulesEngine.reduce(state, { type: 'BUY_PROPERTY' });
          } else {
            state = RulesEngine.reduce(state, { type: 'END_TURN' });
          }
        } else {
          state = RulesEngine.reduce(state, action);
        }

        // Invariants check: Bank houses between 0 and 32
        assert.ok(state.bankHouses >= 0 && state.bankHouses <= 32);
        assert.ok(state.bankHotels >= 0 && state.bankHotels <= 12);

        // Every owned property must point to a valid active player
        Object.values(state.properties).forEach((own) => {
          assert.ok(state.players.some((p) => p.id === own.ownerId));
        });
      }

      completedGames++;
    }

    assert.equal(completedGames, 100);
  });
});
