import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: ReactNode;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

const colorMap = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    iconBg: 'bg-blue-600',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    iconBg: 'bg-green-600',
  },
  orange: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    iconBg: 'bg-amber-600',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    iconBg: 'bg-purple-600',
  },
};

export function StatCard({ title, value, change, icon, color }: StatCardProps) {
  const colors = colorMap[color];
  
  return (
    <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-200">
      <div className="p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${colors.iconBg} rounded-md p-3`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {change && (
                  <div className={cn("ml-2 flex items-baseline text-sm font-semibold", 
                    change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  )}>
                    {change}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
