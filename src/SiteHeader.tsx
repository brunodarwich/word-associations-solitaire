import { HelpCircle, Layers, Settings2, Leaf } from "lucide-react";
export function SiteHeader({
  screen,
  onHome,
  onLevels,
  onHelp,
  onSettings,
}: {
  screen: string;
  onHome: () => void;
  onLevels: () => void;
  onHelp: () => void;
  onSettings: () => void;
}) {
  return (
    <header className="site-header">
      <button
        className="brand"
        aria-label="Paciência das Palavras, início"
        onClick={onHome}
      >
        <span className="brand-mark">
          <Leaf size={23} />
        </span>
        <span>
          Paciência<span className="brand-subtitle">DAS PALAVRAS</span>
        </span>
      </button>
      <nav aria-label="Navegação principal">
        <button
          aria-label="As fases"
          className={screen === "levels" ? "active" : ""}
          onClick={onLevels}
        >
          <Layers size={16} />
          <span>As fases</span>
        </button>
        <button aria-label="Como jogar" onClick={onHelp}>
          <HelpCircle size={17} />
          <span>Como jogar</span>
        </button>
        <span className="nav-divider" />
        <button
          className="icon-button"
          onClick={onSettings}
          aria-label="Configurações"
        >
          <Settings2 size={19} />
        </button>
      </nav>
    </header>
  );
}
