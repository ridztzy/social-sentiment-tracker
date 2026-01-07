"use client";

interface ProgressBarProps {
  progress: number; // 0-100
  status?: string;
  showPercentage?: boolean;
  color?: 'green' | 'blue' | 'purple';
}

export default function ProgressBar({
  progress,
  status,
  showPercentage = true,
  color = 'green'
}: ProgressBarProps) {
  const colorClasses = {
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    purple: 'bg-purple-600'
  };

  const bgColor = colorClasses[color];

  return (
    <div className="w-full">
      {status && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {status}
          </span>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {progress}%
            </span>
          )}
        </div>
      )}
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className={`${bgColor} h-2.5 rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}
