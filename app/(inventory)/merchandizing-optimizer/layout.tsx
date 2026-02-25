export const metadata = {
  title: "Assortment Optimizer",
};

export default function MerchandizingOptimizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      {children}
    </div>
  );
}
