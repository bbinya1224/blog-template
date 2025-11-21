/**
 * 리뷰 생성 폼 컴포넌트
 * - 장소 정보 입력
 * - 리뷰 생성 실행
 */

import type { ChangeEvent, FormEvent } from 'react';
import type { ReviewPayload } from '@/entities/review/model/types';

interface ReviewFormProps {
  form: ReviewPayload;
  isDisabled: boolean;
  isLoading: boolean;
  onChange: (field: keyof ReviewPayload) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const ReviewForm = ({
  form,
  isDisabled,
  isLoading,
  onChange,
  onSubmit,
}: ReviewFormProps) => (
  <form className="space-y-6" onSubmit={onSubmit}>
    {/* 가게명 + 위치 */}
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="text-sm font-medium text-gray-700" htmlFor="name">
          가게명 *
        </label>
        <input
          id="name"
          value={form.name}
          onChange={onChange('name')}
          required
          className="input-base"
        />
      </div>
      <div>
        <label
          className="text-sm font-medium text-gray-700"
          htmlFor="location"
        >
          위치 *
        </label>
        <input
          id="location"
          value={form.location}
          onChange={onChange('location')}
          required
          className="input-base"
        />
      </div>
    </div>

    {/* 방문 날짜 + 한줄평 */}
    <div className="grid gap-4 md:grid-cols-3">
      <div>
        <label className="text-sm font-medium text-gray-700" htmlFor="date">
          방문 날짜 *
        </label>
        <input
          id="date"
          type="date"
          value={form.date}
          onChange={onChange('date')}
          required
          className="input-base"
        />
      </div>
      <div className="md:col-span-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="summary">
          한줄평 *
        </label>
        <input
          id="summary"
          value={form.summary}
          onChange={onChange('summary')}
          required
          className="input-base"
        />
      </div>
    </div>

    {/* 장점 + 단점 */}
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="text-sm font-medium text-gray-700" htmlFor="pros">
          장점
        </label>
        <textarea
          id="pros"
          value={form.pros}
          onChange={onChange('pros')}
          className="input-base h-28"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700" htmlFor="cons">
          단점
        </label>
        <textarea
          id="cons"
          value={form.cons}
          onChange={onChange('cons')}
          className="input-base h-28"
        />
      </div>
    </div>

    {/* 추가 정보 */}
    <div>
      <label className="text-sm font-medium text-gray-700" htmlFor="extra">
        추가 정보
      </label>
      <textarea
        id="extra"
        value={form.extra}
        onChange={onChange('extra')}
        className="input-base h-32"
      />
      <p className="mt-2 text-sm text-gray-500">
        방문 이유, 분위기, 서빙, 추천 메뉴 등 자유롭게 적어주세요.
      </p>
    </div>

    <button type="submit" disabled={isDisabled} className="btn-primary w-full">
      {isLoading ? '리뷰 생성 중…' : '1500자 리뷰 생성하기'}
    </button>
  </form>
);
