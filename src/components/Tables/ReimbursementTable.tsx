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
  maxHeight = 800,
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
    return filtered.sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      // Basic sorting logic (string or number)
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
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
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      {/* Optional title or heading */}
      <Typography
        variant="h6"
        sx={{
          mb: 1,
          fontWeight: 600,
          textAlign: "center",
          fontSize: "1.1rem",
        }}
      >
        Data Table
      </Typography>

      {/* Search box */}
      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          variant="outlined"
          fullWidth
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 4, // Apple-like rounding
            },
          }}
        />
      </Box>

      <Paper
        elevation={3}
        sx={{
          borderRadius: 4, // Rounded corners for the container
          overflow: "hidden", // So sticky header corners stay neat
        }}
      >
        <TableContainer
          sx={{
            maxHeight,
            borderRadius: 4,
            // Apple-inspired subtle shadow or you can keep it default
          }}
        >
          <Table aria-label="dynamic table" stickyHeader>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "white",
                }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={String(col.id)}
                    sx={{
                      fontWeight: 600,
                      backgroundColor: "#f6f6f6", // Light background for headers
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    {/* If sortable, wrap the label in a TableSortLabel */}
                    {col.sortable ? (
                      <TableSortLabel
                        active={sortColumn === col.id}
                        direction={sortColumn === col.id ? sortOrder : "asc"}
                        onClick={() => handleSort(col.id)}
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
              {paginatedData.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    "&:hover": {
                      backgroundColor: "#fafafa",
                    },
                  }}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={String(col.id)}
                      sx={{
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      {col.render
                        ? col.render(row)
                        : // Default: just show the raw data
                          String(row[col.id] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination controls */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            paddingRight: 2,
            paddingTop: 1,
            paddingBottom: 1,
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
              "& .MuiTablePagination-displayedRows": {
                marginRight: 2,
              },
              "& .MuiTablePagination-toolbar": {
                paddingRight: 0,
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: 4,
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
