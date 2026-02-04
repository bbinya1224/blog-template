import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { ReviewPayload } from '@/shared/types/review';
import { Button } from '@/shared/ui/Button';
import { StepContext } from './wizard-steps/StepContext';
import { StepMenu } from './wizard-steps/StepMenu';
import { StepExperience } from './wizard-steps/StepExperience';
import { StepRefinement } from './wizard-steps/StepRefinement';

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

  const canProceedToNextStep = (): boolean => {
    switch (currentStep) {
      case 0:
        return !!(
          form.name.trim() &&
          form.location.trim()
        );
      case 1:
        return !!form.menu.trim();
      case 2:
        return !!(form.user_draft && form.user_draft.trim());
      case 3:
        return true;
      default:
        return true;
    }
  };

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

      <div className="min-h-[400px] mb-10">
        <CurrentStepComponent
          form={form}
          onChange={onChange}
          onAppendDraft={onAppendDraft}
        />
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <Button
          type="button"
          onClick={handlePrev}
          disabled={isFirstStep}
          variant="ghost"
        >
          이전
        </Button>

        {isLastStep ? (
          <Button
            type="submit"
            disabled={isDisabled}
            isLoading={isLoading}
            variant="primary"
            className="px-8 py-3 shadow-lg shadow-blue-200"
          >
            {isLoading ? '생성 중...' : '리뷰 생성하기 ✨'}
          </Button>
        ) : (
          <div className="flex flex-col items-end gap-2">
            {missingFieldsMsg && (
              <p className="text-sm text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                ⚠️ {missingFieldsMsg}
              </p>
            )}
            <Button
              type="button"
              onClick={handleNext}
              disabled={isNextDisabled}
              variant="primary"
              className="px-8 py-3 bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-200"
            >
              다음 단계로
            </Button>
          </div>
        )}
      </div>
    </form>
  );
};
