import { Suspense } from "react";
import { MarketplaceProductDetailView } from "./view";

async function ProductDetailLoader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MarketplaceProductDetailView id={id} />;
}

export default function MarketplaceProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={<p className="m-0 text-sm text-secondary-500">Loading…</p>}
    >
      <ProductDetailLoader params={params} />
    </Suspense>
  );
}
