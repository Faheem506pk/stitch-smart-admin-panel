
interface AddCustomerStepProgressProps {
  step: number;
  totalSteps?: number;
}
export function AddCustomerStepProgress({ step, totalSteps = 5 }: AddCustomerStepProgressProps) {
  return (
    <div className="mt-1 flex space-x-2">
      {Array.from({ length: totalSteps }).map((_, s) => {
        const idx = s + 1;
        return (
          <div
            key={idx}
            className={`h-1.5 rounded-full w-12 ${
              idx === step
                ? 'bg-primary'
                : idx < step
                  ? 'bg-primary/70'
                  : 'bg-gray-200'
            }`}
          />
        );
      })}
    </div>
  );
}
