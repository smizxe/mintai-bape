export function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
  inverted = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  center?: boolean;
  inverted?: boolean;
}) {
  return (
    <div className={`section-heading ${center ? "section-heading-center" : ""} ${inverted ? "section-heading-inverted" : ""}`}>
      <div className="inventory-eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
