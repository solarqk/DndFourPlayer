import type { Action, GameState, PlayerId } from "./types";
import { createEnemy, createPlayers } from "./scenario"; // nextPlayerId
import { allPlayersChoseIntro } from "./uiText";
import pixelArt from "../assets/pixel-art-bar.png";

function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1; // 1..20
}

function pickEnemyTarget(state: GameState): PlayerId | null {
  const livingPlayers = (Object.keys(state.players) as PlayerId[]).filter(
    (id) => state.players[id].currentHP > 0,
  );
  if (livingPlayers.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * livingPlayers.length);
  return livingPlayers[randomIndex];
}

function pushLog(state: GameState, line: string): GameState {
  return { ...state, log: [line, ...state.log].slice(0, 50) };
}

function allPlayersDown(state: GameState): boolean {
  return (Object.keys(state.players) as PlayerId[]).every(
    (id) => state.players[id].currentHP <= 0,
  );
}

export function createInitialState(): GameState {
  return {
    phase: "intro",
    environmentTitle: "Driftwood Mug (Stormy Night)",
    environmentImageUrl: pixelArt,

    players: createPlayers(),
    activePlayer: "p1",

    enemy: createEnemy(),

    flags: { introChoicesByPlayer: {} },

    attackedThisCombat: {},
    endMessage: undefined,

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
      return pushLog(
        {
          ...state,
          phase: "combat",
          activePlayer: "p1",
          lastRoll: undefined,
          attackedThisCombat: {}, // RESET HERE
        },
        "Intro complete. Combat begins!",
      );
    }

    case "COMBAT_ATTACK": {
      if (state.phase !== "combat") return state;
      if (state.enemy.hitsRemaining <= 0) return state;

      if (action.playerId !== state.activePlayer) {
        return pushLog(state, "Not your turn.");
      }

      const actor = state.players[action.playerId];
      if (actor.currentHP <= 0) {
        return pushLog(state, `${actor.name} is at 0 HP and can't attack.`);
      }

      if (state.attackedThisCombat[action.playerId]) {
        return pushLog(state, "You already used your attack this round.");
      }

      const d20 = rollD20();
      const hit = d20 >= state.enemy.armorClass;

      let hitsRemaining = state.enemy.hitsRemaining;
      if (hit) {
        const dmgHits = d20 === 20 ? 2 : 1; // nat 20 = 2 hits
        hitsRemaining = Math.max(0, hitsRemaining - dmgHits);
      }

      let s: GameState = {
        ...state,
        enemy: { ...state.enemy, hitsRemaining },
        lastRoll: { playerId: action.playerId, d20, hit, crit: d20 === 20 },
        attackedThisCombat: {
          ...state.attackedThisCombat,
          [action.playerId]: true, // mark as used
        },
      };

      const hitText = hit
        ? d20 === 20
          ? "NAT 20! HIT (-2 enemy hits)"
          : "HIT (-1 enemy hit)"
        : "MISS";

      s = pushLog(
        s,
        `${state.players[action.playerId].name} attacks: rolled ${d20} → ${hitText}`,
      );

      if (hitsRemaining <= 0) {
        s = pushLog(s, `${state.enemy.name} is defeated!`);
      }

      return s;
    }

    case "COMBAT_END_TURN": {
      if (state.phase !== "combat") return state;

      if (state.enemy.hitsRemaining <= 0) {
        return state;
      }

      const order: PlayerId[] = ["p1", "p2", "p3", "p4"];
      const currentIndex = order.indexOf(state.activePlayer);

      // If last player in round
      if (currentIndex === order.length - 1) {
        // Enemy attacks once at end of round
        const targetId = pickEnemyTarget(state);

        if (!targetId || !state.players[targetId]) {
          // No valid target exists → everyone is dead
          const msg = "All heroes are down. Defeat.";
          let s: GameState = {
            ...state,
            phase: "done",
            endResult: "defeat",
            endMessage: msg,
          };
          s = pushLog(s, msg);
          return s;
        }

        const target = state.players[targetId];

        const d20 = rollD20();
        const hit = d20 >= target.armorClass;

        const updatedPlayers = {
          ...state.players,
          [targetId]: {
            ...target,
            currentHP: hit
              ? Math.max(0, target.currentHP - 1)
              : target.currentHP,
          },
        };

        let s: GameState = {
          ...state,
          players: updatedPlayers,
          activePlayer: "p1",
          attackedThisCombat: {}, // reset attacks for new round
          lastEnemyRoll: { d20, targetId, hit },
        };

        // Log the enemy attack FIRST
        s = pushLog(
          s,
          `Enemy attacks ${target?.name ?? targetId}: rolled ${d20} vs AC ${target?.armorClass ?? "?"} → ${
            hit ? "HIT (-1 HP)" : "MISS"
          }`,
        );

        // Then check defeat
        if (allPlayersDown(s)) {
          const msg = "All heroes are down. Defeat.";
          s = pushLog(s, msg);
          return { ...s, phase: "done", endResult: "defeat", endMessage: msg };
        }

        s = pushLog(s, "New round begins!");
        return s;
      }
      // Otherwise just move to next player
      const next = order[currentIndex + 1];

      if (!next || !state.players[next]) {
        return state; // safety guard — do nothing
      }

      return pushLog(
        {
          ...state,
          activePlayer: next,
        },
        `Turn passes to ${state.players[next].name}.`,
      );
    }

    case "OUTRO_ADVANCE": {
      if (state.phase === "combat" && allPlayersDown(state)) {
        const msg = "All heroes are down. Defeat.";
        return pushLog(
          { ...state, phase: "done", endResult: "defeat", endMessage: msg },
          "You cannot continue—everyone is down.",
        );
      }
      if (state.phase === "combat") {
        if (state.enemy.hitsRemaining > 0) {
          return pushLog(state, "Cannot wrap up yet: enemy still standing.");
        }

        const msg = `Victory! ${state.enemy.name} is down, and the room exhales.`;
        return pushLog(
          { ...state, phase: "outro", endResult: "victory", endMessage: msg },
          "Combat complete. Entering wrap-up.",
        );
      }
      if (state.phase === "outro") {
        const msg = state.endMessage ?? "Victory! The threat is dealt with.";
        return pushLog(
          {
            ...state,
            phase: "done",
            endResult: state.endResult ?? "victory",
            endMessage: msg,
          },
          "Scenario complete.",
        );
      }
      return state;
    }

    default:
      return state;
  }
}
