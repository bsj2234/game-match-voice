# GameMatch Voice

게임 취향이 맞는 사람들과 **커뮤니티**를 만들고, Discord처럼 **채널·음성 통화**로 바로 플레이하는 웹 앱입니다.

## 현재 상태

UI 프로토타입 (목 데이터)입니다.

- 랜딩 페이지
- Discord형 레이아웃 (서버 레일 / 채널 / 채팅·음성 / 멤버 목록)
- 게임 취향 기반 방 매칭

## 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)

## 다음 단계 (예정)

- [ ] 계정 / 커뮤니티 가입
- [ ] 실시간 텍스트 채팅 (WebSocket)
- [ ] 음성 통화 (WebRTC / LiveKit 등)
- [ ] 실제 매칭·방 생성 API

## 스택

- Next.js (App Router)
- TypeScript
- Tailwind CSS
