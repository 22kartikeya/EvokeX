import React from 'react';
import { CheckCircle, Circle, Loader } from 'lucide-react';
import type { Step } from '../types';

interface StepsListProps {
  steps: Step[];
  currentStep: string;
}

export const StepsList: React.FC<StepsListProps> = ({ steps, currentStep }) => {
  const getStepIcon = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in-progress':
        return <Loader className="w-5 h-5 text-blue-400 animate-spin" />;
      default:
        return <Circle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="h-full bg-gray-800 border-r border-gray-700">
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <h2 className="font-semibold text-gray-200">Building</h2>
      </div>
      <div className="p-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-start gap-3 p-3 rounded-lg mb-2 ${
              currentStep === String(step.id) ? 'bg-gray-700' : ''
            }`}
          >
            {getStepIcon(step.status)}
            <div>
              <h3 className="font-medium text-gray-200">{step.title}</h3>
              <p className="text-sm text-gray-400">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};