export const REVIEW_MESSAGES = {
  deleteModal: {
    title: '리뷰를 삭제할까요?',
    description: (storeName: string) => storeName,
    warning: '한 번 삭제하면 되돌릴 수 없어요.',
    confirm: '삭제하기',
    cancel: '유지할게요',
    error: '삭제에 실패했어요. 잠시 후 다시 시도해주세요.',
  },
  editPanel: {
    title: 'AI 수정 요청',
    label: '수정 요청 내용',
    placeholder: 'ex. 조금 더 감성적인 말투로 바꿔줘, 메뉴 설명을 더 자세히 해줘',
    submit: '수정 요청하기',
    submitting: '수정 중...',
    error: '수정 요청 중 오류가 발생했어요. 다시 시도해주세요.',
  },
  cancelModal: {
    title: '수정 취소',
    description: '수정 사항을 취소하고 원래대로 되돌리시겠습니까?',
    confirm: '되돌리기',
    cancel: '계속 수정',
  },
  save: {
    idle: '변경사항 저장',
    pending: '저장 중...',
    saved: '저장 완료',
    error: '저장 실패 — 다시 시도해주세요',
  },
} as const;
