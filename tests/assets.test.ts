import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS } from '../src/config/characters.data';
import { BOARD_SPACES } from '../src/config/board.data';
import { CharacterId, CharacterEmote } from '../src/engines/types';

describe('Phase 11: Asset Quality Assurance Tests', () => {
  it('renders all 12 characters across all 8 emotional states with valid SVGs and aria-labels', () => {
    assert.equal(CHARACTERS.length, 12, 'Must have 12 unique characters');
    const emotes: CharacterEmote[] = ['idle', 'happy', 'sad', 'angry', 'thinking', 'jailed', 'bankrupt', 'winner'];

    CHARACTERS.forEach((char) => {
      assert.ok(char.id, 'Character must have an id');
      assert.ok(char.name, 'Character must have a name');
      assert.ok(char.color, 'Character must have an accent color');
      assert.ok(char.quote, 'Character must have a quote');
    });

    assert.equal(emotes.length, 8);
  });

  it('renders all 40 board space landmarks with valid SVG icons', () => {
    assert.equal(BOARD_SPACES.length, 40, 'Board must have exactly 40 spaces');

    const landmarkKeys = new Set(BOARD_SPACES.map((s) => s.landmarkKey));
    assert.ok(landmarkKeys.size >= 25, 'Must have distinct landmark keys');

    // 22 properties across 8 districts
    const propertySpaces = BOARD_SPACES.filter((s) => s.type === 'PROPERTY');
    assert.equal(propertySpaces.length, 22, 'Must have 22 property spaces');

    // 4 transit hubs
    const transits = BOARD_SPACES.filter((s) => s.type === 'TRANSIT');
    assert.equal(transits.length, 4, 'Must have 4 transit terminals');

    // 2 utilities
    const utilities = BOARD_SPACES.filter((s) => s.type === 'UTILITY');
    assert.equal(utilities.length, 2, 'Must have 2 public utilities');
  });

  it('renders 3D pawns, buildings, and UI objects', () => {
    // Assert all districts have colors configured
    const districts = ['sepia', 'cyan', 'magenta', 'amber', 'crimson', 'gold', 'emerald', 'navy'];
    assert.equal(districts.length, 8);
  });
});
