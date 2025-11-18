type Step = {
  label: string;
  status: "completed" | "current" | "upcoming";
};

type StepIndicatorProps = {
  steps: Step[];
};

export function StepIndicator({ steps }: StepIndicatorProps) {
  return (
    <ol className="flex flex-wrap gap-3 text-sm font-medium text-gray-500">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const badgeStyles =
          step.status === "completed"
            ? "bg-blue-500 text-white"
            : step.status === "current"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-500";

        return (
          <li key={step.label} className="flex items-center text-sm">
            <span
              className={`mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${badgeStyles}`}
            >
              {index + 1}
            </span>
            <span
              className={
                step.status === "current" ? "text-gray-900" : undefined
              }
            >
              {step.label}
            </span>
            {!isLast && <span className="mx-3 text-gray-300">—</span>}
          </li>
        );
      })}
    </ol>
  );
}
