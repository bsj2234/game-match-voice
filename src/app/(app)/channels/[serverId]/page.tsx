import { redirect } from "next/navigation";
import { defaultChannelId, getCommunity } from "@/lib/mock-data";

export default async function ServerIndexPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const community = getCommunity(serverId);
  if (!community) {
    redirect("/channels/valorant-kr/general");
  }
  redirect(`/channels/${serverId}/${defaultChannelId(serverId)}`);
}
