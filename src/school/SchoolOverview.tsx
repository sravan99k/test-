import React from "react";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const classData = [
	{ grade: "Grade 6", total: 120, assessed: 98, atRisk: 15, wellbeingScore: 70 },
	{ grade: "Grade 7", total: 115, assessed: 103, atRisk: 18, wellbeingScore: 75 },
	{ grade: "Grade 8", total: 108, assessed: 91, atRisk: 22, wellbeingScore: 72 },
	{ grade: "Grade 9", total: 125, assessed: 106, atRisk: 28, wellbeingScore: 78 },
	{ grade: "Grade 10", total: 132, assessed: 114, atRisk: 31, wellbeingScore: 80 },
];

const totalStudents = classData.reduce((sum, grade) => sum + grade.total, 0);
const totalAssessed = classData.reduce((sum, grade) => sum + grade.assessed, 0);
const totalAtRisk = classData.reduce((sum, grade) => sum + grade.atRisk, 0);
const averageWellbeingScore =
	classData.reduce((sum, grade) => sum + grade.wellbeingScore, 0) / classData.length;

const riskLevelBadge = (riskLevel: "low" | "medium" | "high") => {
	if (riskLevel === "high")
		return <Badge className="bg-red-100 text-red-700 ml-2">🔴 High</Badge>;
	if (riskLevel === "medium")
		return <Badge className="bg-yellow-100 text-yellow-700 ml-2">🟡 Medium</Badge>;
	return <Badge className="bg-green-100 text-green-700 ml-2">🟢 Low</Badge>;
};

