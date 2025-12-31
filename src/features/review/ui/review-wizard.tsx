import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { ReviewPayload } from '@/entities/review/model/types';
import { StepContext } from './wizard-steps/step-context';
import { StepMenu } from './wizard-steps/step-menu';
import { StepExperience } from './wizard-steps/step-experience';
import { StepRefinement } from './wizard-steps/step-refinement';

interface ReviewWizardProps {
  form: ReviewPayload;
  isDisabled: boolean;
  isLoading: boolean;
  onChange: (
    field: keyof ReviewPayload
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onAppendDraft: (text: string) => void;
}

export const ReviewWizard = ({
  form,
  isDisabled,
  isLoading,
  onChange,
  onSubmit,
  onAppendDraft,
}: ReviewWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: '장소 정보', component: StepContext },
    { title: '동행인 & 메뉴', component: StepMenu },
    { title: '경험 작성', component: StepExperience },
    { title: '평가 및 요약', component: StepRefinement },
  ];

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // 각 스텝별 필수 필드 검증
  const canProceedToNextStep = (): boolean => {
    switch (currentStep) {
      case 0: // 장소 정보
        return !!(
          form.name.trim() &&
          form.location.trim()
        );
      case 1: // 동행인 & 메뉴
        return !!form.menu.trim();
      case 2: // 경험 작성 (필수!)
        return !!(form.user_draft && form.user_draft.trim());
      case 3: // 평가 및 요약
        return true;
      default:
        return true;
    }
  };

  // 미완성 필드 메시지
  const getMissingFieldsMessage = (): string => {
    switch (currentStep) {
      case 0:
        const missing0 = [];
        if (!form.name.trim()) missing0.push('가게 이름');
        if (!form.location.trim()) missing0.push('위치');
        return missing0.length > 0 ? `${missing0.join(', ')}을(를) 입력해주세요` : '';
      case 1:
        return !form.menu.trim() ? '메뉴를 입력해주세요' : '';
      case 2:
        return !(form.user_draft && form.user_draft.trim()) ? '경험을 작성해주세요 (리뷰의 핵심입니다!)' : '';
      default:
        return '';
    }
  };

  const isNextDisabled = !canProceedToNextStep();
  const missingFieldsMsg = getMissingFieldsMessage();

  const handleNext = () => {
    if (!isLastStep && canProceedToNextStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) setCurrentStep((prev) => prev - 1);
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <form onSubmit={onSubmit} className="w-full max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <span
              key={index}
              className={`text-sm font-medium transition-colors duration-300 ${
                index <= currentStep ? 'text-blue-600' : 'text-gray-300'
              }`}
            >
              {step.title}
            </span>
          ))}
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px] mb-10">
        <CurrentStepComponent
          form={form}
          onChange={onChange}
          onAppendDraft={onAppendDraft}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={handlePrev}
          disabled={isFirstStep}
          className={`px-6 py-3 rounded-xl font-medium transition-colors ${
            isFirstStep
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          이전
        </button>

        {isLastStep ? (
          <button
            type="submit"
            disabled={isDisabled}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                생성 중...
              </>
            ) : (
              '리뷰 생성하기 ✨'
            )}
          </button>
        ) : (
          <div className="flex flex-col items-end gap-2">
            {missingFieldsMsg && (
              <p className="text-sm text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                ⚠️ {missingFieldsMsg}
              </p>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={isNextDisabled}
              className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${
                isNextDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-gray-100'
                  : 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-200'
              }`}
            >
              다음 단계로
            </button>
          </div>
        )}
      </div>
    </form>
  );
};
