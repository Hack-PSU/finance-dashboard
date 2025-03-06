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
  Box,
  TablePagination,
  Typography,
} from "@mui/material";

export type TableColumn<T> = {
  /** Unique key for the column; also used for sorting if `sortable` is true. */
  id: keyof T;
  /** Visible label for the column header. */
  label: string;
  /** If true, user can click the header to sort by this column. */
  sortable?: boolean;
  /**
   * Optional custom cell rendering logic.
   * By default, it just does `row[column.id]`.
   */
  render?: (row: T) => React.ReactNode;
};

type SortOrder = "asc" | "desc";

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  /** A function to uniquely identify each row (used as React key). */
  getRowId: (row: T) => string;
  /** A placeholder for the search field. */
  searchPlaceholder?: string;
  /** Maximum height for the scrollable table. */
  maxHeight?: string | number;
}

/**
 * A reusable data table component that supports:
 * - Sorting by column (if `sortable` is set)
 * - Searching/filtering rows
 * - Sticky headers with a max table height
 * - Pagination with rows-per-page selection
 */
export function DataTable<T extends object>({
  columns,
  data,
  getRowId,
  searchPlaceholder = "Search…",
  maxHeight = 600,
}: DataTableProps<T>) {
  // Local states for search and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /**
   * Handle user changing the sort by clicking the header.
   * - If user clicks the same column, we toggle asc/desc.
   * - Otherwise, we switch to that column in ascending order.
   */
  const handleSort = (columnId: keyof T) => {
    if (sortColumn === columnId) {
      setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnId);
      setSortOrder("asc");
    }
  };

  /**
   * Filter + sort the data based on user input and selection.
   */
  const filteredSortedData = useMemo(() => {
    // 1) Filter by searchTerm
    const filtered = data.filter((row) => {
      // Convert entire row object to string for a naive search
      const rowString = JSON.stringify(row).toLowerCase();
      return rowString.includes(searchTerm.toLowerCase());
    });

    // 2) If no sortColumn, return filtered
    if (!sortColumn) {
      return filtered;
    }

    // 3) Sort by the selected column (asc or desc)
    return [...filtered].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      // Handle different data types
      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }

      const stringA = String(valA).toLowerCase();
      const stringB = String(valB).toLowerCase();

      if (stringA < stringB) return sortOrder === "asc" ? -1 : 1;
      if (stringA > stringB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, searchTerm, sortColumn, sortOrder]);

  /**
   * Apply pagination to the filteredSortedData.
   * This determines which rows are actually displayed on the current page.
   */
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredSortedData.slice(startIndex, endIndex);
  }, [filteredSortedData, page, rowsPerPage]);

  // Handlers for TablePagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Optional title or heading */}
      <Typography
        variant="h6"
        className="mb-2 font-bold text-center text-lg sm:text-xl text-gray-800"
      >
        Data Table
      </Typography>

      {/* Search box */}
      <Box className="mb-4">
        <TextField
          size="small"
          variant="outlined"
          fullWidth
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
          InputProps={{
            className: "text-gray-800",
          }}
          InputLabelProps={{
            className: "text-gray-800",
          }}
        />
      </Box>

      <Paper
        sx={{
          backgroundColor: "var(--background-secondary)",
          color: "var(--text-primary)",
        }}
      >
        <TableContainer
          className={`max-h-${typeof maxHeight === "number" ? maxHeight / 16 : maxHeight} overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200`}
        >
          <Table aria-label="data table" stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={String(col.id)}
                    sx={{
                      backgroundColor: "var(--background-secondary)",
                      color: "var(--text-primary)",
                      borderBottom: "1px solid var(--border-color)",
                      fontWeight: 600,
                    }}
                  >
                    {col.sortable ? (
                      <TableSortLabel
                        active={sortColumn === col.id}
                        direction={sortColumn === col.id ? sortOrder : "asc"}
                        onClick={() => handleSort(col.id)}
                        sx={{
                          "&.MuiTableSortLabel-root": {
                            color: "var(--text-primary)",
                          },
                          "&.MuiTableSortLabel-root:hover": {
                            color: "var(--text-primary)",
                          },
                          "&.Mui-active": {
                            color: "var(--accent-primary)",
                          },
                          "& .MuiTableSortLabel-icon": {
                            color: "var(--accent-primary)",
                          },
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
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <TableRow
                    key={getRowId(row)}
                    sx={{
                      "&:hover": {
                        backgroundColor: "var(--background-primary)",
                      },
                      "& td": {
                        color: "var(--text-primary)",
                        borderBottom: "1px solid var(--border-color)",
                      },
                    }}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={String(col.id)}
                        className="border-b border-gray-200 text-gray-800"
                      >
                        {col.render
                          ? col.render(row)
                          : // Default: just show the raw data
                            String(row[col.id] ?? "")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    align="center"
                    className="py-4 text-gray-800"
                  >
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination controls */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            backgroundColor: "var(--background-secondary)",
            padding: "8px",
          }}
        >
          <TablePagination
            component="div"
            count={filteredSortedData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              color: "var(--text-primary)",
              "& .MuiTablePagination-select": {
                color: "var(--text-primary)",
              },
              "& .MuiTablePagination-selectIcon": {
                color: "var(--text-primary)",
              },
              "& .MuiTablePagination-displayedRows": {
                color: "var(--text-primary)",
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
