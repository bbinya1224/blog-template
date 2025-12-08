import type { ChangeEvent, FormEvent } from 'react';
import type { ReviewPayload } from '@/entities/review/model/types';

interface ReviewFormProps {
  form: ReviewPayload;
  isDisabled: boolean;
  isLoading: boolean;
  onChange: (
    field: keyof ReviewPayload
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const ReviewForm = ({
  form,
  isDisabled,
  isLoading,
  onChange,
  onSubmit,
}: ReviewFormProps) => (
  <form className='space-y-8' onSubmit={onSubmit}>
    {/* 섹션 1: 기본 정보 (검색의 기준) */}
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold text-gray-900 border-b pb-2'>
        📍 기본 정보
      </h3>
      <div className='grid gap-4 md:grid-cols-2'>
        <div>
          <label className='label-base' htmlFor='name'>
            가게명 *
          </label>
          <input
            id='name'
            value={form.name}
            onChange={onChange('name')}
            placeholder='예: 연남동 툭툭누들타이'
            required
            className='input-base'
          />
        </div>
        <div>
          <label className='label-base' htmlFor='location'>
            위치 (지역) *
          </label>
          <input
            id='location'
            value={form.location}
            onChange={onChange('location')}
            placeholder='예: 서울 마포구, 연남동'
            required
            className='input-base'
          />
        </div>
      </div>
    </div>

    {/* 섹션 2: 나의 경험 (AI가 모르는 정보) - 가장 중요! */}
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold text-gray-900 border-b pb-2'>
        🍽️ 나의 경험
      </h3>

      <div className='grid gap-4 md:grid-cols-2'>
        <div>
          <label className='label-base' htmlFor='date'>
            방문 날짜 *
          </label>
          <input
            id='date'
            type='date'
            value={form.date}
            onChange={onChange('date')}
            required
            className='input-base'
          />
        </div>
        <div>
          <label className='label-base' htmlFor='companion'>
            누구와 갔나요? (방문 목적)
          </label>
          <input
            id='companion'
            value={form.companion}
            onChange={onChange('companion')}
            placeholder='예: 썸타는 분과 데이트, 부모님 생신, 혼밥'
            className='input-base'
          />
        </div>
      </div>

      <div>
        <label className='label-base' htmlFor='menu'>
          주문한 메뉴 (콤마로 구분) *
        </label>
        <input
          id='menu'
          value={form.menu}
          onChange={onChange('menu')}
          placeholder='예: 고등어 봉초밥, 유자 하이볼 2잔'
          required
          className='input-base'
        />
        <p className='text-xs text-gray-500 mt-1'>
          * AI가 메뉴 가격과 상세 정보를 검색하지만, <b>무엇을 드셨는지</b>는
          직접 알려주셔야 해요.
        </p>
      </div>
    </div>

    {/* 섹션 3: 평가 및 디테일 */}
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold text-gray-900 border-b pb-2'>
        📝 상세 평가
      </h3>

      <div>
        <label className='label-base' htmlFor='user_draft'>
          자유 메모/초안 (Draft) - 💡 가장 중요!
        </label>
        <textarea
          id='user_draft'
          value={form.user_draft || ''}
          onChange={onChange('user_draft')}
          placeholder='여기에 생각나는 대로 막 적어주세요. AI가 이 내용을 바탕으로 살을 붙여 1500자로 늘려드립니다. (예: 커피는 산미가 강해서 호불호 갈릴 듯. 근데 케이크는 진짜 꾸덕하고 맛있음. 사장님이 서비스로 쿠키도 주심...)'
          className='input-base h-40 resize-none bg-yellow-50 border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400'
        />
        <p className='text-xs text-gray-500 mt-1'>
          * 키워드보다 <b>줄글로 적어주시면</b> 훨씬 자연스러운 리뷰가 나옵니다.
        </p>
      </div>

      <div>
        <label className='label-base' htmlFor='summary'>
          한줄평 (제목 감) *
        </label>
        <input
          id='summary'
          value={form.summary}
          onChange={onChange('summary')}
          placeholder='예: 분위기 깡패인데 맛은 살짝 아쉬움'
          required
          className='input-base'
        />
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div>
          <label className='label-base' htmlFor='pros'>
            좋았던 점 (Pros)
          </label>
          <textarea
            id='pros'
            value={form.pros}
            onChange={onChange('pros')}
            placeholder='예: 직원분이 고기를 다 구워주심, 조명이 예쁨'
            className='input-base h-24 resize-none'
          />
        </div>
        <div>
          <label className='label-base' htmlFor='cons'>
            아쉬웠던 점 (Cons)
          </label>
          <textarea
            id='cons'
            value={form.cons}
            onChange={onChange('cons')}
            placeholder='예: 화장실이 밖에 있음, 음악 소리가 너무 큼'
            className='input-base h-24 resize-none'
          />
        </div>
      </div>

      <div>
        <label className='label-base' htmlFor='extra'>
          기타 꿀팁 (선택)
        </label>
        <textarea
          id='extra'
          value={form.extra}
          onChange={onChange('extra')}
          placeholder='예: 주말엔 웨이팅 필수니 캐치테이블 예약하세요. 주차는 공영주차장 추천.'
          className='input-base h-20'
        />
      </div>
    </div>

    <button
      type='submit'
      disabled={isDisabled}
      className='btn-primary w-full py-4 text-lg font-bold shadow-md transition-transform active:scale-[0.98]'
    >
      {isLoading ? (
        <span className='flex items-center justify-center gap-2'>
          <svg
            className='animate-spin h-5 w-5 text-white'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
          AI가 리뷰 작성 중...
        </span>
      ) : (
        '✨ 내 말투로 블로그 리뷰 생성하기'
      )}
    </button>
  </form>
);
