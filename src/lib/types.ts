export type ChannelType = "text" | "voice";

export type Member = {
  id: string;
  name: string;
  status: "online" | "idle" | "dnd" | "offline";
  games: string[];
  inVoice?: boolean;
  muted?: boolean;
  deafened?: boolean;
};

export type Channel = {
  id: string;
  name: string;
  type: ChannelType;
  topic?: string;
  members?: string[];
};

export type Category = {
  id: string;
  name: string;
  channels: Channel[];
};

export type Community = {
  id: string;
  name: string;
  short: string;
  color: string;
  description: string;
  games: string[];
  categories: Category[];
};

export type ChatMessage = {
  id: string;
  authorId: string;
  content: string;
  timestamp: string;
};

export type MatchRoom = {
  id: string;
  title: string;
  game: string;
  communityId: string;
  channelId: string;
  players: number;
  maxPlayers: number;
  tags: string[];
};
