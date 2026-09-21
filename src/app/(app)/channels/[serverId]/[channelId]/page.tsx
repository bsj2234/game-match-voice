import { redirect } from "next/navigation";
import { ChannelSidebar } from "@/components/ChannelSidebar";
import { ChatArea } from "@/components/ChatArea";
import { MemberList } from "@/components/MemberList";
import { defaultChannelId, getChannel, getCommunity } from "@/lib/mock-data";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ serverId: string; channelId: string }>;
}) {
  const { serverId, channelId } = await params;
  const community = getCommunity(serverId);

  if (!community) {
    redirect("/channels/valorant-kr/general");
  }

  const resolved = getChannel(serverId, channelId);
  if (!resolved) {
    redirect(`/channels/${serverId}/${defaultChannelId(serverId)}`);
  }

  return (
    <>
      <ChannelSidebar community={community} activeChannelId={resolved.channel.id} />
      <ChatArea community={community} channel={resolved.channel} />
      <MemberList />
    </>
  );
}
