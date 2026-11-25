interface Props {
  round: number;
  onMenu: () => void;
}

export function CenterBar({ round, onMenu }: Props) {
  return (
    <div className="center-bar">
      <div className="round" data-testid="round">
        Runde {round}
      </div>
      <button type="button" className="icon-btn" onClick={onMenu} aria-label="Menü">
        ☰
      </button>
    </div>
  );
}
