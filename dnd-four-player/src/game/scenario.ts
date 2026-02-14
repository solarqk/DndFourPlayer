import type { Enemy, GameState, IntroChoice, Player, PlayerId } from "./types";
import pixelArt from "../assets/pixel-art-bar.png";

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

export const introChoices: IntroChoice[] = [
  {
    key: "buy_round",
    label: "Buy a round",
    description:
      "You loosen tongues and earn goodwill. Might help after the fight.",
  },
  {
    key: "chat_bartender",
    label: "Chat up the bartender",
    description: "You gather local rumors and maybe a useful detail for later.",
  },
  {
    key: "intimidate_patron",
    label: "Intimidate a shady patron",
    description:
      "You push for answers fast—could provoke trouble, could reveal fear.",
  },
  {
    key: "inspect_noticeboard",
    label: "Inspect the noticeboard",
    description:
      "You scan posted jobs and warnings. Might reveal what’s coming.",
  },
];

export function createPlayers(): Record<PlayerId, Player> {
  return {
    p1: {
      id: "p1",
      name: "Player 1",
      currentHP: 3,
      maxHP: 3,
      armorClass: 9,
    },
    p2: {
      id: "p2",
      name: "Player 2",
      currentHP: 2,
      maxHP: 2,
      armorClass: 10,
    },
    p3: {
      id: "p3",
      name: "Player 3",
      currentHP: 1,
      maxHP: 1,
      armorClass: 6,
    },
    p4: {
      id: "p4",
      name: "Player 4",
      currentHP: 3,
      maxHP: 10,
      armorClass: 10,
    },
  };
}

export function createEnemy(): Enemy {
  return {
    name: "Alley Bruiser",
    hitsRemaining: 5,
    armorClass: 12,
    toHit: 0,
  };
}

export function nextPlayerId(current: PlayerId): PlayerId {
  const order: PlayerId[] = ["p1", "p2", "p3", "p4"];
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}
