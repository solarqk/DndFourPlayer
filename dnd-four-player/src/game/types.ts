export type PlayerId = "p1" | "p2" | "p3" | "p4";

export type Phase = "intro" | "combat" | "outro" | "done";

export type Player = {
  id: PlayerId;
  name: string;
  hpDisplay: number; // not used for combat math (just shown)
};

export type Enemy = {
  name: string;
  hitsRemaining: number; // e.g., 5 hits to die
  armorClass: number; // target number for d20 roll (simple)
};

export type IntroChoiceKey =
  | "buy_round"
  | "chat_bartender"
  | "intimidate_patron"
  | "inspect_noticeboard";

export type IntroChoice = {
  key: IntroChoiceKey;
  label: string;
  description: string;
};

export type StoryFlags = {
  // track who did what in intro; used later in outro text
  introChoicesByPlayer: Partial<Record<PlayerId, IntroChoiceKey>>;
};

export type CombatLastRoll = {
  playerId: PlayerId;
  d20: number;
  hit: boolean;
  crit: boolean;
};

export type GameState = {
  phase: Phase;

  environmentTitle: string;
  environmentImageUrl: string;

  players: Record<PlayerId, Player>;
  activePlayer: PlayerId;

  enemy: Enemy;

  flags: StoryFlags;

  // simple event log shown in narrative pane
  log: string[];

  attackedThisCombat: Partial<Record<PlayerId, boolean>>;

  // combat feedback
  lastRoll?: CombatLastRoll;
};

export type Action =
  | { type: "INTRO_CHOOSE"; playerId: PlayerId; choice: IntroChoiceKey }
  | { type: "INTRO_ADVANCE" }
  | { type: "COMBAT_ATTACK"; playerId: PlayerId }
  | { type: "COMBAT_END_TURN" }
  | { type: "OUTRO_ADVANCE" }
  | { type: "RESET" };
