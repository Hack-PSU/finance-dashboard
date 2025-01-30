"use client";
import React, { useEffect, useState } from "react";
import {
  FinanceEntity,
  useAllFinances,
  useUpdateFinanceStatus,
} from "@/common/api/finance";
import {
  DataTable,
  TableColumn,
} from "@/components/DataTable/ReimbursementTable";
import { StatusCell } from "@/components/DataTable/StatusCell";

// MUI components for the snackbar
import { Snackbar, Alert, Box, Typography } from "@mui/material";


export default function Reimbursements() {
  const [finances, setFinances] = useState<FinanceEntity[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  // 1) Fetch all finances via your query
  const { data, error } = useAllFinances();
  useEffect(() => {
    if (data) {
      setFinances(data);
    }
    if (error) {
      setSnackbar({
        open: true,
        message: "Error fetching finances",
        severity: "error",
      });
    }
  }, [data, error]);

  // 2) Obtain the mutation function for patching status
  const updateFinanceStatus = useUpdateFinanceStatus();

  // 3) Handler for changing status
  const handleStatusChange = (rowId: string, newStatus: FinanceEntity["status"]) => {
    // Here we call the mutation, passing in { id: ..., status: ... }
    updateFinanceStatus.mutate(
      { id: rowId, status: newStatus },
      {
        onSuccess: () => {
          // Show a success message in the Snackbar
          setSnackbar({
            open: true,
            message: `Status updated to ${newStatus}`,
            severity: "success",
          });
        },
        onError: (err: Error) => {
          // Show an error message if the mutation fails
          setSnackbar({
            open: true,
            message: err?.message || "Error updating status",
            severity: "error",
          });
        },
      },
    );
  };

  // Define the columns for the DataTable
  const columns: TableColumn<FinanceEntity>[] = [
    {
      id: "submitterId",
      label: "Submitter",
      sortable: true,
    },
    {
      id: "amount",
      label: "Amount",
      sortable: true,
      render: (row) => `$${row.amount.toFixed(2)}`,
    },
    {
      id: "description",
      label: "Description",
      sortable: true,
    },
    {
      id: "category",
      label: "Category",
      sortable: true,
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      render: (row) => (
        <StatusCell
          status={row.status}
          onChange={(newStatus) => handleStatusChange(row.id, newStatus)}
        />
      ),
    },
    {
      id: "receiptUrl",
      label: "Receipt",
      render: (row) =>
        row.receiptUrl ? (
          <a href={row.receiptUrl} target="_blank" rel="noopener noreferrer">
            View Receipt
          </a>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <Box sx={{ padding: "1rem" }}>
      <Typography variant="h4" sx={{ mb: 4, color: "#252879" }}>
        Reimbursements
      </Typography>

      <DataTable
        columns={columns}
        data={finances}
        getRowId={(row) => row.id}
        searchPlaceholder="Search Finance Items..."
        maxHeight={600}
      />

      {/* Snackbar for notifications */}
      {snackbar && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar(null)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar(null)}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}
