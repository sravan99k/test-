import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const COLORS = {
  low: '#4CAF50',    // Vibrant Green
  medium: '#FFC107',  // Bright Amber
  high: '#F44336',   // Bright Red
};

type RiskData = {
  low: number;
  medium: number;
  high: number;
};

export const RiskDistributionChart = ({ data }: { data: RiskData }) => {
  const chartData = [
    { name: 'Low', value: data.low, fill: COLORS.low },
    { name: 'Medium', value: data.medium, fill: COLORS.medium },
    { name: 'High', value: data.high, fill: COLORS.high },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [value, 'Students']}
            labelFormatter={(label) => `Risk Level: ${label}`}
          />
          <Legend />
          <Bar 
            dataKey="value" 
            name="Students" 
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <rect 
                key={`cell-${index}`} 
                fill={entry.fill} 
                x={0} 
                y={0} 
                width={0} 
                height={0} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
