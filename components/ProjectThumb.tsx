interface Props {
  swatch: string;
  label: string;
  sector?: string;
  image?: string;
}

export default function ProjectThumb({ swatch, label, sector, image }: Props) {
  return (
    <div className="jh-thumb" style={{ background: swatch }}>
      {image ? (
        <img
          src={image}
          alt={label}
          className="jh-thumb__img"
          loading="lazy"
        />
      ) : (
        <div className="jh-thumb__grid" />
      )}
      <div className="jh-thumb__label">{label}</div>
      {sector && <div className="jh-thumb__sector">{sector}</div>}
    </div>
  );
}
