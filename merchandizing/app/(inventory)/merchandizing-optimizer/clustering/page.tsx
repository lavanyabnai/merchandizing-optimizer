"use client";

import { Clustering } from "@/features/assortment/components/clustering";

export default function ClusteringPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Store Clustering</h1>
      </div>
      <Clustering useDemoData={false} />
    </div>
  );
}
