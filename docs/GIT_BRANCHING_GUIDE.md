# Git Branching 전략 가이드

## 📋 브랜치 구조

```
main (production-ready) 🔒
  ↑ PR only
develop (integration) ✅
  ↑ 자유롭게 푸시
feature/* (작업 브랜치)
```

## 🌿 브랜치 역할

### `main` 브랜치 🔒
- **목적**: Production 배포용 (실제 운영 환경)
- **보호 설정**: PR을 통해서만 병합 가능
- **릴리즈**: 모든 릴리즈 태그는 main에서 생성
- **직접 푸시**: 불가능

### `develop` 브랜치 ✅
- **목적**: 개발 통합 브랜치
- **보호 설정**: 없음 (자유롭게 푸시 가능)
- **역할**: 여러 feature 작업을 모아서 테스트
- **직접 푸시**: 가능

### `feature/*` 브랜치
- **목적**: 새로운 기능 개발
- **네이밍**: `feature/기능명` (예: `feature/add-comment`, `feature/dark-mode`)
- **머지 대상**: `develop` 브랜치

## 🔄 개발 워크플로우

### 1. 새 기능 개발

```bash
# 1. develop 브랜치에서 시작
git checkout develop
git pull origin develop

# 2. feature 브랜치 생성
git checkout -b feature/새기능명

# 3. 작업 후 커밋
git add .
git commit -m "feat: 새로운 기능 추가"

# 4. develop에 병합 (PR 또는 직접 푸시)
git checkout develop
git merge feature/새기능명
git push origin develop

# 5. feature 브랜치 삭제
git branch -d feature/새기능명
```

### 2. 릴리즈 준비 (develop → main)

**중요**: develop에서 main으로의 병합은 **자동화된 GitHub Actions 워크플로우**를 사용합니다.

#### 단계:

1. **GitHub 저장소 접속**
   - https://github.com/bbinya1224/blog-template

2. **Actions 탭 이동**

3. **"Auto Release with Gemini AI" 워크플로우 선택**

4. **"Run workflow" 버튼 클릭**
   - Base branch: `develop` (기본값)
   - 다른 브랜치를 분석하고 싶으면 변경 가능

5. **실행 확인**
   - 워크플로우가 자동으로:
     - ✅ develop → main 변경사항 분석
     - ✅ Gemini AI로 CHANGELOG 생성
     - ✅ 새 버전 태그 생성 (v1.0.x → v1.0.(x+1))
     - ✅ `chore/ai-changelog-v{버전}` 브랜치 생성
     - ✅ main으로 PR 자동 생성
     - ✅ GitHub Release 생성

6. **PR 리뷰 및 병합**
   - Pull Requests 탭에서 자동 생성된 PR 확인
   - CHANGELOG 내용 검토
   - 승인 후 main에 병합

7. **완료** 🎉
   - main 브랜치에 릴리즈 반영됨
   - GitHub Release 페이지에서 확인 가능

## 📝 커밋 메시지 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/) 사용 권장:

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 포맷팅 (기능 변경 없음)
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드 프로세스, 도구 설정 등
```

**예시:**
```bash
git commit -m "feat: 다크모드 토글 버튼 추가"
git commit -m "fix: 모바일 레이아웃 깨짐 수정"
git commit -m "docs: README에 설치 방법 추가"
```

## 🚨 주의사항

### ❌ 하지 말아야 할 것
- `main` 브랜치에 직접 푸시 (보호됨)
- `develop`에서 직접 작업 (가능하지만 권장하지 않음)
- main에서 feature 브랜치 생성

### ✅ 권장사항
- 항상 `develop`에서 `feature` 브랜치 생성
- 작업이 완료되면 빠르게 `develop`에 병합
- 릴리즈 준비가 되면 GitHub Actions로 자동화된 PR 생성
- 의미 있는 커밋 메시지 작성

## 🔧 브랜치 기본 설정 변경 (선택사항)

GitHub에서 기본 브랜치를 `develop`으로 설정하려면:

1. **Settings** → **Branches**
2. **Default branch** 섹션에서 "Switch to another branch"
3. `develop` 선택 후 저장

이렇게 하면:
- 저장소를 클론할 때 develop이 기본
- PR 생성 시 기본 대상이 develop

## 📚 자주 묻는 질문

### Q: 릴리즈를 언제 해야 하나요?
A: develop에 충분한 변경사항이 모였을 때, GitHub Actions에서 수동으로 워크플로우를 실행하세요.

### Q: 긴급 버그 수정은 어떻게 하나요?
A: hotfix 브랜치를 main에서 생성하거나, develop에서 빠르게 수정 후 즉시 릴리즈하세요.

### Q: 버전은 어떻게 관리되나요?
A: 워크플로우가 자동으로 patch 버전을 증가시킵니다 (v1.0.0 → v1.0.1). 필요시 수동으로 태그를 관리할 수도 있습니다.

### Q: develop 브랜치도 보호해야 하나요?
A: 1인 개발이면 불필요합니다. 팀 프로젝트라면 PR 방식으로 관리하는 것을 권장합니다.
