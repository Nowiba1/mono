import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LocalAdapter } from '../src/network/LocalAdapter';
import { MockAdapter } from '../src/network/MockAdapter';
import { RulesEngine } from '../src/engines/RulesEngine';
import { Player } from '../src/engines/types';

describe('Phase 7 & 8: Network & Multiplayer Pipeline', () => {
  it('LocalAdapter executes player action and broadcasts next state', async () => {
    const players: Player[] = [
      { id: 'p1', name: 'P1', characterId: 'thorne', color: '#1', cash: 1500, position: 0, inJail: false, jailTurns: 0, getOutOfJailCards: 0, isBankrupt: false, isBot: false, emote: 'idle' },
      { id: 'p2', name: 'P2', characterId: 'cloud', color: '#2', cash: 1500, position: 0, inJail: false, jailTurns: 0, getOutOfJailCards: 0, isBankrupt: false, isBot: false, emote: 'idle' },
    ];

    const initial = RulesEngine.createInitialState(players);
    const adapter = new LocalAdapter();
    await adapter.connect('room1', 'p1', true);

    let stateReceived = false;
    adapter.onState((s) => {
      stateReceived = true;
      assert.equal(s.turnCount, 1);
    });

    await adapter.broadcastState(initial);
    assert.equal(stateReceived, true);

    const success = await adapter.sendAction({ type: 'ROLL_DICE' });
    assert.equal(success, true);

    adapter.disconnect();
  });

  it('MockAdapter replicates host state to guest with simulated latency', async () => {
    const mock = new MockAdapter();
    mock.simulatedLatency = 20;

    let received = false;
    mock.onState(() => {
      received = true;
    });

    const players: Player[] = [
      { id: 'p1', name: 'P1', characterId: 'thorne', color: '#1', cash: 1500, position: 0, inJail: false, jailTurns: 0, getOutOfJailCards: 0, isBankrupt: false, isBot: false, emote: 'idle' },
    ];
    const initial = RulesEngine.createInitialState(players);

    await mock.broadcastState(initial);
    await new Promise((res) => setTimeout(res, 50));
    assert.equal(received, true);
    mock.disconnect();
  });

  it('validates Firebase security rule restrictions for guests writing /state', () => {
    const raw = readFileSync('./database.rules.json', 'utf8');
    const rules = JSON.parse(raw);
    const stateRule = rules.rules.rooms.$roomCode.state['.write'];
    assert.ok(stateRule.includes("child('meta/hostId').val() === auth.uid"), 'State writes are strictly restricted to room host');
  });
});
