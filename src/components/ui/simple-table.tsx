import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface SimpleTableProps<T> {
  columns: {
    header: string
    accessor: keyof T | ((row: T) => React.ReactNode)
    cell?: (value: any, row: T) => React.ReactNode
  }[]
  data: T[]
  keyField: keyof T
}

export function SimpleTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
}: SimpleTableProps<T>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((row) => (
              <TableRow key={String(row[keyField])}>
                {columns.map((column, colIndex) => {
                  const value = typeof column.accessor === 'function' 
                    ? column.accessor(row)
                    : row[column.accessor];
                  
                  const cellContent = column.cell 
                    ? column.cell(value, row) 
                    : (React.isValidElement(value) ? value : String(value ?? ''));
                  
                  return (
                    <TableCell key={colIndex}>
                      {cellContent}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
