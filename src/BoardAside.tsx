import { Layers, Check } from "lucide-react";
import type { Board, Level } from "./types";
export function BoardAside({
  b,
  level,
  tutorial,
}: {
  b: Board;
  level: Level;
  tutorial?: string;
}) {
  return (
    <aside className="game-aside">
      <div className="aside-icon">
        <Layers size={23} />
      </div>
      <h2>
        Encontre o fio
        <br />
        da conexão.
      </h2>
      <p>
        Reúna as quatro palavras de cada categoria. Complete os grupos para
        liberar espaço na mesa.
      </p>
      <div className="aside-rule" />
      {tutorial && (
        <div className="tutorial">
          <span>UM PASSO DE CADA VEZ</span>
          <p>{tutorial}</p>
        </div>
      )}
      <div className="completed-list">
        <span>DESCOBERTAS</span>
        {b.completed.length ? (
          b.completed.map((g) => (
            <p key={g}>
              <Check size={14} />
              {level.groups[g]}
            </p>
          ))
        ) : (
          <p className="muted">Suas conexões aparecem aqui.</p>
        )}
      </div>
      <small className="aside-footer">Sem pressa. Cada jogada importa.</small>
    </aside>
  );
}
