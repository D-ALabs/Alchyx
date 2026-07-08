import * as React from "react";
import {
  AlchyxProvider,
  Button,
  useAlchyx,
  type Skin,
  type Accent,
} from "@alchyx/react";
import { accentsBySkin } from "@alchyx/tokens";

const SKINS: Skin[] = ["lab", "dark", "ark"];

function Toolbar() {
  const { skin, accent, setSkin, setAccent } = useAlchyx();
  const accents = accentsBySkin[skin];
  return (
    <header className="pg-toolbar">
      <div className="pg-wordmark">
        Alchyx<span className="pg-wordmark-sub"> / D-ALabs Design System</span>
      </div>
      <div className="pg-switch-group">
        <div className="pg-seg" role="group" aria-label="Skin">
          {SKINS.map((s) => (
            <button
              key={s}
              className="pg-seg-btn"
              data-active={skin === s || undefined}
              onClick={() => setSkin(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="pg-seg" role="group" aria-label="Accent">
          {accents.map((a) => (
            <button
              key={a}
              className="pg-seg-btn"
              data-active={(accent ?? accents[0]) === a || undefined}
              onClick={() => setAccent(a as Accent)}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

export function Section({
  index,
  eyebrow,
  title,
  count,
  children,
}: {
  index: string;
  eyebrow: string;
  title: string;
  count?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pg-section">
      <div className="pg-section-head">
        <div>
          <div className="pg-eyebrow">
            <span style={{ opacity: 0.5 }}>[</span>&nbsp; {index} — {eyebrow} &nbsp;
            <span style={{ opacity: 0.5 }}>]</span>
          </div>
          <h2 className="pg-h2">{title}</h2>
        </div>
        {count && <span className="pg-count">{count}</span>}
      </div>
      <div className="pg-grid">{children}</div>
    </section>
  );
}

export function Specimen({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pg-card">
      <div className="pg-card-cap">
        <span>{label}</span>
        {note && <span>{note}</span>}
      </div>
      <div className="pg-card-body">{children}</div>
    </div>
  );
}

function Gallery() {
  return (
    <main className="pg-main">
      <Section index="03" eyebrow="Buttons & links" title="Actions." count="5 variants">
        <Specimen label="BT-01 · Primary" note="Accent">
          <Button>
            Request a demo <span aria-hidden>→</span>
          </Button>
        </Specimen>
        <Specimen label="BT-02 · Secondary" note="Outline">
          <Button variant="secondary">View our work</Button>
        </Specimen>
        <Specimen label="BT-03 · Ghost" note="Bare">
          <Button variant="ghost">Learn more</Button>
        </Specimen>
        <Specimen label="BT-04 · Sizes" note="sm / md / lg">
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Specimen>
        <Specimen label="BT-05 · Link + loading" note="States">
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <Button variant="link">
              All notes <span aria-hidden>→</span>
            </Button>
            <Button loading>Saving</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Specimen>
        <Specimen label="BT-06 · asChild" note="Renders an anchor">
          <Button asChild variant="secondary">
            <a href="https://example.com" target="_blank" rel="noreferrer">
              Open link <span aria-hidden>→</span>
            </a>
          </Button>
        </Specimen>
      </Section>
    </main>
  );
}

export function App() {
  const [skin, setSkin] = React.useState<Skin>("lab");
  const [accent, setAccent] = React.useState<Accent | undefined>(undefined);
  return (
    <AlchyxProvider
      skin={skin}
      accent={accent}
      onSkinChange={setSkin}
      onAccentChange={setAccent}
      className="pg-root"
    >
      <Toolbar />
      <Gallery />
      <footer className="pg-footer">
        Alchyx — D-ALabs, LLC · one accent, three skins.
      </footer>
    </AlchyxProvider>
  );
}
