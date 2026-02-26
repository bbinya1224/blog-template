export const REVIEW_MESSAGES = {
  deleteModal: {
    title: '리뷰를 삭제할까요?',
    description: (storeName: string) => storeName,
    warning: '한 번 삭제하면 되돌릴 수 없어요.',
    confirm: '삭제하기',
    cancel: '유지할게요',
    error: '삭제에 실패했어요. 잠시 후 다시 시도해주세요.',
  },
} as const;
