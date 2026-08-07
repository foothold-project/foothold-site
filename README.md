# FOOTHOLD · 발디딤

> **시뮬레이터에서 천 번 넘어지고, 현장에서는 넘어지지 않는다**

**4족 보행 로봇용 강화학습 기반 험지 적응 정책**
인공지능사관학교 7기 · AI 도약과정 실증 프로젝트 (2026.08 – 12)

---

## 이 프로젝트가 푸는 문제

> **넘어져 봐야 배우는데, 넘어뜨릴 수 없다.**

다리 로봇은 본질적으로 불안정해 넘어지면서 붙잡는 것이 곧 보행이고, 지형의 경우의 수는 무한해 규칙으로 다 쓸 수 없다.
결국 경험으로 배워야 하는데 — 실물은 넘어지면 부서지고, 필요한 실패는 수백만 번이다.

시뮬레이션에서 수백만 번 넘어뜨리고 그 경험을 현실로 옮기는 것,
그리고 **옮기는 순간 벌어지는 간극을 메우는 것**이 이 프로젝트가 5개월간 하는 일이다.

---

## 문서

| | 내용 |
|---|---|
| **[도메인 백과](encyclopedia.html)** | 동물은 왜 그렇게 걷는지에서 시작해 기술 결정까지, **인과로만 이어지는 여섯 층위**. 용어 카드 39개 + 출처 등급 링크 79개 |
| **[학습 커리큘럼](curriculum.html)** | A트랙 17+3절 — 도식·논문 카드·선행 사례 실전 기록 |
| **[프로젝트 브리프](brief.html)** | 한 줄 정의부터 근거 링크 21곳까지 |
| **[개발환경 가이드](setup.html)** | Isaac Sim/Lab 구축 절차 — 실측 함정 6종 포함 (관리자용) |
| **[팀원 접속 가이드](team-access.html)** | TensorBoard·SSH 원리·프로세스 정리 규칙 |
| **[팀 소개](team-intro.html)** | 5인의 역량과 역할, 협업 구조와 그라운드 룰 |

---

## ⚠️ 이 레포는 직접 수정하지 않는다

여기 있는 HTML 은 전부 **빌드 산출물(미러)** 이다. 여기서 직접 고치면 **다음 빌드 때 덮어써진다.**

```
원본(md·_src) → 빌드 파이프라인 → 이 레포 → Vercel 자동 배포
                ├ 사실 검증 (외부 원본 실제 조회 대조)
                ├ 민감정보 검사 (규칙 17종 + 자가검증 15건)
                └ 원본↔산출물 해시 대조
```

수정하고 싶다면 → [foothold-lab 이슈](https://github.com/foothold-project/foothold-lab/issues)로 등록하거나,
`foothold-lab/docs/` 에 md 로 작성한다 (자동 반영 파이프라인 구축 중).

---

## 이 문서의 원칙

**① 본질에서 출발한다.**
도구를 먼저 고르지 않는다. 왜 다리로 걷는지, 왜 넘어지는지를 이해한 뒤 기술을 선택한다.
각 층위는 아래층의 결론에서 도출되며, 건너뛰면 그 다음이 근거 없이 들린다.

**② 모든 주장에 출처와 신뢰도를 표기한다.**

| 표기 | 뜻 |
|---|---|
| 확인 | 논문 원문·공식 문서·소스 코드를 직접 열어 확인 |
| 부분 | 2차 출처로 교차 확인했으나 원문 전체는 미확인 |
| 미확인 | **근거를 확보하지 못한 것. 판단이나 발표에 쓰지 않는다** |

**③ 모르는 것을 명시한다.**
「우리가 아직 모르는 것」 절에 확인하지 못한 항목과 **인용 금지 목록**을 따로 둔다.
널리 퍼져 있지만 사실과 다른 정보도 함께 정정한다.

**④ 실패 판정 기준을 먼저 적는다.**
"언제 실패로 부를 것인가"를 실험 전에 선언한다. 결과를 보고 기준을 맞추면 그건 실증이 아니다.

---

## 기술 스택

| 구분 | 사용 |
|---|---|
| 학습 환경 | NVIDIA Isaac Sim / Isaac Lab · PhysX |
| 평가 환경 | MuJoCo (sim2sim 교차검증) |
| 학습 | PPO (rsl_rl) · Python · PyTorch |
| 공간 재구성 | COLMAP · 3D Gaussian Splatting · Blender |
| 대상 로봇 | Unitree Go2 |

---

## 팀

| 역할 | 이름 | 축 |
|---|---|---|
| PM · Digital Twin | 오흥재 | 실공간 재구성 |
| Policy · RL | 임석헌 | 보행 정책 학습 |
| Scene · Visualization | 맹라현 | 시뮬 지형 · 시각화 |
| Environment · Infra | 이민우 | 학습 환경 · 실험 자동화 |
| Perception · Data | 오현민 | 인지 데이터 · 정량 검증 |

---

## 로컬 실행

빌드 과정이 없는 정적 사이트입니다.

```bash
python -m http.server 8000
```
→ http://localhost:8000

각 문서 우측 상단 **`PDF 저장`** 버튼으로 인쇄·PDF 저장이 가능합니다 (데스크톱).

---

## 이미지 출처

| 파일 | 출처 | 라이선스 |
|---|---|---|
| `muybridge-walk.gif` | Eadweard Muybridge (1878), Wikimedia Commons | Public Domain |
| `hildebrand-map.jpg` · `trot-force-geom.jpg` | Usherwood & Self Davies, *eLife* 2017;6:e29495 | CC BY |
| `isaaclab-go2-rough.jpg` | NVIDIA Isaac Lab 공식 문서 | 출처 표기 |
| `elevation-map.jpg` · `unreliable-map.gif` | ETH Zürich RSL, *Learning Robust Perceptive Locomotion* | 출처 표기 |
| `vr-robo-pipeline.jpg` | VR-Robo 프로젝트 페이지 | 출처 표기 |
| `unitree-go2.jpg` | google-deepmind/mujoco_menagerie | BSD-3-Clause |

각 이미지 캡션 하단에도 출처와 라이선스를 명기했습니다.

---

<sub>이 저장소는 프로젝트 문서 사이트만 담습니다. 연구 노트·실험 기록은 별도 비공개 저장소에서 관리합니다.</sub>
