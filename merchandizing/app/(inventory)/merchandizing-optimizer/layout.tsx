export const metadata = {
  title: "Assortment Optimizer",
};

export default function MerchandizingOptimizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full w-full overflow-y-auto p-6">
      {children}
    </div>
  );
}
