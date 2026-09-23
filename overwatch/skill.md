# 상용 모바일/PC 게임 완성도 및 게임 필(Game Feel & Juice) 표준 지침서 (skill.md)

> **[적용 원칙]**  
> 본 프로젝트(overwatch)에서 코드를 작성, 리팩토링, 또는 기능을 구현할 때 **반드시 본 가이드라인을 최우선 기준으로 준수**한다.  
> 새로운 콘텐츠나 복잡한 기능을 추가하기보다, **이미 존재하는 로직과 게임플레이가 플레이어에게 명확하고 묵직하게 전달(Game Feel & Juice)**되도록 만드는 것을 최우선 목표로 한다.  
> 더 화려한 연출이 아니라 **의도가 명확하고, 일관되며, 행동의 원인과 결과를 즉시 체감할 수 있는 상태**를 완성한다.

---

## 1. 6단계 인터랙션 파이프라인 (Interaction Lifecycle)

게임 내 모든 중요 사건(공격, 피격, 조작, 획득, UI 상호작용 등)은 반드시 다음 6단계의 연속 흐름으로 설계 및 구현되어야 한다. 중간 단계가 누락되면 조작감이 뻣뻣하거나 타격감이 사라진다.

```
[1. 입력 (Input)]
  ↓ 즉각적인 시각 / 청각 / 햅틱 피드백 (0ms 지연 반응)
[2. 준비 (Anticipation)]
  ↓ 행동 직전의 긴장감 조성 및 장전 (차징, 뒤로 당김, 미세 웅크림, 발광)
[3. 행동 (Action)]
  ↓ 가속도 곡선(Ease-Out)과 잔상/궤적 (스윙, 돌진, 탄환 발사, 트레일)
[4. 충돌/변화 (Impact / Change)]
  ↓ 물리적 충격과 시간 왜곡 각인 (Hit Stop, Hit Flash, Screen Shake, 충격파)
[5. 결과 (Consequence)]
  ↓ 명확한 상태 전이 (감속 넉백, 대미지 텍스트, Trailing HP 바 감소, 젬 드랍)
[6. 정착 (Recovery / Settle)]
  ↓ 여운 및 탄성 복원 (Squash & Stretch 복원, 파티클 소멸, 자연스러운 안착)
```

---

## 2. 16대 핵심 연출 및 UX 검토 표준

모든 게임플레이 요소를 검토하고 작성할 때 다음 16개 항목의 기준을 적용한다:

| 검토 요소 | 상용 게임 완성도 기준 및 필수 규칙 | 권장 구현 기법 |
| :--- | :--- | :--- |
| **1. 입력 직후 피드백** | 터치/클릭 즉시 지연 없이 반응해야 함 (0ms 신뢰성) | 버튼 Scale(0.95), 터치 리플, 즉각 클릭음, `vibrate(10)` |
| **2. Tween / Lerp / Easing** | 선형(Linear) 등속도 이동/변화 절대 금지. 유기적 탄성 적용 | `Ease-Out`(공격), `Ease-In`(유인), `Spring/Lerp(0.15)` |
| **3. Anticipation & Squash** | 타격/점프/공격 시 찌그러짐과 늘어남으로 쫀득함 부여 | 피격 시 축 방향 0.8배 압축 후 스프링 튕김 복원 |
| **4. 전투 4대 피드백** | 타격 저항감(Hit Stop), 시각 플래시, 감속 넉백, 감쇠 쉐이크 필수 | 30~50ms Hit Stop, 0.08s 백색 플래시, 지수 감쇠 쉐이크 |
| **5. Particle & Trail** | 무차별 점 파티클 지양. 타격 각도와 속도 벡터를 따르는 방향성 파티클 | 베기 잔상 트레일, 링형 충격파, 소멸 페이드아웃 |
| **6. 상태 변화 표현** | 수치가 뚝 떨어지는 대신 잔여 게이지가 뒤따라 감소하는 연출 | **Trailing Health Bar** (0.35s 딜레이 후 감소), 스탯 Count-up |
| **7. Camera 연출** | 중요한 사건 시 역동적인 공간감 부여 (과도한 흔들림 지양) | 강타 시 반대 방향 Camera Kick(2~4px), 보스 출현 줌인 |
| **8. 등장 / 획득 / 사망 / 퇴장** | 오브젝트의 급작스러운 생성/삭제(Splice) 금지. 라이프사이클 필수 | 젬 드랍 바운스, 몬스터 붕괴 애니메이션 후 소멸 |
| **9. 화면 전환 & 결과 연출** | 게임 오버/승리 시 0초 만에 팝업이 뜨는 문제 차단 | 슬로우 모션(0.3x) → 1초 여운 → 배너 스프링 드랍 |
| **10. 버튼 4대 상태** | Hover, Press, Release, Disabled 상태의 물리적 피드백 구현 | Press 시 하강(`translateY(2px)`), 비활성화 시 명도 감쇄 |
| **11. 정보 위계와 가독성** | 중요한 정보(내 체력, 치명적 위협)가 최상위 시인성을 가져야 함 | 일반 대미지는 작게, 크리티컬은 크게, 불필요한 HUD 축소 |
| **12. UI 등장·퇴장 타이밍** | 모달과 툴팁이 팝업될 때 시각적 충격을 줄이는 트랜지션 | CSS `cubic-bezier(0.16, 1, 0.3, 1)` 오버슈트 팝업 |
| **13. 사운드 동기화 & 스로틀링** | 여러 타격 동시 발생 시 사운드가 깨지거나 소음이 되는 현상 방지 | 40ms 재생 스로틀링, 젬 연속 획득 시 음정(Pitch) 상승 |
| **14. 모바일 Haptic Feedback** | 플랫폼에 맞는 섬세한 진동 피드백 제공 | 일반 타격 10ms, 치명타 `[20, 30, 20]ms` |
| **15. 반복 플레이 피로도 관리** | 긴 연출로 플레이 템포가 끊기지 않도록 0.1~0.4초 내 압축 | 연출 스킵 가능성, 짧고 강렬한 임팩트 중심 설계 |
| **16. 시선 분산 방지** | 모든 효과가 화면 중앙을 가리거나 같은 정보를 중복 전달하지 않음 | 일반 잡몹은 쉐이크 금지, 화면 흔들림은 보스/피격 전용 |

