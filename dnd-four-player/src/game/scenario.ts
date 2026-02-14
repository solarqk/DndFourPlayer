import type { Enemy, IntroChoice, Player, PlayerId } from "./types";

export const introChoices: IntroChoice[] = [
  {
    key: "buy_round",
    label: "Buy a round 🍺",
    description:
      "You loosen tongues and earn goodwill. Might help after the fight.",
  },
  {
    key: "chat_bartender",
    label: "Chat up the bartender 🗣️",
    description: "You gather local rumors and maybe a useful detail for later.",
  },
  {
    key: "intimidate_patron",
    label: "Intimidate a shady patron 😠",
    description:
      "You push for answers fast—could provoke trouble, could reveal fear.",
  },
  {
    key: "inspect_noticeboard",
    label: "Inspect the noticeboard 📜",
    description:
      "You scan posted jobs and warnings. Might reveal what’s coming.",
  },
];

export function createPlayers(): Record<PlayerId, Player> {
  return {
    p1: { id: "p1", name: "Player 1", hpDisplay: 12 },
    p2: { id: "p2", name: "Player 2", hpDisplay: 11 },
    p3: { id: "p3", name: "Player 3", hpDisplay: 10 },
    p4: { id: "p4", name: "Player 4", hpDisplay: 13 },
  };
}

export function createEnemy(): Enemy {
  return {
    name: "Alley Bruiser",
    hitsRemaining: 5,
    armorClass: 12, // d20 >= 12 hits
  };
}

export function nextPlayerId(current: PlayerId): PlayerId {
  const order: PlayerId[] = ["p1", "p2", "p3", "p4"];
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}
