"use client";
import React, { useEffect, useMemo, useState } from "react";
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
import { useAllUsers } from "@/common/api/user";
import { useAllOrganizers } from "@/common/api/organizer";

export default function Reimbursements() {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  // Fetch all finances using the React Query hook
  const { data: finances, error } = useAllFinances();

  const { data: usersData } = useAllUsers();
  const { data: organizerData } = useAllOrganizers();

  const submitterNames = useMemo(() => {
    if (!usersData || !organizerData) return {};

    const namesMap: Record<string, string> = {};

    usersData.forEach((user) => {
      namesMap[user.id] = `${user.firstName} ${user.lastName}`;
    });

    organizerData.forEach((organizer) => {
      if (!namesMap[organizer.id]) {
        namesMap[organizer.id] = `${organizer.firstName} ${organizer.lastName}`;
      }
    });

    return namesMap;
  }, [usersData, organizerData]);

  const usersMapping = useMemo(() => {
    if (!finances) return {};

    return finances.reduce(
      (acc, finance) => {
        acc[finance.submitterId] =
          submitterNames[finance.submitterId] || "Unknown";
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [finances, submitterNames]);

  useEffect(() => {
    if (error) {
      setSnackbar({
        open: true,
        message: "Error fetching finances",
        severity: "error",
      });
    }
  }, [error]);

  // Obtain the mutation function for updating the finance status
  const updateFinanceStatusMutation = useUpdateFinanceStatus();

  // Handler for changing status
  const handleStatusChange = (
    rowId: string,
    newStatus: FinanceEntity["status"],
  ) => {
    updateFinanceStatusMutation.mutate(
      { id: rowId, data: { status: newStatus } },
      {
        onSuccess: () => {
          setSnackbar({
            open: true,
            message: `Status updated to ${newStatus}`,
            severity: "success",
          });
        },
        onError: (err: Error) => {
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
      render: (row) => usersMapping[row.submitterId] || "Unknown",
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
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 4, 
          color: 'var(--accent-primary)',
          fontWeight: 700,
          textAlign: 'center'
        }}
      >
        Reimbursements
      </Typography>

      <DataTable
        columns={columns}
        data={finances || []} // if finances isn't loaded yet, pass an empty array
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
