import React, { useMemo, useReducer } from "react";
import { reducer } from "./game/reducer";
import { introChoices, createInitialState } from "./game/scenario";
import type { GameState, PlayerId } from "./game/types";
import { combatNarration, introNarration, outroNarration } from "./game/uiText";

type PlayerCardProps = {
  state: GameState;
  playerId: PlayerId;
  title: string;
  dispatch: React.Dispatch<any>;
};

function PlayerCard({ state, playerId, title, dispatch }: PlayerCardProps) {
  const player = state.players[playerId];
  const isActive = state.activePlayer === playerId;

  const sidebar = (
    <div className="playerSidebar">
      <div className="statRow">
        <span className="statLabel">Name</span>
        <span className="statValue">{player.name}</span>
      </div>
      <div className="statRow">
        <span className="statLabel">HP</span>
        <span className="statValue">
          {player.currentHP} / {player.maxHP}
        </span>
      </div>
      <div className="statRow">
        <span className="statLabel">Turn</span>
        <span className={`statValue ${isActive ? "active" : ""}`}>
          {isActive ? "ACTIVE" : "—"}
        </span>
      </div>
    </div>
  );

  let content: React.ReactNode = null;

  if (state.phase === "intro") {
    const selected = state.flags.introChoicesByPlayer[playerId];
    content = (
      <>
        <div className="panelTitle">{title}</div>
        <div className="hint">Choose an intro action (affects wrap-up).</div>

        <div className="btnGrid">
          {introChoices.map((c) => (
            <button
              key={c.key}
              className={`btn ${selected === c.key ? "btnPrimary" : ""}`}
              onClick={() =>
                dispatch({
                  type: "INTRO_CHOOSE",
                  playerId,
                  choice: c.key,
                })
              }>
              <div className="btnLabel">{c.label}</div>
              <div className="btnSub">{c.description}</div>
            </button>
          ))}
        </div>
      </>
    );
  } else if (state.phase === "combat") {
    const isDown = player.currentHP <= 0;

    const disabled =
      isDown ||
      !isActive ||
      state.enemy.hitsRemaining <= 0 ||
      state.attackedThisCombat[playerId];
    content = (
      <>
        <div className="panelTitle">{title}</div>
        <div className="hint">
          {isActive ? "Your turn." : "Waiting…"} Roll d20 ≥{" "}
          {state.enemy.armorClass}.
        </div>

        <div className="btnRow">
          <button
            className="btn btnPrimary"
            disabled={disabled}
            onClick={() => dispatch({ type: "COMBAT_ATTACK", playerId })}>
            Attack (d20)
          </button>

          <button
            className="btn"
            disabled={!isActive || state.enemy.hitsRemaining <= 0}
            onClick={() => dispatch({ type: "COMBAT_END_TURN" })}>
            End turn
          </button>
        </div>

        <div className="smallText">
          {state.lastRoll?.playerId === playerId && (
            <>
              Last roll: {state.lastRoll.d20} →{" "}
              {state.lastRoll.crit ? (
                <span className="crit">NAT 20! HIT!</span>
              ) : state.lastRoll.hit ? (
                "HIT!"
              ) : (
                "MISS"
              )}
            </>
          )}
        </div>
      </>
    );
  } else if (state.phase === "outro") {
    content = (
      <>
        <div className="panelTitle">{title}</div>
        <div className="hint">Wrap-up in progress.</div>
      </>
    );
  } else if (state.phase === "done") {
    content = (
      <>
        <div className="panelTitle">{title}</div>
        <div className="hint">Scenario complete.</div>
      </>
    );
  }

  return (
    <div className={`playerCard ${isActive ? "playerCardActive" : ""}`}>
      <div className="playerCardBody">
        {sidebar}
        <div className="playerContent">{content}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  const narrativeText = useMemo(() => {
    if (state.phase === "intro") return introNarration(state);
    if (state.phase === "combat") return combatNarration(state);
    if (state.phase === "outro") return outroNarration(state);

    if (state.phase === "done") {
      const headline =
        state.endResult === "defeat"
          ? "DEFEAT"
          : state.endResult === "victory"
            ? "VICTORY"
            : "DONE";

      const end = state.endMessage ?? "Scenario complete.";
      return `${headline}: ${end}\n\nThe session ends. The storm moves on.`;
    }

    return "";
  }, [state]);

  return (
    <div className="appShell2">
      {/* TOP STRIP */}
      <div className="topStrip">
        {/* small environment image */}
        <div className="envCardSmall">
          <div className="envImageWrapSmall">
            <img
              className="envImage"
              src={state.environmentImageUrl}
              alt={state.environmentTitle}
            />
          </div>
          <div className="envTitleSmall">{state.environmentTitle}</div>
        </div>

        {/* narration card (top middle, primary) */}
        <div className="narrationCard">
          <div className="paneHeader">Narration</div>
          <pre className="narrativeText">{narrativeText}</pre>

          <div className="narrativeActions">
            {state.phase === "intro" && (
              <button
                className="btn btnPrimary"
                onClick={() => dispatch({ type: "INTRO_ADVANCE" })}>
                Advance to combat
              </button>
            )}

            {state.phase === "combat" && (
              <button
                className="btn btnPrimary"
                onClick={() => dispatch({ type: "OUTRO_ADVANCE" })}>
                Advance to wrap-up
              </button>
            )}

            {state.phase === "outro" && (
              <button
                className="btn"
                onClick={() => dispatch({ type: "OUTRO_ADVANCE" })}>
                End scenario
              </button>
            )}

            {state.phase === "done" && (
              <button
                className="btn btnPrimary"
                onClick={() => dispatch({ type: "RESET" })}>
                Play Again
              </button>
            )}

            <button className="btn" onClick={() => dispatch({ type: "RESET" })}>
              Reset
            </button>
          </div>
        </div>

        {/* enemy area (empty until combat) */}
        <div className="enemySlot">
          {state.phase === "combat" ? (
            <div className="enemyCard">
              <div className="paneHeader">Enemy</div>
              <div className="enemyName">{state.enemy.name}</div>
              <div className="enemyStat">
                <span className="statLabel">Hits remaining</span>
                <span className="statValue">{state.enemy.hitsRemaining}</span>
              </div>
              <div className="enemyStat">
                <span className="statLabel">To-hit</span>
                <span className="statValue">
                  d20 ≥ {state.enemy.armorClass}
                </span>
              </div>
              <div className="enemyHint">
                Each hit removes <b>1</b> from the counter.
              </div>
              <div className="enemyHint">
                A natural 20 roll removes <b>2</b> from the counter.
              </div>
            </div>
          ) : (
            <div className="enemyCardPlaceholder">
              {/* intentionally empty */}
            </div>
          )}
        </div>
      </div>

      {/* PLAYERS GRID (rest of space) */}
      <div className="playersGrid2">
        <PlayerCard
          state={state}
          playerId="p1"
          title="Character 1"
          dispatch={dispatch}
        />
        <PlayerCard
          state={state}
          playerId="p2"
          title="Character 2"
          dispatch={dispatch}
        />
        <PlayerCard
          state={state}
          playerId="p3"
          title="Character 3"
          dispatch={dispatch}
        />
        <PlayerCard
          state={state}
          playerId="p4"
          title="Character 4"
          dispatch={dispatch}
        />
      </div>
    </div>
  );
}
