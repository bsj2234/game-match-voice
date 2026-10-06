import type { ChatMessage, Community, MatchRoom, Member } from "./types";

export const currentUser: Member = {
  id: "u-me",
  name: "You",
  status: "online",
  games: ["Valorant", "League of Legends"],
};

export const members: Member[] = [
  currentUser,
  {
    id: "u1",
    name: "Nova",
    status: "online",
    games: ["Valorant"],
    inVoice: true,
  },
  {
    id: "u2",
    name: "Rook",
    status: "online",
    games: ["Valorant", "Apex Legends"],
    inVoice: true,
    muted: true,
  },
  {
    id: "u3",
    name: "Mira",
    status: "idle",
    games: ["League of Legends"],
  },
  {
    id: "u4",
    name: "Kite",
    status: "dnd",
    games: ["Overwatch 2"],
  },
  {
    id: "u5",
    name: "Pex",
    status: "offline",
    games: ["Minecraft"],
  },
  {
    id: "u6",
    name: "Ash",
    status: "online",
    games: ["Valorant", "TFT"],
  },
];

export const communities: Community[] = [
  {
    id: "valorant-kr",
    name: "Valorant KR",
    short: "V",
    color: "#ff4655",
    description: "발로란트 파티·전략·랭크 큐",
    games: ["Valorant"],
    categories: [
      {
        id: "info",
        name: "안내",
        channels: [
          {
            id: "welcome",
            name: "환영합니다",
            type: "text",
            topic: "서버 규칙과 소개",
          },
          {
            id: "announcements",
            name: "공지",
            type: "text",
            topic: "이벤트·패치 노트",
          },
        ],
      },
      {
        id: "chat",
        name: "채팅",
        channels: [
          {
            id: "general",
            name: "일반",
            type: "text",
            topic: "자유롭게 이야기해요",
          },
          {
            id: "lfg",
            name: "파티구하기",
            type: "text",
            topic: "랭크/언랭 파티 모집",
          },
          {
            id: "clips",
            name: "클립",
            type: "text",
          },
        ],
      },
      {
        id: "voice",
        name: "음성 채널",
        channels: [
          {
            id: "lobby",
            name: "로비",
            type: "voice",
            members: ["u1", "u2"],
          },
          {
            id: "rank-duo",
            name: "랭크 듀오",
            type: "voice",
            members: [],
          },
          {
            id: "five-stack",
            name: "5인큐",
            type: "voice",
            members: [],
          },
        ],
      },
    ],
  },
  {
    id: "lol-party",
    name: "LoL Party",
    short: "L",
    color: "#0bc6f1",
    description: "리그 오브 레전드 듀오·내전",
    games: ["League of Legends", "TFT"],
    categories: [
      {
        id: "text",
        name: "텍스트 채널",
        channels: [
          { id: "general", name: "일반", type: "text" },
          { id: "aram", name: "칼바람", type: "text" },
        ],
      },
      {
        id: "voice",
        name: "음성 채널",
        channels: [
          { id: "duo", name: "듀오", type: "voice", members: ["u3"] },
          { id: "flex", name: "자유랭", type: "voice", members: [] },
        ],
      },
    ],
  },
  {
    id: "indie-cozy",
    name: "Indie Cozy",
    short: "I",
    color: "#3ba55d",
    description: "인디·협동·힐링 게임 커뮤니티",
    games: ["Minecraft", "Stardew Valley", "It Takes Two"],
    categories: [
      {
        id: "hangout",
        name: "어울리기",
        channels: [
          { id: "general", name: "수다", type: "text" },
          { id: "screenshots", name: "스크린샷", type: "text" },
        ],
      },
      {
        id: "voice",
        name: "음성",
        channels: [
          { id: "chill", name: "힐링방", type: "voice", members: [] },
          { id: "coop", name: "협동", type: "voice", members: [] },
        ],
      },
    ],
  },
];

