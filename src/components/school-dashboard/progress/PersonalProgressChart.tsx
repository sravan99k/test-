"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart as LineChartIcon, BookOpen } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------- Types ----------------------
interface ProgressData {
  date: string;
  overall: number;
  percentChange?: number;
  error?: number;
}

// ---------------------- Utils ----------------------
const computeProgressData = (
  data: ProgressData[],
  compareMode: "previous" | "first" = "previous"
): ProgressData[] => {
  return data.map((point, index) => {
    if (index === 0) {
      return { ...point, percentChange: 0, error: 0 };
    }
    const ref =
      compareMode === "previous" ? data[index - 1].overall : data[0].overall;
    const change = point.overall - ref;
    return {
      ...point,
      percentChange: Number(change.toFixed(1)),
      error: Math.abs(change) * 0.1,
    };
  });
};

// Student-Friendly Encouragement Messages
function getEncouragementMessage(score: number): string {
  if (score < 25) return "Great work!";
  if (score < 40) return "Keep it up!";
  if (score < 60) return "You're doing well!";
  if (score < 75) return "Hang in there!";
  return "We're here for you";
}

// Risk Levels (kid-friendly colors)
function getRiskLevel(score: number): "Good" | "Okay" | "Need Support" {
  if (score >= 70) return "Need Support";
  if (score >= 40) return "Okay";
  return "Good";
}

// Map risk to colors (using positive colors instead of red)
function getRiskColor(level: "Good" | "Okay" | "Need Support"): string {
  switch (level) {
    case "Good":
      return "text-green-600";
    case "Okay":
      return "text-blue-600";
    case "Need Support":
      return "text-blue-600";
  }
}

// ---------------------- Mock Data ----------------------
const rawData: ProgressData[] = [
  { date: "8/18/2025", overall: 48 },
  { date: "8/19/2025", overall: 38 },
  { date: "8/21/2025", overall: 48 },
  { date: "8/25/2025", overall: 55 },
  { date: "8/29/2025", overall: 51 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const { overall, percentChange } = payload[0].payload;
    const message = getEncouragementMessage(overall);
    return (
      <div className="bg-white p-3 border-2 border-blue-200 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800 mb-1">{label}</p>
        <p className="text-lg font-extrabold text-blue-600">{overall}% — {message}</p>
        {percentChange !== undefined && percentChange !== 0 && (
          <p
            className={
              percentChange >= 0 ? "text-green-600 font-semibold" : "text-blue-600 font-semibold"
            }
          >
            Change: {percentChange > 0 ? "+" : ""}
            {percentChange.toFixed(1)}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

// ---------------------- Main Component ----------------------
interface PersonalProgressChartProps {
  progressData?: { date: string; overall: number }[];
  period: string;
  onPeriodChange: (value: string) => void;
}

export const PersonalProgressChart = ({ progressData: externalData, period, onPeriodChange }: PersonalProgressChartProps) => {
  const [selectedPoint, setSelectedPoint] = useState<ProgressData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const rawDataToUse: ProgressData[] = externalData?.length
    ? externalData.map((item) => ({ date: item.date, overall: item.overall }))
    : rawData;

  const progressData = computeProgressData(rawDataToUse, "previous");

  const handlePointClick = (index: number) => {
    setSelectedPoint(progressData[index]);
    setShowDetails(true);
  };

  const CustomDot = (props: any) => {
    const { cx, cy, index, payload } = props;
    const message = getEncouragementMessage(payload.overall);
    return (
      <g>
        {/* Larger clickable area */}
        <circle
          cx={cx}
          cy={cy}
          r={18}
          fill="transparent"
          style={{ cursor: "pointer" }}
          onClick={() => handlePointClick(index)}
        />
        {/* Visible dot - larger and colorful */}
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#3B82F6"
          stroke="#fff"
          strokeWidth={2.5}
          style={{ cursor: "pointer" }}
          onClick={() => handlePointClick(index)}
        />
        {/* Label above dot */}
        <text
          x={cx}
          y={cy - 15}
          textAnchor="middle"
          fill="#6B7280"
          fontSize="11"
          fontWeight="600"
        >
          {payload.overall}%
        </text>
      </g>
    );
  };

  return (
    <Card className="border border-slate-200 bg-white shadow-none">
      <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
            <LineChartIcon className="w-6 h-6 text-blue-600" />
            How You're Doing Over Time
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">Track your check-ins and see your growth!</p>
        </div>
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="last30">Last 30 Days</SelectItem>
            <SelectItem value="last90">Last 3 Months</SelectItem>
            <SelectItem value="lastyear">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pb-8 pt-4 px-8">
        {progressData.length > 0 ? (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={progressData}
                margin={{ top: 30, right: 40, left: 20, bottom: 10 }}
              >
                {/* Soft grid lines */}
                <CartesianGrid strokeDasharray="5 5" stroke="#E5E7EB" strokeOpacity={0.5} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 13, fill: '#6B7280' }}
                  stroke="#D1D5DB"
                />
                <YAxis
                  tick={{ fontSize: 13, fill: '#6B7280' }}
                  stroke="#D1D5DB"
                >
                  <Label
                    value="Score %"
                    angle={-90}
                    position="insideLeft"
                    style={{ textAnchor: 'middle', fill: '#6B7280', fontWeight: 600 }}
                  />
                </YAxis>
                <Tooltip content={<CustomTooltip />} />
                {/* Thicker, colorful line */}
                <Line
                  type="monotone"
                  dataKey="overall"
                  stroke="#3B82F6"
                  strokeWidth={4}
                  name="Your Score"
                  dot={<CustomDot />}
                  activeDot={{ r: 8 }}
                />

              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-600 mb-4 text-lg">No check-ins yet!</p>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                onClick={() => (window.location.href = "/assessment")}
              >
                Take Your First Check-In
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-2 border-blue-200">
          {selectedPoint && (
            <>
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-50">
                <DialogHeader className="mb-4">
                  <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                    <Info className="w-6 h-6 text-blue-500" />
                    Check-In Details
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm font-semibold text-gray-600 mb-1">Date</p>
                      <p className="font-bold text-gray-800">{selectedPoint.date}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm font-semibold text-gray-600 mb-1">Score</p>
                      <p className="text-2xl font-extrabold text-blue-600">
                        {selectedPoint.overall}%
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {getEncouragementMessage(selectedPoint.overall)}
                      </p>
                    </div>
                  </div>

                  {/* Progress History */}
                  <div className="w-full max-w-4xl mx-auto bg-white border border-slate-200 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      Your Journey So Far:
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      {progressData
                        .filter((p) => p.date <= selectedPoint.date)
                        .map((p, idx) => {
                          const risk = getRiskLevel(p.overall);
                          return (
                            <li key={p.date} className="flex items-center justify-between py-1">
                              <span className="font-medium">{p.date}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-blue-600">{p.overall}%</span>
                                {idx > 0 && (
                                  <span
                                    className={
                                      p.percentChange! >= 0
                                        ? "text-green-600 text-xs font-semibold"
                                        : "text-blue-600 text-xs font-semibold"
                                    }
                                  >
                                    ({p.percentChange! > 0 ? "+" : ""}
                                    {p.percentChange}%)
                                  </span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
                <Button
                  onClick={() => setShowDetails(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PersonalProgressChart;
