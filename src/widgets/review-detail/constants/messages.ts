export const REVIEW_MESSAGES = {
  deleteModal: {
    title: '리뷰를 삭제할까요?',
    description: (storeName: string) =>
      `'${storeName}' 리뷰가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없어요.`,
    confirm: '삭제하기',
    cancel: '취소',
    error: '삭제에 실패했어요. 잠시 후 다시 시도해주세요.',
  },
} as const;
