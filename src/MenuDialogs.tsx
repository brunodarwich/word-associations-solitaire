import type { Dispatch, SetStateAction } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Modal } from "./Modal";
import { defaultSave } from "./storage";
import type { Save } from "./storage";
export type Menu = "help" | "settings" | "reset" | "restart" | null;
export function MenuDialogs({
  modal,
  setModal,
  save,
  setSave,
  restart,
  onReset,
}: {
  modal: Menu;
  setModal: Dispatch<SetStateAction<Menu>>;
  save: Save;
  setSave: Dispatch<SetStateAction<Save>>;
  restart: () => void;
  onReset: () => void;
}) {
  return (
    <>
      {modal === "help" && (
        <Modal
          title="Tudo começa com uma conexão."
          onClose={() => setModal(null)}
        >
          <p className="muted">
            Seu objetivo é reunir todas as palavras em suas categorias, antes de
            acabar o limite de jogadas.
          </p>
          <ol className="rules">
            <li>
              <strong>Abra uma categoria.</strong> Leve uma carta com coroa a um
              dos três espaços de coleta.
            </li>
            <li>
              <strong>Encontre as quatro palavras.</strong> Ao completar um
              grupo, ele sai da mesa e libera o espaço.
            </li>
            <li>
              <strong>Descubra as cartas.</strong> Só a última carta exposta de
              cada coluna pode se mover. Empilhe cartas da mesma categoria;
              colunas vazias aceitam qualquer carta.
            </li>
            <li>
              <strong>Use o monte.</strong> Compre uma carta por vez. Só o topo
              do descarte está disponível. Quando o monte acabar, recicle o
              descarte.
            </li>
            <li>
              <strong>Cuide das jogadas.</strong> Mover, comprar e reciclar
              custam uma jogada. Tentativas inválidas são gratuitas.
            </li>
          </ol>
          <p className="muted">
            Você tem três dicas e três desfazeres por tentativa. Sem cronômetro.
            Reinicie quando quiser.
          </p>
          <p className="muted">
            Use toque, arraste ou Tab + Enter para selecionar uma carta e seu
            destino. Toque novamente na carta para cancelar a seleção.
          </p>
          <button className="primary full" onClick={() => setModal(null)}>
            Entendi, vamos conectar <ArrowRight size={17} />
          </button>
        </Modal>
      )}
      {modal === "settings" && (
        <Modal title="Do seu jeito." onClose={() => setModal(null)}>
          <p className="muted">
            Uma experiência confortável faz parte do jogo.
          </p>
          <label className="setting">
            <span>
              <strong>Sons suaves</strong>
              <small>Um toque sonoro a cada jogada.</small>
            </span>
            <input
              type="checkbox"
              checked={save.prefs.sound}
              onChange={(e) =>
                setSave({
                  ...save,
                  prefs: { ...save.prefs, sound: e.target.checked },
                })
              }
            />
          </label>
          <label className="setting">
            <span>
              <strong>Reduzir movimentos</strong>
              <small>Desativa as transições da interface.</small>
            </span>
            <input
              type="checkbox"
              checked={save.prefs.reducedMotion}
              onChange={(e) =>
                setSave({
                  ...save,
                  prefs: { ...save.prefs, reducedMotion: e.target.checked },
                })
              }
            />
          </label>
          <div className="setting-note">
            O progresso é salvo somente neste navegador. Limpar os dados do
            navegador também apaga suas partidas.
          </div>
          <button className="danger-button" onClick={() => setModal("reset")}>
            Apagar meu progresso
          </button>
        </Modal>
      )}
      {modal === "reset" && (
        <Modal
          title="Começar uma nova jornada?"
          onClose={() => setModal("settings")}
        >
          <p>
            Isso apaga todas as estrelas, fases desbloqueadas e a partida salva
            neste navegador.
          </p>
          <div className="modal-actions">
            <button className="secondary" onClick={() => setModal("settings")}>
              Cancelar
            </button>
            <button
              className="primary"
              onClick={() => {
                setSave(defaultSave());
                onReset();
              }}
            >
              Apagar progresso
            </button>
          </div>
        </Modal>
      )}
      {modal === "restart" && (
        <Modal title="Uma nova perspectiva?" onClose={() => setModal(null)}>
          <p>
            A mesa volta à distribuição original, com todas as jogadas, três
            dicas e três desfazeres.
          </p>
          <div className="modal-actions">
            <button className="secondary" onClick={() => setModal(null)}>
              Continuar jogando
            </button>
            <button
              className="primary"
              onClick={() => {
                restart();
              }}
            >
              <RotateCcw size={16} />
              Reiniciar fase
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
