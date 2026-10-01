import { redirect } from "next/navigation";
import { ChatArea } from "@/components/ChatArea";
import { defaultChannelId, getChannel, getCommunity } from "@/lib/mock-data";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ serverId: string; channelId: string }>;
}) {
  const { serverId, channelId } = await params;
  const community = getCommunity(serverId);

  if (!community) {
    redirect("/match");
  }

  const resolved = getChannel(serverId, channelId);
  if (!resolved) {
    redirect(`/channels/${serverId}/${defaultChannelId(serverId)}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-6 md:px-8 md:py-8">
      <ChatArea community={community} channel={resolved.channel} />
    </div>
  );
}
