interface Props {
  swatch: string;
  label: string;
  image?: string;
}

export default function ProjectThumb({ swatch, label, image }: Props) {
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
    </div>
  );
}
