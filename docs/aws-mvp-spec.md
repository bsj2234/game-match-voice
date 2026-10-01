# AWS MVP — DynamoDB + Signaling Spec

GameMatch Voice: 매칭 서버 + WebRTC P2P(실패 시 TURN) 기준.

## 1. DynamoDB 테이블

단일 테이블도 가능하지만, MVP는 **역할별 3테이블**이 읽기 쉽고 디버깅이 쉽습니다.

### 1.1 `gmv-users`

| Attribute | Type | 설명 |
|-----------|------|------|
| `userId` (PK) | S | `usr_...` |
| `displayName` | S | 표시 이름 |
| `email` | S | (선택) Cognito sub와 매핑 |
| `games` | L\<S\> | 선호 게임 태그 |
| `status` | S | `online` \| `idle` \| `offline` |
| `createdAt` | S | ISO8601 |
| `updatedAt` | S | ISO8601 |

**GSI (선택):** `email-index` — `email` (PK) → 로그인/조회용.

---

### 1.2 `gmv-rooms`

열린 파티(매칭 보드에 노출).

| Attribute | Type | 설명 |
|-----------|------|------|
| `roomId` (PK) | S | `room_...` |
| `hostId` | S | 방장 `userId` |
| `title` | S | 방 제목 |
| `game` | S | 예: `Valorant` |
| `tags` | L\<S\> | `랭크`, `듀오`, `마이크` |
| `maxPlayers` | N | |
| `playerCount` | N | 현재 인원(비정규화, 갱신) |
| `playerIds` | L\<S\> | 참가자 userId 목록 |
| `voiceChannelId` | S | WebRTC 룸 키와 동일하게 사용 가능 |
| `status` | S | `open` \| `full` \| `closed` |
| `createdAt` | S | |
| `expiresAt` | N | TTL(초). 비활성 방 자동 삭제용 |

**GSI1 `game-status-index`**
- PK: `game`
- SK: `status#createdAt` (예: `open#2026-10-01T12:00:00Z`)
- 용도: 매칭 보드에서 게임별 열린 방 조회

**GSI2 `host-index` (선택)**
- PK: `hostId`
- SK: `createdAt`
- 용도: 내 방 목록

**TTL:** `expiresAt` 활성화. 방 생성/하트비트 시 +2~6시간 연장.

---

### 1.3 `gmv-signaling`

API Gateway WebSocket 연결 + 룸 멤버십.

| Attribute | Type | 설명 |
|-----------|------|------|
| `pk` (PK) | S | 아래 패턴 |
| `sk` (SK) | S | 아래 패턴 |
| `connectionId` | S | API GW connection id |
| `userId` | S | |
| `displayName` | S | |
| `roomId` | S | 음성 룸 id |
| `peerId` | S | 클라이언트 WebRTC peer id |
| `ttl` | N | 연결 정리용 TTL |

**키 패턴**

| 용도 | pk | sk |
|------|----|----|
| 연결 → 유저 | `CONN#${connectionId}` | `META` |
| 룸 → 피어 | `ROOM#${roomId}` | `PEER#${peerId}` |
| 유저 → 연결 | `USER#${userId}` | `CONN#${connectionId}` |

조회:
- 룸의 다른 피어: `pk = ROOM#roomId`, `sk begins_with PEER#`
- disconnect 시: `CONN#...` 조회로 room/peer 파악 후 삭제 + `peer-left` 브로드캐스트

---

## 2. REST API (매칭)

Base: `https://api.example.com/v1`

| Method | Path | 설명 |
|--------|------|------|
| `POST` | `/rooms` | 방 생성 |
| `GET` | `/rooms?game=Valorant&status=open` | 매칭 보드 목록 |
| `POST` | `/rooms/{roomId}/join` | 방 참가 (인원 +1) |
| `POST` | `/rooms/{roomId}/leave` | 방 퇴장 |
| `PATCH` | `/rooms/{roomId}` | 제목/태그/상태 (호스트만) |
| `GET` | `/me` | 내 프로필 |

### 2.1 `POST /rooms` body

```json
{
  "title": "플래티넘 듀오 구함",
  "game": "Valorant",
  "tags": ["랭크", "듀오", "마이크"],
  "maxPlayers": 2
}
```

### 2.2 `GET /rooms` response item

```json
{
  "roomId": "room_01H...",
  "title": "플래티넘 듀오 구함",
  "game": "Valorant",
  "tags": ["랭크", "듀오", "마이크"],
  "players": 1,
  "maxPlayers": 2,
  "hostId": "usr_...",
  "voiceChannelId": "room_01H...",
  "status": "open",
  "createdAt": "2026-10-01T14:00:00.000Z"
}
```

`voiceChannelId`는 WebRTC/시그널링 `roomId`로 그대로 사용.

---

## 3. WebSocket 시그널링

Endpoint: `wss://ws.example.com/voice`  
Auth: `$connect` 시 JWT(Cognito/Clerk) 쿼리 또는 헤더 검증.

### 3.1 클라이언트 → 서버

공통 envelope:

```json
{
  "action": "join-room",
  "requestId": "uuid",
  "payload": {}
}
```

#### `join-room`

```json
{
  "action": "join-room",
  "requestId": "...",
  "payload": {
    "roomId": "room_01H...",
    "peerId": "peer_...",
    "displayName": "Nova"
  }
}
```

