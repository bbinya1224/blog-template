import { Button } from '@/shared/ui/Button';

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
  <div className='space-y-4'>
    <div className='rounded-xl border border-gray-200 bg-slate-50 p-4 text-sm leading-relaxed text-gray-800 md:p-6 overflow-scroll'>
      <pre className='max-h-96 whitespace-pre-wrap wrap-break-word'>
        {review}
      </pre>
    </div>

    <div className='flex flex-wrap gap-3'>
      <Button
        type='button'
        onClick={onCopy}
        disabled={isCopying}
        isLoading={isCopying}
        variant='secondary'
        className='flex-1'
      >
        {isCopying ? '복사 중…' : '복사하기'}
      </Button>
      <Button
        type='button'
        onClick={onEdit}
        disabled={!editRequest.trim() || isEditing}
        isLoading={isEditing}
        variant='primary'
        className='flex-1'
      >
        {isEditing ? '수정 중…' : '수정 반영하기'}
      </Button>
    </div>

    <div>
      <label
        className='text-sm font-medium text-gray-700'
        htmlFor='editRequest'
      >
        수정 요청
      </label>
      <textarea
        id='editRequest'
        placeholder='ex. 서론을 3문장으로 줄이고, 음식 설명을 더 자세히'
        value={editRequest}
        onChange={(e) => onEditRequestChange(e.target.value)}
        className='input-base mt-2 h-28'
      />
    </div>
  </div>
);
