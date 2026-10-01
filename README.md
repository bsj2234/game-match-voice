# MeltIn

게임 취향으로 매칭하고, 맞는 음성 로비에 **녹아드는** 파티 파인더.

## 현재 기능

- **매칭 보드** 중심 UI (취향 선택 → 파티 참가)
- **WebRTC 음성 로비** (브라우저 간 P2P, 로컬 시그널링)
- **녹음 / 재생 / 다운로드** (로컬+원격 오디오 믹스)

## 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)

## 친구 테스트

서버 1대 배포 방법: [docs/friend-test.md](docs/friend-test.md)

## 스택

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- WebRTC + SSE 시그널링
- MediaRecorder (녹음)
