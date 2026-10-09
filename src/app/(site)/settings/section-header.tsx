export function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 border-b pb-4">
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
