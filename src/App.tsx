import { useEffect, useState } from "react";

import { act, createGame, stars, status } from "./engine";
import { levels } from "./levels";
import { loadSave, recordWin, STORAGE_KEY } from "./storage";
import type { Save } from "./storage";
import type { Action } from "./types";
import { Board } from "./Board";
import { Home, Campaign } from "./Screens";
import { chime } from "./sound";
import { SiteHeader } from "./SiteHeader";
import { MenuDialogs } from "./MenuDialogs";
import { ResultDialog } from "./ResultDialog";

export default function App() {
  const [loaded] = useState(loadSave),
    [save, setSave] = useState(loaded.save),
    [warning, setWarning] = useState(loaded.warning);
  const [screen, setScreen] = useState<"home" | "levels" | "game">("home");
  const [modal, setModal] = useState<
    "help" | "settings" | "reset" | "restart" | null
  >(null);
  const [resultDismissed, setResultDismissed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const game = save.game,
    level = game ? levels[game.levelId - 1] : levels[0];
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    } catch {
      setWarning(
        "Não foi possível salvar o progresso neste navegador. A partida continua disponível enquanto esta página estiver aberta.",
      );
    }
  }, [save]);
  useEffect(() => {
    document.documentElement.classList.toggle(
      "reduce-motion",
      save.prefs.reducedMotion,
    );
  }, [save.prefs.reducedMotion]);
  function navigate(to: typeof screen) {
    setScreen(to);
    setModal(null);
    setResultDismissed(false);
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() =>
      document.getElementById("content")?.focus({ preventScroll: true }),
    );
  }
  function start(id?: number) {
    setAttempt((n) => n + 1);
    if (id !== undefined) {
      if (id > save.unlocked) return;
      setSave((s) => ({ ...s, game: createGame(levels[id - 1]) }));
    } else if (!game)
      setSave((s) => ({ ...s, game: createGame(levels[s.unlocked - 1]) }));
    navigate("game");
  }
  function dispatch(action: Action) {
    if (!game) return false;
    const next = act(level, game, action);
    if (next === game) return false;
    let updated: Save = { ...save, game: next };
    const won = status(level, next) === "won";
    if (won) updated = recordWin(updated, level.id, stars(next));
    setSave(updated);
    setResultDismissed(false);
    if (save.prefs.sound && action.type !== "hint") chime(won);
    return true;
  }
  const result = game ? status(level, game) : "playing";
  return (
    <>
      <a className="skip-link" href="#content">
        Pular para o conteúdo
      </a>
      <SiteHeader
        screen={screen}
        onHome={() => navigate("home")}
        onLevels={() => navigate("levels")}
        onHelp={() => setModal("help")}
        onSettings={() => setModal("settings")}
      />
      <div id="content" key={screen} className="screen-enter" tabIndex={-1}>
        {warning && (
          <div className="warning" role="status">
            {warning}
            <button onClick={() => setWarning("")} aria-label="Fechar aviso">
              ×
            </button>
          </div>
        )}
        {screen === "home" ? (
          <Home
            save={save}
            onStart={() => start()}
            onLevels={() => navigate("levels")}
          />
        ) : screen === "levels" ? (
          <Campaign save={save} onStart={(id) => start(id)} />
        ) : game ? (
          <Board
            key={`${game.levelId}-${attempt}`}
            level={level}
            game={game}
            dispatch={dispatch}
            onBack={() => navigate("levels")}
            onRestart={() => setModal("restart")}
          />
        ) : null}
      </div>
      <footer className="site-footer">
        <span>Uma pausa. Uma conexão. Uma descoberta.</span>
        <span>
          FEITO PARA JOGAR COM CALMA <span aria-hidden="true">✧</span>
        </span>
      </footer>
      <MenuDialogs
        modal={modal}
        setModal={setModal}
        save={save}
        setSave={setSave}
        restart={() => start(level.id)}
        onReset={() => navigate("home")}
      />
      {screen === "game" &&
        game &&
        result !== "playing" &&
        !resultDismissed &&
        !modal && (
          <ResultDialog
            game={game}
            level={level}
            result={result}
            onClose={() =>
              result === "won" ? navigate("levels") : setResultDismissed(true)
            }
            onNext={() =>
              level.id < 30 ? start(level.id + 1) : navigate("levels")
            }
            onReplay={() => start(level.id)}
            onUndo={() => dispatch({ type: "undo" })}
          />
        )}
    </>
  );
}
