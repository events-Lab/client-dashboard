import { Suspense } from "react";
import { EventDetailView } from "./view";

async function EventDetailLoader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventDetailView id={id} />;
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <p className="m-0 text-sm text-secondary-500">Loading…</p>
      }
    >
      <EventDetailLoader params={params} />
    </Suspense>
  );
}
