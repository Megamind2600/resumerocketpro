interface ProgressBarProps {
  currentStep: number;
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  const steps = [
    { number: 1, label: "Upload Resume" },
    { number: 2, label: "Select Roles" },
    { number: 3, label: "Optimize" },
    { number: 4, label: "Preview & Pay" },
  ];

  return (
    <div className="bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep 
                      ? 'bg-primary text-white' 
                      : 'bg-neutral-200 text-neutral-500'
                  }`}>
                    {step.number}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    index <= currentStep 
                      ? 'text-neutral-800' 
                      : 'text-neutral-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-12 h-0.5 bg-neutral-200 mx-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