서버:
1. `gmv-signaling`에 CONN/ROOM/USER 기록
2. 기존 룸 피어 목록을 요청자에게 `room-peers`로 응답
3. 다른 피어에게 `peer-joined` 브로드캐스트

#### `leave-room`

```json
{
  "action": "leave-room",
  "payload": { "roomId": "room_01H...", "peerId": "peer_..." }
}
```

#### `signal` (WebRTC SDP / ICE)

```json
{
  "action": "signal",
  "payload": {
    "roomId": "room_01H...",
    "from": "peer_a",
    "to": "peer_b",
    "type": "offer",
    "data": { }
  }
}
```

`type`: `offer` | `answer` | `ice`  
`data`: `RTCSessionDescriptionInit` 또는 `RTCIceCandidateInit` JSON.

서버는 **내용을 해석하지 않고** `to` 피어의 `connectionId`로 그대로 전달.

#### `heartbeat` (선택)

```json
{ "action": "heartbeat", "payload": { "roomId": "room_01H..." } }
```

방 TTL / presence 연장.

---

### 3.2 서버 → 클라이언트

#### `room-peers` (join 직후, 본인만)

```json
{
  "event": "room-peers",
  "payload": {
    "roomId": "room_01H...",
    "peers": [
      { "peerId": "peer_x", "userId": "usr_...", "displayName": "Rook" }
    ]
  }
}
```

기존 피어가 **새 참가자에게 offer**를 만듦 (글레어 방지: “이미 있던 쪽 → 새로 들어온 쪽”).

#### `peer-joined`

```json
{
  "event": "peer-joined",
  "payload": {
    "roomId": "room_01H...",
    "peer": {
      "peerId": "peer_y",
      "userId": "usr_...",
      "displayName": "Nova"
    }
  }
}
```

#### `peer-left`

```json
{
  "event": "peer-left",
  "payload": {
    "roomId": "room_01H...",
    "peerId": "peer_y"
  }
}
```

#### `signal` (중계)

```json
{
  "event": "signal",
  "payload": {
    "roomId": "room_01H...",
    "from": "peer_a",
    "to": "peer_b",
    "type": "offer",
    "data": { }
  }
}
```

#### `error`

```json
{
  "event": "error",
  "requestId": "...",
  "payload": { "code": "ROOM_FULL", "message": "방이 가득 찼습니다." }
}
```

에러 코드 예: `UNAUTHORIZED`, `ROOM_NOT_FOUND`, `ROOM_FULL`, `PEER_NOT_FOUND`, `RATE_LIMITED`.

---

## 4. 클라이언트 WebRTC 흐름

1. REST `POST /rooms/{id}/join` → 인원 확보  
2. `getUserMedia`  
3. WebSocket `join-room`  
4. `room-peers` / `peer-joined` 수신  
5. **기존 피어만** 신규에게 `offer` 생성 → `signal`  
6. 신규는 `answer` + 양방향 `ice`  
7. ICE: STUN + TURN URL (coturn)  
8. 퇴장: `leave-room` + REST `leave` + track stop  

```ts
iceServers: [
  { urls: "stun:stun.l.google.com:19302" },
  {
    urls: "turn:turn.example.com:3478",
    username: "...",
    credential: "...",
  },
]
```

TURN credential은 짧은 TTL의 temporary credential(REST로 발급) 권장.

---

## 5. Lambda 핸들러 맵 (참고)

| 트리거 | 함수 |
|--------|------|
| REST | `roomsCreate`, `roomsList`, `roomsJoin`, `roomsLeave` |
| WS `$connect` | auth + `CONN#` 기록 |
| WS `$disconnect` | 룸에서 제거 + `peer-left` |
| WS route `join-room` | 멤버십 + 브로드캐스트 |
| WS route `signal` | 타깃 connection PostToConnection |
| WS route `leave-room` | 정리 |

`PostToConnection` 410 Gone → 해당 연결 DynamoDB에서 삭제.

---

## 6. 보안·운영 체크리스트 (MVP)

- [ ] 모든 REST/WS에 JWT 검증  
- [ ] `signal`은 같은 `roomId`에 속한 peer끼리만 허용  
- [ ] 방당 인원·메시지 rate limit  
- [ ] TURN을 인터넷에 열 때 인증 + 방화벽(3478/UDP, 443/TCP 권장)  
- [ ] DynamoDB TTL로 stale connection/room 정리  
- [ ] CloudWatch 알람: 5xx, WS 연결 수, EC2 CPU/네트워크  

---

## 7. 현재 로컬 코드와의 대응

| 로컬 (지금) | AWS MVP |
|-------------|---------|
| 인메모리 `signaling-store` | `gmv-signaling` + API GW WebSocket |
| `GET/POST /api/voice/[roomId]` | WS `join-room` / `leave-room` |
| `POST .../signal` + SSE | WS `signal` 양방향 |
| `matchRooms` mock | `gmv-rooms` + `GET /rooms` |

다음 구현 단계: Cognito(또는 Clerk) → DynamoDB 테이블 CDK/콘솔 생성 → WS API → 클라이언트의 `useVoiceRoom`을 SSE에서 WS로 교체 → coturn ICE 추가.
