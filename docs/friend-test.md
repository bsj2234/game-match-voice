# MeltIn — 친구랑 테스트하기

지금 앱은 **서버 1대**에서 시그널링을 메모리에 둡니다.  
그래서 **항상 켜져 있는 단일 Node 서버**(Render / Railway / Docker VPS)에 올려야 합니다.  
(Vercel 같은 서버리스는 방 정보가 공유되지 않아 친구 테스트에 부적합)

## 가장 빠른 방법: Render 무료 배포

1. https://render.com 가입 (GitHub 연동)
2. **New → Web Service**
3. 이 레포 `bsj2234/game-match-voice` 연결
4. Runtime: **Docker** (또는 `render.yaml` 사용)
5. Name은 `meltin` 등으로 지어도 됨
6. 배포 후 URL 예: `https://meltin-xxxx.onrender.com`
7. 친구에게 그 링크 + `/match` 공유

> Render 무료 플랜은 잠깐 안 쓰면 잠듭니다. 첫 접속에 30~60초 걸릴 수 있어요.

## 로컬에서 잠깐만 (PC 켜둔 채)

```bash
npm run dev
```

다른 터미널에서 (ngrok 등):

```bash
npx --yes localtunnel --port 3000
```

나온 `https://....loca.lt` 주소를 친구에게 공유.  
(터널/로컬은 PC가 켜져 있어야 함)

## 소리가 안 들릴 때 → TURN

서로 다른 공유기/모바일망이면 P2P가 막힐 수 있습니다.

1. https://www.metered.ca/tools/openrelay/ 등에서 TURN 정보 발급  
2. Render Environment에 설정:

```
NEXT_PUBLIC_TURN_URL=turn:....
NEXT_PUBLIC_TURN_USERNAME=...
NEXT_PUBLIC_TURN_CREDENTIAL=...
```

3. 재배포 후 다시 테스트

## 친구 테스트 체크리스트

1. 둘 다 **같은 HTTPS 링크**로 접속
2. `/match` → 같은 파티(같은 음성 로비) 참가
3. 마이크 권한 허용
4. 안 들리면 TURN env 넣고 재배포
5. Render면 “잠든 서버”면 한 명이 먼저 깨운 뒤 30초 후 재시도

## 웹 푸시 (매칭 알림)

Render → **Environment**에 VAPID 키 추가 (로컬 `.env.local`과 동일 값):

```
VAPID_PRIVATE_KEY=...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_SUBJECT=mailto:meltin@localhost
```

키 생성: `npx web-push generate-vapid-keys`

사용 방법:
1. `/preferences`에서 취향 저장 → **알림 켜기**
2. `/match`에서 **이 취향으로 대기하기**
3. 친구도 같은 게임으로 대기하면 서로 푸시

> 서버가 잠들면 대기 목록이 초기화될 수 있어요. 테스트 전에 한 번 접속해 깨워 주세요.

## 다음 (진짜 서비스)

`docs/aws-mvp-spec.md` — DynamoDB + WebSocket + coturn
