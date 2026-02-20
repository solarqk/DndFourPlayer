import type { GameState, PlayerId } from "./types";
import { introChoices } from "./scenario";

export function allPlayersChoseIntro(state: GameState): boolean {
  const c = state.flags.introChoicesByPlayer;
  return Boolean(c.p1 && c.p2 && c.p3 && c.p4);
}

export function introNarration(state: GameState): string {
  const chosen = state.flags.introChoicesByPlayer;
  const lines: string[] = [
    "You enter the Driftwood Mug. You are met by warm lanternlight, loud laughter, and the smell of fried onions.",
    "A storm taps the windows. Something about tonight feels… inevitable.",
    "",
    "Each of you chooses how to spend the first few minutes in the bar.",
  ];

  const summary = (pid: PlayerId) => {
    const key = chosen[pid];
    if (!key) return `${pid.toUpperCase()}: (not chosen yet)`;
    const label = introChoices.find((x) => x.key === key)?.label ?? key;
    return `${pid.toUpperCase()}: ${label}`;
  };

  lines.push("", "Current choices:");
  lines.push(summary("p1"), summary("p2"), summary("p3"), summary("p4"));

  if (allPlayersChoseIntro(state)) {
    lines.push(
      "",
      "Everyone’s made their move. When you’re ready, advance to see what trouble finds you.",
    );
  } else {
    lines.push("", "Waiting for all 4 players to choose an intro action.");
  }

  return lines.join("\n");
}

export function combatNarration(state: GameState): string {
  const lr = state.lastRoll;
  const lines: string[] = [
    "Outside, boots splash through puddles. A figure steps into the doorway and scans the room.",
    "A tense silence. Then, someone shoves a table aside.",
    "",
    `Combat has started. Enemy: ${state.enemy.name} (${state.enemy.hitsRemaining} hits remaining).`,
    `Armor Class (to hit): ${state.enemy.armorClass}.`,
    "",
    `It is ${state.players[state.activePlayer].name}'s turn.`,
  ];

  if (state.lastEnemyRoll) {
    const target = state.players[state.lastEnemyRoll.targetId];

    if (target) {
      lines.push(
        "",
        `Enemy targeted ${target.name}: rolled ${state.lastEnemyRoll.d20} vs AC ${target.armorClass} → ${
          state.lastEnemyRoll.hit ? "HIT (-1 HP)" : "MISS"
        }`,
      );
    } else {
      lines.push("", `Enemy attack occurred (target unavailable).`);
    }
  }

  if (lr) {
    lines.push(
      "",
      `Last roll: ${state.players[lr.playerId].name} rolled a ${lr.d20} → ${
        lr.hit ? "HIT! (-1 enemy hit)" : "MISS."
      }`,
    );
  }

  if (state.enemy.hitsRemaining <= 0) {
    lines.push("", "The enemy is down. Advance to wrap-up.");
  }

  return lines.join("\n");
}

export function outroNarration(state: GameState): string {
  const c = state.flags.introChoicesByPlayer;
  const keys = new Set(Object.values(c));

  const perks: string[] = [];
  if (keys.has("chat_bartender")) {
    perks.push(
      "Because someone chatted up the bartender, you learn the bruiser was hired by an old acquaintance with dubious intentions.",
    );
  }
  if (keys.has("inspect_noticeboard")) {
    perks.push(
      "Because someone studied the noticeboard, you recognize a symbol from a warning poster: a local gang mark.",
    );
  }
  if (keys.has("buy_round")) {
    perks.push(
      "Because someone bought a round, a patron wordlessly points you toward a back exit. An easy way out.",
    );
  }
  if (keys.has("intimidate_patron")) {
    perks.push(
      "Because someone leaned on a shady patron, you catch a single name dropped under breath: “Marrow.”",
    );
  }

  const lines: string[] = [
    "The room exhales. Chairs scrape back into place. Someone laughs a little too loudly to prove they’re fine.",
    "",
    perks.length
      ? "What you pick up in the aftermath:"
      : "In the aftermath, you gather yourselves.",
    ...perks.map((p) => `- ${p}`),
    "",
    "You share a final exchange, decide what matters, and step back into the storm.",
  ];

  return lines.join("\n");
}