---

## 3. "로직은 있으나 표현이 부족한 사건" 우선 해결 체크리스트

코드를 작성할 때 다음 7대 결손 항목을 우선적으로 점검하고 즉시 보강한다:

*   [ ] **공격은 되지만 맞았다는 느낌이 약함**:
    *   원인: Hit Stop 부재, 넉백이 1프레임 텔레포트, 적 스프라이트의 변형 없음.
    *   처방: **30~40ms Hit Stop** + **Squash & Stretch (0.8x -> 1.15x -> 1.0x)** + **지수 감쇠 넉백**.
*   [ ] **몬스터는 죽지만 죽었다는 과정이 없음**:
    *   원인: HP <= 0 도달 즉시 배열 `splice`로 소멸.
    *   처방: `isDying` 상태 도입(0.12초간 백색 발광 → 상하 압축 붕괴 → 원형 충격파 방출 후 소멸).
*   [ ] **아이템은 얻지만 획득감을 못 느낌**:
    *   원인: 일직선 등속도로 끌려오고 닿자마자 사라짐.
    *   처방: 스폰 시 포물선 바운스 + 플레이어 유인 시 급가속(Ease-In) + 획득 시 링 이펙트 및 사운드 피치 상승.
*   [ ] **버튼은 작동하지만 눌렀다는 반응이 없음**:
    *   원인: `:active` 변위 없음, 클릭 소리 부재.
    *   처방: 눌림 시 `transform: translateY(2px) scale(0.97)` + 햅틱/클릭음.
*   [ ] **레벨업은 되지만 숫자만 바뀜**:
    *   원인: 텍스트만 교체되고 플레이어 화면에 이벤트가 없음.
    *   처방: 플레이어 수직 빛기둥 + 상단 뱃지 바운스(1.4배 팝업) + 황금빛 스위프.
*   [ ] **보스가 등장하지만 일반 몬스터와 체감 차이가 없음**:
    *   원인: 크기/체력만 크고 피격 저항, 카메라 연출 없음.
    *   처방: 등장 시 경고 사이렌/비네트 + 피격 시 전용 카메라 쉐이크(Tier 3) + 타격 저항(묵직한 넉백).
*   [ ] **승리는 되지만 감정적인 마침표가 없음**:
    *   원인: 조건 달성 즉시 모달 창 팝업.
    *   처방: **클라이맥스 연속 시퀀스(슬로우 모션 0.8초 → 1초 여운 → 승리 배너 강타 → 스탯 롤링 카운트업)**.

---

## 4. 연출 강도 3단계 계층화 매트릭스 (3-Tier Feedback Matrix)

모든 사건에 동일한 스크린 쉐이크와 파티클을 난사하지 않는다. 중요도에 따라 3단계로 엄격히 분리한다:

```
[Tier 1: 일반 행동] ──────> Hit Flash(0.06s) + Squash(0.9) + 4개 파티클 (화면 흔들림 절대 금지)
[Tier 2: 주요 행동] ──────> Hit Stop(35ms) + Flash(0.12s) + Shake(2.5px) + Trailing Bar + 8개 파티클
[Tier 3: 클라이맥스] ────> Hit Stop(80ms) + Radial Blur + Shake(6px) + Slow-Mo(0.3x) + Stinger Sound
```

