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

export type SortOrder = "asc" | "desc";

export type TableColumn<T> = {
  /** Unique key for the column; also used for sorting if `sortable` is true. */
  id: keyof T;
  /** Visible label for the column header. */
  label: string;
  /** If true, user can click the header to sort by this column. */
  sortable?: boolean;
  /**
   * Optional custom sort comparator. If provided, used instead of the default behavior.
   * Should return a negative number if a < b, positive if a > b, zero if equal.
   */
  sortFn?: (a: T, b: T, order: SortOrder) => number;
  /**
   * Optional custom cell rendering logic.
   * By default, it just does `row[column.id]`.
   */
  render?: (row: T) => React.ReactNode;
};

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  /** A function to uniquely identify each row (used as React key). */
  getRowId: (row: T) => string;
  /** Placeholder for the search input. */
  searchPlaceholder?: string;
  /** Maximum height of the table container (px or string). */
  maxHeight?: string | number;
  /** Optional element to place before the search field. */
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

    // Perform filtering and sorting
    const filteredData = data.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(low),
    );

    if (!sortColumn) {
      return filteredData;
    }

    // Find the column configuration
    const column = columns.find((c) => c.id === sortColumn);
    if (!column || !column.sortable) {
      return filteredData;
    }

    // Sort using custom comparator or default
    return filteredData.slice().sort((a, b) => {
      if (column.sortFn) {
        return column.sortFn(a, b, sortOrder);
      }

      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      // Default numeric comparison
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      // Default string comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (aStr < bStr) return sortOrder === "asc" ? -1 : 1;
      if (aStr > bStr) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, searchTerm, sortColumn, sortOrder, columns]);

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
          className="flex-1 border-2 border-gray-200 rounded-md bg-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F25C54]"
          InputProps={{ className: "text-gray-800" }}
        />
      </div>

      {/* Table */}
      <Paper className="bg-white rounded-lg shadow-sm overflow-hidden">
        <TableContainer
          className="overflow-y-auto"
          style={{
            maxHeight: typeof maxHeight === "number" ? maxHeight : undefined,
          }}
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
