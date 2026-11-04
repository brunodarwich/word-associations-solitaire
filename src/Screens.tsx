import {
  ArrowRight,
  BookOpen,
  Layers,
  Lock,
  Star,
  Sparkles,
  Leaf,
  Clock3,
} from "lucide-react";
import { levels } from "./levels";
import type { Save } from "./storage";
export function StarRow({ count = 0 }: { count?: number }) {
  return (
    <span className="stars" aria-label={`${count} de 3 estrelas`}>
      {[1, 2, 3].map((n) => (
        <Star
          key={n}
          size={16}
          fill={n <= count ? "currentColor" : "none"}
          opacity={n <= count ? 1 : 0.3}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
export function Home({
  save,
  onStart,
  onLevels,
}: {
  save: Save;
  onStart: () => void;
  onLevels: () => void;
}) {
  const completed = Object.keys(save.stars).length;
  return (
    <main className="home">
      <section className="intro">
        <div className="eyebrow">
          <span /> UM RESPIRO PARA A SUA MENTE
        </div>
        <h1>
          Uma palavra.
          <br />
          Muitas <em>conexões.</em>
        </h1>
        <p className="lead">
          Um pouco de paciência, um olhar curioso.
          <br className="desktop-break" /> Encontre o que une as palavras e
          coloque
          <br className="desktop-break" /> cada carta em seu lugar.
        </p>
        <div className="hero-actions">
          <button className="primary" onClick={onStart}>
            {save.game ? "Continuar partida" : "Começar a jogar"}
            <ArrowRight size={19} />
          </button>
          <button className="text-button" onClick={onLevels}>
            Explorar as fases
          </button>
        </div>
        <div className="progress-note">
          <span className="tiny-cards">
            <Layers size={20} />
          </span>
          <span>
            {completed
              ? `${completed} de 30 fases concluídas`
              : "30 fases para descobrir"}
            <small>Em português. No seu ritmo.</small>
          </span>
        </div>
      </section>
      <section
        className="preview"
        aria-label="Associe palavras como violão e harpa à categoria Instrumentos de corda"
      >
        <div className="preview-stage">
          <div className="preview-orbit" />
          <span className="floating-note">
            <Sparkles size={16} /> Tudo se conecta.
          </span>
          <div className="preview-card back-card">
            <span>✧</span>
          </div>
          <div className="preview-card category-preview">
            <span className="card-eyebrow">CATEGORIA</span>
            <span className="preview-symbol">♧</span>
            <strong>
              Instrumentos
              <br />
              de corda
            </strong>
            <span className="preview-counter">2 de 4 palavras</span>
          </div>
          <div className="preview-card word-preview first-word">
            <span className="card-corner">✧</span>
            <strong>violão</strong>
            <span className="card-corner end">✧</span>
          </div>
          <div className="preview-card word-preview second-word">
            <span className="card-corner">✧</span>
            <strong>harpa</strong>
            <span className="card-corner end">✧</span>
          </div>
          <span className="preview-caption">ASSOCIE. ORGANIZE. DESCUBRA.</span>
        </div>
      </section>
      <details className="about-game">
        <summary>Sobre o jogo</summary>
        <section className="home-bottom">
          <div>
            <BookOpen size={22} />
            <span>
              <strong>Palavras que desafiam</strong>
              <small>Da primeira conexão às grandes ideias.</small>
            </span>
          </div>
          <div>
            <Clock3 size={22} />
            <span>
              <strong>Sem pressa, com estratégia</strong>
              <small>Cada jogada abre uma possibilidade.</small>
            </span>
          </div>
          <div>
            <Leaf size={22} />
            <span>
              <strong>Seu momento de pausa</strong>
              <small>Gratuito, sem anúncios ou cadastro.</small>
            </span>
          </div>
        </section>
      </details>
    </main>
  );
}
const chapters = [
  "Primeiras conexões",
  "Ampliar o repertório",
  "Um olhar mais atento",
  "Conexões conceituais",
  "Pensar à frente",
  "Domínio das palavras",
];
export function Campaign({
  save,
  onStart,
}: {
  save: Save;
  onStart: (id: number) => void;
}) {
  return (
    <main className="campaign">
      <div className="eyebrow">SUA JORNADA</div>
      <h1>Uma descoberta de cada vez.</h1>
      <p className="muted">30 fases. Novas conexões a cada mesa.</p>
      <div className="campaign-summary">
        <span>{Object.keys(save.stars).length} / 30 fases</span>
        <span>
          <Star size={16} />
          {Object.values(save.stars).reduce((a, b) => a + b, 0)} / 90 estrelas
        </span>
      </div>
      <progress
        className="journey-progress"
        value={Object.keys(save.stars).length}
        max={30}
        aria-label="Progresso nas 30 fases"
      />
      {chapters.map((name, chapter) => (
        <section key={name} className="chapter">
          <h2>
            <span>0{chapter + 1}</span>
            {name}
          </h2>
          <div className="level-grid">
            {levels.slice(chapter * 5, chapter * 5 + 5).map((l) => (
              <button
                key={l.id}
                className={`level-tile ${l.id === save.unlocked ? "current" : ""}`}
                disabled={l.id > save.unlocked}
                aria-current={l.id === save.unlocked ? "step" : undefined}
                onClick={() => onStart(l.id)}
              >
                <span className="level-number">
                  {l.id > save.unlocked ? (
                    <>
                      <Lock size={14} />
                      <span>{String(l.id).padStart(2, "0")}</span>
                    </>
                  ) : (
                    String(l.id).padStart(2, "0")
                  )}
                </span>
                <strong>{l.title}</strong>
                <span className="muted">
                  {l.cards.length} cartas · {l.groups.length} grupos
                </span>
                <StarRow count={save.stars[l.id]} />
                {l.id === save.unlocked && (
                  <small>
                    Próxima descoberta <ArrowRight size={12} />
                  </small>
                )}
              </button>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
