/**
 * 생성된 리뷰 결과 컴포넌트
 * - 리뷰 미리보기
 * - 복사 기능
 * - 수정 요청 기능
 */

interface ReviewResultProps {
  review: string;
  editRequest: string;
  isCopying: boolean;
  isEditing: boolean;
  onEditRequestChange: (value: string) => void;
  onCopy: () => void;
  onEdit: () => void;
}

export const ReviewResult = ({
  review,
  editRequest,
  isCopying,
  isEditing,
  onEditRequestChange,
  onCopy,
  onEdit,
}: ReviewResultProps) => (
  <div className="space-y-4">
    {/* 리뷰 미리보기 */}
    <div className="rounded-xl border border-gray-200 bg-slate-50 p-4 text-sm leading-relaxed text-gray-800 md:p-6">
      <pre className="max-h-96 whitespace-pre-wrap wrap-break-word">
        {review}
      </pre>
    </div>

    {/* 액션 버튼 */}
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onCopy}
        disabled={isCopying}
        className="inline-flex flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed"
      >
        {isCopying ? '복사 중…' : '복사하기'}
      </button>
      <button
        type="button"
        onClick={onEdit}
        disabled={!editRequest.trim() || isEditing}
        className="inline-flex flex-1 items-center justify-center rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-200"
      >
        {isEditing ? '수정 중…' : '수정 반영하기'}
      </button>
    </div>

    {/* 수정 요청 입력 */}
    <div>
      <label
        className="text-sm font-medium text-gray-700"
        htmlFor="editRequest"
      >
        수정 요청
      </label>
      <textarea
        id="editRequest"
        placeholder="ex. 서론을 3문장으로 줄이고, 음식 설명을 더 자세히"
        value={editRequest}
        onChange={(e) => onEditRequestChange(e.target.value)}
        className="input-base mt-2 h-28"
      />
    </div>
  </div>
);