export const messagesByChannel: Record<string, ChatMessage[]> = {
  "valorant-kr:general": [
    {
      id: "m1",
      authorId: "u1",
      content: "오늘 저녁 랭크 돌릴 사람?",
      timestamp: "오늘 오후 8:12",
    },
    {
      id: "m2",
      authorId: "u6",
      content: "저요. 플래~다이아 구간이면 바로 들어가겠습니다",
      timestamp: "오늘 오후 8:13",
    },
    {
      id: "m3",
      authorId: "u2",
      content: "음성 로비에 있어요. 들어와 보세요",
      timestamp: "오늘 오후 8:14",
    },
  ],
  "valorant-kr:lfg": [
    {
      id: "m4",
      authorId: "u6",
      content: "[LFG] 듀오 구함 · 컨트롤러 · 마이크 O",
      timestamp: "오늘 오후 7:40",
    },
  ],
  "valorant-kr:welcome": [
    {
      id: "m5",
      authorId: "u1",
      content: "Valorant KR에 오신 걸 환영합니다! 취향 맞는 방을 찾아 음성으로 바로 합류하세요.",
      timestamp: "어제 오후 3:00",
    },
  ],
  "lol-party:general": [
    {
      id: "m6",
      authorId: "u3",
      content: "칼바람 한판 어때요?",
      timestamp: "오늘 오후 6:22",
    },
  ],
  "indie-cozy:general": [
    {
      id: "m7",
      authorId: "u5",
      content: "마인크래프트 생존 서버 새로 열었어요 🌱",
      timestamp: "오늘 오후 5:01",
    },
  ],
};

export const matchRooms: MatchRoom[] = [
  {
    id: "r1",
    title: "플래티넘 듀오 구함",
    game: "Valorant",
    communityId: "valorant-kr",
    channelId: "rank-duo",
    players: 2,
    maxPlayers: 2,
    tags: ["랭크", "듀오", "마이크"],
  },
  {
    id: "r2",
    title: "5인큐 바로 시작",
    game: "Valorant",
    communityId: "valorant-kr",
    channelId: "five-stack",
    players: 3,
    maxPlayers: 5,
    tags: ["5인", "언랭 OK"],
  },
  {
    id: "r3",
    title: "자유랭 서폿+원딜",
    game: "League of Legends",
    communityId: "lol-party",
    channelId: "flex",
    players: 2,
    maxPlayers: 5,
    tags: ["바텀", "마이크"],
  },
  {
    id: "r4",
    title: "마인크래프트 힐링 생존",
    game: "Minecraft",
    communityId: "indie-cozy",
    channelId: "chill",
    players: 1,
    maxPlayers: 8,
    tags: ["협동", "캐주얼"],
  },
];

export const gameTags = [
  "Valorant",
  "League of Legends",
  "Apex Legends",
  "Overwatch 2",
  "Minecraft",
  "TFT",
  "Stardew Valley",
  "It Takes Two",
  "Lost Ark",
  "MapleStory",
  "PUBG",
  "Fortnite",
  "Genshin Impact",
  "Destiny 2",
  "CS2",
  "Dota 2",
  "Roblox",
  "Among Us",
  "Dead by Daylight",
  "Baldur's Gate 3",
];

export function getCommunity(id: string) {
  return communities.find((c) => c.id === id);
}

export function getChannel(communityId: string, channelId: string) {
  const community = getCommunity(communityId);
  if (!community) return null;
  for (const category of community.categories) {
    const channel = category.channels.find((c) => c.id === channelId);
    if (channel) return { community, category, channel };
  }
  return null;
}

export function getMember(id: string) {
  return members.find((m) => m.id === id);
}

export function getMessages(communityId: string, channelId: string) {
  return messagesByChannel[`${communityId}:${channelId}`] ?? [];
}

export function defaultChannelId(communityId: string) {
  const community = getCommunity(communityId);
  return community?.categories[0]?.channels[0]?.id ?? "general";
}
