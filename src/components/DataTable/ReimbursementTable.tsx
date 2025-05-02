// components/DataTable/DataTable.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableSortLabel,
  TextField,
  TablePagination,
} from "@mui/material";

export type TableColumn<T> = {
  id: keyof T;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
};

type SortOrder = "asc" | "desc";

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  searchPlaceholder?: string;
  maxHeight?: string | number;
  startAdornment?: React.ReactNode;
}

export function DataTable<T extends object>({
  columns,
  data,
  getRowId,
  searchPlaceholder = "Search…",
  maxHeight = 600,
  startAdornment,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSort = (col: keyof T) => {
    if (sortColumn === col) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortOrder("asc");
    }
  };

  const filtered = useMemo(() => {
    const low = searchTerm.toLowerCase();
    return data
      .filter((row) => JSON.stringify(row).toLowerCase().includes(low))
      .sort((a, b) => {
        if (!sortColumn) return 0;
        const aVal = a[sortColumn],
          bVal = b[sortColumn];
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        if (aStr < bStr) return sortOrder === "asc" ? -1 : 1;
        if (aStr > bStr) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [data, searchTerm, sortColumn, sortOrder]);

  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  return (
    <div className="w-full">
      {/* Search */}
      <div className="flex items-center mb-4 space-x-4">
        {startAdornment && <div>{startAdornment}</div>}
        <TextField
          size="small"
          variant="outlined"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border-2 border-gray-200 rounded-md bg-gray-100 px-3 py-2
                     focus:outline-none focus:ring-2 focus:ring-[#F25C54]"
          InputProps={{ className: "text-gray-800" }}
        />
      </div>

      {/* Table */}
      <Paper className="bg-white rounded-lg shadow-sm overflow-hidden">
        <TableContainer
          className={`max-h-[${typeof maxHeight === "number" ? maxHeight + "px" : maxHeight}] overflow-y-auto`}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow className="bg-gray-100">
                {columns.map((col) => (
                  <TableCell
                    key={String(col.id)}
                    className="py-3 px-4 text-left text-gray-700 font-semibold border-b border-gray-200"
                  >
                    {col.sortable ? (
                      <TableSortLabel
                        active={sortColumn === col.id}
                        direction={sortColumn === col.id ? sortOrder : "asc"}
                        onClick={() => handleSort(col.id)}
                        className="text-gray-700"
                        sx={{
                          "&.Mui-active": { color: "#F25C54" },
                          "& .MuiTableSortLabel-icon": { color: "#F25C54" },
                        }}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : (
                      col.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((row) => (
                  <TableRow key={getRowId(row)} className="hover:bg-gray-50">
                    {columns.map((col) => (
                      <TableCell
                        key={String(col.id)}
                        className="py-3 px-4 text-gray-800 border-b border-gray-200"
                      >
                        {col.render
                          ? col.render(row)
                          : String(row[col.id] ?? "")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-4 text-center text-gray-800"
                  >
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <div className="flex justify-end p-2 bg-white">
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_e, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(+e.target.value);
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            className="text-gray-700"
          />
        </div>
      </Paper>
    </div>
  );
}
