import { redirect } from "next/navigation";
import { getCommunity } from "@/lib/mock-data";

export default async function ServerIndexPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const community = getCommunity(serverId);
  if (!community) {
    redirect("/match");
  }
  const voice =
    community.categories
      .flatMap((c) => c.channels)
      .find((ch) => ch.type === "voice") ?? community.categories[0]?.channels[0];
  redirect(`/channels/${serverId}/${voice?.id ?? "general"}`);
}
