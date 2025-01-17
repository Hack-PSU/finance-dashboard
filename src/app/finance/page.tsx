// components/Reimbursements.tsx
"use client";

import React, { useEffect, useState } from "react";
import { FinanceEntity, Status, useAllFinances } from "@/common/api/finance";
import {
  DataTable,
  TableColumn,
} from "@/components/DataTable/ReimbursementTable";
import { StatusCell } from "@/components/DataTable/StatusCell";

// MUI components for the snackbar
import { Snackbar, Alert, Box, Typography } from "@mui/material";

function Reimbursements() {
  const [finances, setFinances] = useState<FinanceEntity[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  // Fetch finances when the component mounts
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

  // Handler for status change (Functionality to be implemented later)
  const handleStatusChange = (
    rowId: string,
    newStatus: FinanceEntity["status"],
  ) => {
    // Placeholder for future implementation
    console.log(`Change status of row ${rowId} to ${newStatus}`);
    // Example: Update the state locally (Optional)
    setFinances((prevFinances) =>
      prevFinances.map((finance) =>
        finance.id === rowId ? { ...finance, status: newStatus } : finance,
      ),
    );
    setSnackbar({
      open: true,
      message: `Status updated to ${newStatus}`,
      severity: "success",
    });
  };

  // Define the columns for the DataTable, matching only the desired FinanceEntity fields
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
      render: (row) => `$${row.amount.toFixed(2)}`, // Format amount as currency
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
      render: (row: { status: Status; id: string }) => (
        <StatusCell
          status={row.status}
          onChange={(newStatus: Status) =>
            handleStatusChange(row.id, newStatus)
          }
        />
      ),
    },
    {
      id: "receiptUrl",
      label: "Receipt",
      // Custom render for the receipt link
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

      {/* Reusable DataTable example */}
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

export default Reimbursements;
