import type { Action, GameState } from "./types";
import { createEnemy, createPlayers, nextPlayerId } from "./scenario";
import { allPlayersChoseIntro } from "./uiText";

function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1; // 1..20
}

function pushLog(state: GameState, line: string): GameState {
  return { ...state, log: [line, ...state.log].slice(0, 50) };
}

export function createInitialState(): GameState {
  return {
    phase: "intro",
    environmentTitle: "Driftwood Mug (Stormy Night)",
    environmentImageUrl:
      "https://images.unsplash.com/photo-1528823872057-9c018a7a7553?auto=format&fit=crop&w=1200&q=60",

    players: createPlayers(),
    activePlayer: "p1",

    enemy: createEnemy(),

    flags: { introChoicesByPlayer: {} },

    log: [
      "Scenario loaded: Bar intro → quick fight → wrap-up.",
      "Waiting for player choices…",
    ],
  };
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "RESET":
      return createInitialState();

    case "INTRO_CHOOSE": {
      if (state.phase !== "intro") return state;

      const already = state.flags.introChoicesByPlayer[action.playerId];
      const nextFlags = {
        ...state.flags,
        introChoicesByPlayer: {
          ...state.flags.introChoicesByPlayer,
          [action.playerId]: action.choice,
        },
      };

      let s = { ...state, flags: nextFlags };

      if (!already) {
        s = pushLog(
          s,
          `${state.players[action.playerId].name} chose intro action: ${action.choice}`,
        );
      } else {
        s = pushLog(
          s,
          `${state.players[action.playerId].name} changed intro action to: ${action.choice}`,
        );
      }

      return s;
    }

    case "INTRO_ADVANCE": {
      if (state.phase !== "intro") return state;
      if (!allPlayersChoseIntro(state)) {
        return pushLog(
          state,
          "Cannot advance: not all players chose an intro action.",
        );
      }
      const s: GameState = {
        ...state,
        phase: "combat",
        activePlayer: "p1",
        lastRoll: undefined,
      };
      return pushLog(s, "Intro complete. Combat begins!");
    }

    case "COMBAT_ATTACK": {
      if (state.phase !== "combat") return state;
      if (state.enemy.hitsRemaining <= 0) return state;
      if (action.playerId !== state.activePlayer) {
        return pushLog(state, "Not your turn.");
      }

      const d20 = rollD20();
      const hit = d20 >= state.enemy.armorClass;

      let hitsRemaining = state.enemy.hitsRemaining;
      if (hit) hitsRemaining = Math.max(0, hitsRemaining - 1);

      let s: GameState = {
        ...state,
        enemy: { ...state.enemy, hitsRemaining },
        lastRoll: { playerId: action.playerId, d20, hit },
      };

      s = pushLog(
        s,
        `${state.players[action.playerId].name} attacks: rolled ${d20} → ${
          hit ? "HIT (-1 enemy hit)" : "MISS"
        }`,
      );

      if (hitsRemaining <= 0) {
        s = pushLog(s, `${state.enemy.name} is defeated!`);
      }

      return s;
    }

    case "COMBAT_END_TURN": {
      if (state.phase !== "combat") return state;
      if (state.enemy.hitsRemaining <= 0) {
        // allow ending combat by moving to outro via OUTRO_ADVANCE
        return state;
      }
      const next = nextPlayerId(state.activePlayer);
      return pushLog(
        { ...state, activePlayer: next },
        `Turn passes to ${state.players[next].name}.`,
      );
    }

    case "OUTRO_ADVANCE": {
      if (state.phase === "combat") {
        if (state.enemy.hitsRemaining > 0) {
          return pushLog(state, "Cannot wrap up yet: enemy still standing.");
        }
        return pushLog(
          { ...state, phase: "outro" },
          "Combat complete. Entering wrap-up.",
        );
      }
      if (state.phase === "outro") {
        return pushLog({ ...state, phase: "done" }, "Scenario complete.");
      }
      return state;
    }

    default:
      return state;
  }
}
