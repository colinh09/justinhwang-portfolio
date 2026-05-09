interface Props {
  swatch: string;
  label: string;
  sector?: string;
}

export default function ProjectThumb({ swatch, label, sector }: Props) {
  return (
    <div className="jh-thumb" style={{ background: swatch }}>
      <div className="jh-thumb__grid" />
      <div className="jh-thumb__label">{label}</div>
      {sector && <div className="jh-thumb__sector">{sector}</div>}
    </div>
  );
}
