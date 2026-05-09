interface Props {
  num: string;
  kicker: string;
  title: string;
}

export default function SectionHeader({ num, kicker, title }: Props) {
  return (
    <header className="jh-sec-head">
      <div className="jh-sec-head__top">
        <span className="jh-sec-num">{num}</span>
        <span className="jh-kicker">{kicker}</span>
      </div>
      <h2 className="jh-sec-title">{title}</h2>
    </header>
  );
}
