import * as React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export type RiskLevel = 'low' | 'medium' | 'high';

export interface Report {
  id: string;
  studentName: string;
  grade: string;
  gender?: string; // Make it optional with ?
  lastAssessment: string;
  wellnessScore: number;
  riskLevel: RiskLevel;
  interventions: number;
  lastUpdated: string;
}

export const columns: ColumnDef<Report>[] = [
  {
    accessorKey: "studentName",
    header: ({ column }: { column: any }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="p-0 hover:bg-transparent"
      >
        Student Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "grade",
    header: "Grade",
  },
  {
    accessorKey: "lastAssessment",
    header: "Last Assessment",
    cell: ({ row }) => {
      const date = new Date(row.getValue("lastAssessment") as string);
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    accessorKey: "wellnessScore",
    header: ({ column }: { column: any }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Wellness Score
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const score = row.getValue("wellnessScore") as number;
      return <div className="text-right font-medium">{score}</div>;
    },
  },
  {
    accessorKey: "riskLevel",
    header: "Risk Level",
    cell: ({ row }) => {
      const riskLevel = row.getValue("riskLevel") as RiskLevel;
      const riskLevelStyles = {
        low: "bg-green-100 text-green-800",
        medium: "bg-yellow-100 text-yellow-800",
        high: "bg-red-100 text-red-800",
      };

      return (
        <div className="text-center">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${riskLevelStyles[riskLevel]}`}
          >
            {riskLevel}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "interventions",
    header: "Interventions",
    cell: ({ row }) => {
      const interventions = row.getValue("interventions") as number;
      return (
        <div className="text-center">
          <span className="font-medium">{interventions}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
    cell: ({ row }) => {
      const date = new Date(row.getValue("lastUpdated") as string);
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
];
