# spec.json — 칸 이름 전부

## 판 전체

| 이름 | 뜻 | 없으면 |
|---|---|---|
| `slug` | 나올 폴더 이름 | `cards` |
| `format` | `post` · `story` · `square` | `post` |
| `theme` | `light` · `dark` | `light` |
| `product` | `MassLabs` · `LaserFish` · `archiMap` · `Colorgram` | `MassLabs` |
| `brand` | `false` 면 위 브랜드 줄과 아래 주소 줄을 통째로 뺀다 | 넣는다 |
| `foot` | 아래 줄 왼쪽 글. 안 적으면 제품 주소가 들어간다 | 제품 주소 |
| `cards` | 판 목록 (아래) | — |
| `caption` | 인스타 캡션. `caption.txt` 로 함께 떨어진다 | — |
| `hashtags` | 해시태그 배열. 캡션 아래 한 줄로 붙는다 | — |

`theme` · `product` · `foot` 는 카드 한 장에 따로 적으면 그 장만 달라진다.

## 카드 한 장

모든 글칸에서 `**굵게**` 와 줄바꿈(`\n`)이 통한다. 그 외 서식은 없다 —
판이 작아서 서식이 많아지는 순간 안 읽힌다.

### `cover` — 첫 장
```json
{ "type":"cover", "eyebrow":"Update", "title":"지도에서\n**주소로** 찾는다", "sub":"한 줄 설명" }
```
`eyebrow` 는 대문자로 그려진다(영문 한두 낱말이 알맞다). `sub` 는 없어도 된다.

### `point` — 내용 한 가지
```json
{ "type":"point", "n":1, "title":"주소 한 줄이면 끝", "body":"부연 한두 문장" }
```
`n` 을 안 적으면 순서대로 번호가 붙는다(01, 02 …).

### `shot` — 화면을 보여준다
```json
{ "type":"shot", "image":"public/images/MAINPAGE/archiMap_20260827_2304.png",
  "title":"찾은 자리에서 그대로", "body":"부연" }
```
`image` 는 spec 파일 옆 경로 → 없으면 MassLabs 저장소 뿌리 기준으로 찾는다.
`https://` 주소도 된다. **못 찾으면 경고만 하고 그 칸을 비운 채 그린다** — 뽑은 그림을 볼 것.

### `list` — 짧은 것 여럿
```json
{ "type":"list", "eyebrow":"Also", "title":"같이 손본 것",
  "items":["한 줄", "두 줄", "세 줄"] }
```
3~5개. 여섯이 넘으면 판을 나눈다.

### `quote` — 한 문장만
```json
{ "type":"quote", "text":"도면 정리에 쓰던 40분,\n이제 안 씁니다." }
```
따옴표는 CSS 가 그린다 — 글에 넣지 말 것.

### `cta` — 마지막 장
```json
{ "type":"cta", "title":"지금 써보세요", "body":"한 줄",
  "action":"archimap.masslabs-archi.com", "url":"프로필 링크에서 열립니다" }
```
`action` 은 알약 단추로, `url` 은 그 아래 흐린 글로 그려진다.

⚠️인스타 게시물의 글에서는 링크가 안 눌린다. `action` 에 주소를 적더라도
**"프로필 링크"로 안내하는 한 줄을 같이 둔다.**

## 나오는 파일

```
<slug>/01-cover.png  02-point.png  …  caption.txt
```
`caption.txt` 는 `caption` 이나 `hashtags` 가 있을 때만 생긴다.
