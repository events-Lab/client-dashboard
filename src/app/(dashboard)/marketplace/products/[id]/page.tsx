import { Suspense } from "react";
import { MarketplaceProductDetailView } from "./view";

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
