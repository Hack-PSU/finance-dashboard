"use client";
import React, { useEffect, useState } from "react";
import { FinanceEntity, getAllFinances } from "@/common/api/finance";
import { DataTable, TableColumn } from "@/components/Tables/ReimbursementTable";

// MUI components for the snackbar
import { Snackbar, Alert } from "@mui/material";

function Reimbursements() {
  const [finances, setFinances] = useState<FinanceEntity[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  // Fetch finances when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedFinances = await getAllFinances();
        setFinances(fetchedFinances.data);
      } catch (error) {
        console.error("Error fetching finances", error);
        setSnackbar({
          open: true,
          message: "Error fetching finances",
          severity: "error",
        });
      }
    };

    fetchData();
  }, []);

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
    <div style={{ padding: "1rem" }}>
      <h1>Reimbursements</h1>

      {/* Reusable DataTable example */}
      <DataTable
        columns={columns}
        data={finances}
        getRowId={(row) => row.id} // We still use `row.id` as the unique key, but we're not displaying it
        searchPlaceholder="Search Finance Items..."
        maxHeight={1000}
      />

      {/* Snackbar for errors */}
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
    </div>
  );
}

export default Reimbursements;