1.  **Tier 1: 일반 행동 (Normal Action - 높은 빈도)**
    *   대상: 일반 잡몹 타격, 기본 젬 획득, 기본 이동 조작.
    *   규칙: **화면 흔들림(Screen Shake) 금지**. 시각 피로도 최소화. 플래시와 캐릭터 자체 스쿼시로만 피드백.
2.  **Tier 2: 주요 행동 (Important Action - 중간 빈도)**
    *   대상: 대형 몬스터 타격, 플레이어 피격, 레벨업, 크리티컬 공격.
    *   규칙: **30~45ms Hit Stop**, 2.5px 지수 감쇠 쉐이크, 붉은 비네트 플래시, Trailing HP 바.
3.  **Tier 3: 클라이맥스 (Climax - 낮은 빈도)**
    *   대상: 보스 처치, 최종 승리(Victory), 플레이어 사망(Game Over).
    *   규칙: 화면을 즉시 덮지 않고 **연속된 시퀀스**로 감정적 마침표를 찍음.

---

## 5. 연속된 경험 시퀀스 설계 규칙 (Continuous Climax Sequence)

중요한 시퀀스는 개별 효과의 나열이 아니라, **호흡이 살아있는 하나의 연속된 경험**으로 설계한다:

```
[T + 0.00s] 치명타 임팩트: Hit Stop (80ms) + 화면 전체 백색 플래시 (White Flash)
    ↓
[T + 0.08s] 슬로우 모션 (Slow-Mo): 게임 속도 0.3배속 감속 (0.8초간 유지), 몬스터 붕괴 파티클 확산
    ↓
[T + 0.88s] 감정적 여운 (Lingering Pause): 정상 배속 복귀, 1.0초간 정적 및 전장 정돈
    ↓
[T + 1.88s] 승리/패배 배너 강타: 스프링 오버슈트 애니메이션으로 "VICTORY" 드랍
    ↓
[T + 2.20s] 보상 카운트업 (Count-up): 킬 수, 생존 시간, 골드가 드르륵 차오르는 롤링 연출
    ↓
[T + 2.70s] 버튼 활성화: 0.5초간 오클릭 방지 딜레이 후 '재도전' 버튼 촉감 활성화
```

---

## 6. 중복/미사용/스타일 불일치 정리 원칙 (Keep / Merge / Delete)

코드를 작성하거나 수정할 때 다음 3가지 조치를 선제적으로 취한다:

1.  **중복된 연출 (Merge)**:
    *   화면 흔들림, 파티클 생성, 사운드 재생 코드가 클래스마다 분산되어 있으면 단일 매니저(`CameraShaker`, `SoundManager`, `ParticlePool`)로 통합한다.
2.  **중복된 코드 및 에셋 (Delete)**:
    *   동일한 사운드 파일의 복사본(예: 한국어/영문 중복 파일)은 1개로 통일하고 나머지는 즉시 삭제한다.
    *   GDD 스펙에 정의되었으나 사용되지 않는 미구현 변수/데이터는 즉시 삭제하거나 주석으로 격리한다.
3.  **역할이 겹치는 UI 및 스타일 불일치 (Merge / Unify)**:
    *   조작 안내문, 콤보 팝업, 알림창이 서로 겹치거나 시야를 가리는 경우 단일 정보창으로 통합한다.
    *   폰트와 색상 팔레트는 일관된 디자인 시스템(숫자: 모노스페이스, 텍스트: 고딕, 고유 브랜드 컬러)으로 단일화한다.

---

## 7. 우선순위별 구현 및 개선 로드맵

모든 작업은 아래 3단계 우선순위에 따라 순차적으로 진행한다:

### [1단계: 즉시 수정하면 효과가 큰 것] (High Impact - 당장 손맛이 3배가 되는 핵심)
1.  **전투 4대 피드백 도입**: 공격 적중 시 35ms Hit Stop + 몬스터 Squash(0.8x) & Hit Flash + 지수 감쇠 쉐이크.
2.  **몬스터 사망 과정 구현**: HP 0 즉시 삭제 금지 → 0.12초 붕괴 애니메이션 + 링형 충격파 파티클.
3.  **경험치 보석 가속 흡수**: 드랍 시 포물선 바운스 + 자석 범위 내 급가속(Ease-In) 유인 + 연속 획득 피치 상승.
4.  **레벨업 팡파르 연출**: 플레이어 수직 빛기둥 + HUD 뱃지 바운스(1.4x) + 레벨업 사운드.
5.  **모바일 Haptic 연동**: `navigator.vibrate`를 통한 타격 및 피격 손끝 진동.