const SchoolOverview = () => {
	const { user } = useAuth();
	const userRole = user?.role;
	const isAdmin = user?.user_metadata?.isAdmin;
	// Unified role logic for counselor/admin
	const isCounselorOrAdmin = userRole === "management" || user?.user_metadata?.role === "counselor" || isAdmin;

	return (
		<div className="w-full max-w-7xl mx-auto px-4 py-10">
			{/* Top Summary Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				{/* Total Students */}
				<div className="bg-white rounded-lg shadow p-5 flex flex-col items-start min-h-[120px]">
					<div className="text-gray-500 text-sm mb-1 flex items-center gap-1">
						Total Students
						{isCounselorOrAdmin && (
							<Tooltip>
								<TooltipTrigger asChild>
									<span><Info className="w-3 h-3 text-blue-400 ml-1" /></span>
								</TooltipTrigger>
								<TooltipContent side="top">
									AI-flagged risk level. Verified by staff. No sensitive student data is exposed.
								</TooltipContent>
							</Tooltip>
						)}
					</div>
					<div className="text-4xl font-bold text-blue-600">{totalStudents}</div>
					<div className="text-xs text-gray-400 mt-1">Grades 6–10</div>
				</div>
				{/* Assessments Completed */}
				<div className="bg-white rounded-lg shadow p-5 flex flex-col items-start min-h-[120px]">
					<div className="text-gray-500 text-sm mb-1">Assessments Completed</div>
					<div className="text-4xl font-bold text-green-600">{totalAssessed}</div>
					<div className="text-xs text-gray-400 mt-1">
						{Math.round((totalAssessed / totalStudents) * 100)}% participation
					</div>
				</div>
				{/* Students Needing Support */}
				<div className="bg-white rounded-lg shadow p-5 flex flex-col items-start min-h-[120px]">
					<div className="text-gray-500 text-sm mb-1 flex items-center gap-1">
						Students Needing Support
						{isCounselorOrAdmin && riskLevelBadge("high")}
						{isCounselorOrAdmin && (
							<Tooltip>
								<TooltipTrigger asChild>
									<span><Info className="w-3 h-3 text-blue-400 ml-1" /></span>
								</TooltipTrigger>
								<TooltipContent side="top">
									AI-flagged risk level. Verified by staff. No sensitive student data is exposed.
								</TooltipContent>
							</Tooltip>
						)}
					</div>
					<div className="text-4xl font-bold text-orange-600">{totalAtRisk}</div>
					<div className="text-xs text-gray-400 mt-1">
						{Math.round((totalAtRisk / totalAssessed) * 100)}% of assessed
					</div>
				</div>
				{/* Average Wellbeing Score */}
				<div className="bg-white rounded-lg shadow p-5 flex flex-col items-start min-h-[120px]">
					<div className="text-gray-500 text-sm mb-1">Average Wellbeing Score</div>
					<div className="text-4xl font-bold text-purple-600">
						{averageWellbeingScore.toFixed(2)}
					</div>
					<div className="text-xs text-gray-400 mt-1">Out of 100</div>
				</div>
			</div>

			{/* Main Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
				{/* Left: Assessment Progress */}
				<div className="w-full">
					<div className="bg-white rounded-lg shadow p-5 h-full flex flex-col">
						<div className="text-lg font-semibold mb-2">
							Assessment Progress by Grade
						</div>
						<div className="text-xs text-gray-400 mb-4">
							Student participation in mental health assessments
						</div>
						<div className="space-y-4">
							{classData.map((grade, index) => (
								<div key={index} className="space-y-1">
									<div className="flex justify-between items-center">
										<span className="font-medium">{grade.grade}</span>
										<span className="text-xs text-gray-500">
											{grade.assessed}/{grade.total} students (
											{Math.round((grade.assessed / grade.total) * 100)}%)
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className="bg-blue-500 h-2 rounded-full"
											style={{
												width: `${Math.round(
													(grade.assessed / grade.total) * 100
												)}%`,
											}}
										></div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Right: Common Issues */}
				<div className="w-full min-w-[280px]">
					<div className="bg-white rounded-lg shadow p-5 h-full flex flex-col">
						<div className="text-lg font-semibold mb-2">Common Issues</div>
						<div className="text-xs text-gray-400 mb-4">
							Most reported mental health concerns
						</div>
						<div className="space-y-4">
							{[
								{ issue: "Academic Stress", percent: 68, count: 342 },
								{ issue: "Social Anxiety", percent: 45, count: 225 },
								{ issue: "Family Pressure", percent: 38, count: 190 },
								{ issue: "Body Image Concerns", percent: 32, count: 160 },
								{ issue: "Sleep Issues", percent: 29, count: 145 },
							].map((item, i) => (
								<div key={i} className="space-y-1">
									<div className="flex justify-between text-sm">
										<span>{item.issue}</span>
										<span className="text-gray-500">{item.percent}%</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className="bg-blue-500 h-2 rounded-full"
											style={{ width: `${item.percent}%` }}
										></div>
									</div>
									<div className="text-xs text-gray-500">
										{item.count} students
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* AI-Enhanced Reporting Section */}
			{isCounselorOrAdmin && (
				<div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8 flex flex-col gap-2">
					<div className="flex items-center gap-2 mb-2">
						<Info className="w-4 h-4 text-blue-500" />
						<span className="font-semibold text-blue-800">AI-Enhanced Reporting</span>
						<Tooltip>
							<TooltipTrigger asChild>
								<span className="ml-1 cursor-pointer text-gray-400">ⓘ</span>
							</TooltipTrigger>
							<TooltipContent side="top">
								This section uses AI to summarize risk and wellbeing trends. No sensitive student data is exposed. For management/counselor use only.
							</TooltipContent>
						</Tooltip>
					</div>
					<div className="text-sm text-blue-900">
						<b>Summary:</b> {totalAtRisk} students are currently flagged as needing support, representing {Math.round((totalAtRisk / totalAssessed) * 100)}% of those assessed. The average wellbeing score across all grades is {averageWellbeingScore.toFixed(2)} out of 100. <br />
						<b>AI Insight:</b> Most common issues are Academic Stress and Social Anxiety. Early intervention is recommended for high-risk students in Grades 8–10. <br />
						<span className="text-xs text-gray-500">(Mock data, for demonstration only)</span>
					</div>
				</div>
			)}

			{/* Further Analytics Visualization: Class Risk Distribution */}
			{isCounselorOrAdmin && (
				<div className="bg-white rounded-lg shadow p-6 mb-8">
					<div className="flex items-center gap-2 mb-3">
						<Info className="w-4 h-4 text-purple-500" />
						<span className="font-semibold text-purple-800">Class Risk Distribution</span>
						<Tooltip>
							<TooltipTrigger asChild>
								<span className="ml-1 cursor-pointer text-gray-400">ⓘ</span>
							</TooltipTrigger>
							<TooltipContent side="top">
								Visualizes the number of at-risk students per grade. For management/counselor use only. No sensitive student data is exposed.
							</TooltipContent>
						</Tooltip>
					</div>
					<div className="w-full overflow-x-auto">
						<table className="min-w-[400px] w-full text-sm">
							<thead>
								<tr className="text-left text-gray-600 border-b">
									<th className="py-2 pr-4">Grade</th>
									<th className="py-2 pr-4">Total Students</th>
									<th className="py-2 pr-4">At Risk</th>
									<th className="py-2 pr-4">% At Risk</th>
									<th className="py-2 pr-4">Wellbeing Score</th>
								</tr>
							</thead>
							<tbody>
								{classData.map((grade, idx) => (
									<tr key={idx} className="border-b last:border-0">
										<td className="py-2 pr-4 font-medium">{grade.grade}</td>
										<td className="py-2 pr-4">{grade.total}</td>
										<td className="py-2 pr-4 text-red-600 font-bold">{grade.atRisk}</td>
										<td className="py-2 pr-4">{Math.round((grade.atRisk / grade.total) * 100)}%</td>
										<td className="py-2 pr-4">{grade.wellbeingScore}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="text-xs text-gray-500 mt-2">(Mock data, for demonstration only)</div>
				</div>
			)}
		</div>
	);
};

export default SchoolOverview;