### [2단계: 적은 비용으로 개선 가능한 것] (Low-Cost Quick Wins - 반나절 내 적용)
1.  **Trailing Health Bar**: 체력바 뒤에 하얀색/연주황색 잔여 게이지가 0.35초 후 부드럽게 줄어드는 이중 바.
2.  **플레이어 피격 비네트**: 피격 시 화면 테두리에 0.15초 붉은 비네트 플래시.
3.  **버튼 상호작용 피드백**: Hover / Press(Scale 0.96 & TranslateY 2px) 스타일 적용.
4.  **사운드 스로틀링**: 단시간 내 무차별 사운드 중복 재생 차단 (최소 간격 40ms).
5.  **대미지 플로팅 텍스트 개선**: 팝업 후 감속 부유 및 부드러운 페이드아웃.

### [3단계: 나중에 다듬을 디테일] (Later Polish Details - 완성도의 최종 5%)
1.  **카메라 다이내믹스**: 강타 시 미세 Camera Kick, 보스 조우 시 줌 연출.
2.  **클라이맥스 슬로우 모션 & 정적 여운**: 사망/승리 시 0.3배속 슬로우 모션 및 1초 정적.
3.  **결과 모달 스탯 Count-up 롤링**: 수치가 0부터 드르륵 올라가는 슬롯머신형 카운트업.
4.  **바닥 타일 조명감 및 뎁스 비네팅**: 배경에 은은한 엠비언트 라이팅 추가.

---

## 8. 핵심 연출 표준 코드 스니펫 (Reference Snippets)

### 8.1. Micro Hit Stop 관리자
```javascript
let hitStopTimer = 0;
export function triggerHitStop(duration = 0.035) {
  hitStopTimer = duration;
}
export function updateHitStop(dt) {
  if (hitStopTimer > 0) {
    hitStopTimer -= dt;
    return true; // 엔티티 위치/물리 업데이트 일시 스킵
  }
  return false;
}
```

### 8.2. 지수 감쇠 카메라 쉐이커 (Exponential Trauma Shaker)
```javascript
export class CameraShaker {
  constructor() {
    this.trauma = 0; // 0.0 ~ 1.0
  }
  addTrauma(amount) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }
  update(dt) {
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 2.8); // 부드러운 감쇠
    }
  }
  getOffset(maxPixel = 6) {
    const shake = this.trauma * this.trauma; // 비선형 강도
    return {
      x: (Math.random() * 2 - 1) * maxPixel * shake,
      y: (Math.random() * 2 - 1) * maxPixel * shake
    };
  }
}
```

### 8.3. 몬스터 Squash & Stretch 렌더링
```javascript
// 피격 시
monster.scaleX = 0.8;
monster.scaleY = 1.25;

// 매 프레임 복원 (Spring Lerp)
monster.scaleX += (1.0 - monster.scaleX) * 0.22;
monster.scaleY += (1.0 - monster.scaleY) * 0.22;

// 렌더링
ctx.save();
ctx.translate(monster.x, monster.y);
ctx.scale(monster.scaleX, monster.scaleY);
ctx.drawImage(monster.img, -monster.width / 2, -monster.height / 2, monster.width, monster.height);
ctx.restore();
```

### 8.4. Trailing Health Bar 로직
```javascript
// 체력 갱신 시
this.hp = Math.max(0, this.hp - damage);
this.trailDelay = 0.35; // 0.35초 대기

// 매 프레임 업데이트
if (this.trailDelay > 0) {
  this.trailDelay -= dt;
} else if (this.trailingHp > this.hp) {
  this.trailingHp += (this.hp - this.trailingHp) * 0.12; // 뒤따라 부드럽게 감소
}
```

### 8.5. 오디오 스로틀링 및 콤보 피치 시프트
```javascript
class SoundManager {
  static lastTimes = {};
  static expCombo = 0;
  static comboTimer = null;

  static playThrottled(sfxName, minIntervalMs = 40) {
    const now = performance.now();
    if (this.lastTimes[sfxName] && now - this.lastTimes[sfxName] < minIntervalMs) return;
    this.lastTimes[sfxName] = now;
    this.play(sfxName);
  }

  static playExp() {
    this.expCombo = Math.min(this.expCombo + 1, 8);
    clearTimeout(this.comboTimer);
    this.comboTimer = setTimeout(() => { this.expCombo = 0; }, 400);

    const audio = this.getAudioInstance("exp");
    audio.playbackRate = 1.0 + this.expCombo * 0.05; // 콤보 흡수 시 음정 상승
    audio.play().catch(() => {});
  }
}
```
