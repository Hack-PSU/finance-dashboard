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
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useAllUsers } from "@/common/api/user";
import { useAllOrganizers } from "@/common/api/organizer";
import { MenuItem, Select, FormControl, InputLabel, ListItemText, Checkbox, OutlinedInput } from "@mui/material";
import { Chip, Stack, FormControlLabel } from "@mui/material";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ExpandMore,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { Drawer, IconButton } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

export default function Reimbursements() {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const [selectedSubmitterTypes, setSelectedSubmitterTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSubmitterTypeChange = (type: string) => {
    setSelectedSubmitterTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

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

  const filteredFinances = useMemo(() => {
    return (finances || []).filter((f) => {
      const submitterType = organizerData?.some((o) => o.id === f.submitterId)
        ? "Organizer"
        : "Participant";

      const matchesType =
        selectedSubmitterTypes.length === 0 || selectedSubmitterTypes.includes(submitterType);

      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(f.category);

      return matchesType && matchesCategory;
    });
  }, [finances, organizerData, selectedSubmitterTypes, selectedCategories]);

  return (
    <Box sx={{ padding: "1rem" }}>
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          color: "var(--accent-primary)",
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        Reimbursements
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "white" }}>
          <FilterListIcon />
        </IconButton>
      </Box>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { backgroundColor: "#121212", color: "white", width: 300, padding: 2 },
        }}
      >
        <Typography variant="h5" sx={{ mb: 2 }}>
          Filters
        </Typography>
        <hr style={{ borderColor: 'white', marginBottom: '16px' }} />
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          Submitter Type
        </Typography>
        <Stack sx={{ mb: 3 }}>
          {["Organizer", "Participant"].map((type) => (
            <FormControlLabel
              key={type}
              control={
                <Checkbox
                  checked={selectedSubmitterTypes.includes(type)}
                  onChange={() =>
                    setSelectedSubmitterTypes((prev) =>
                      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
                    )
                  }
                  sx={{ color: "white" }}
                />
              }
              label={type}
              sx={{ color: "white"}}
            />
          ))}
        </Stack>

        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          Category
        </Typography>
        <Stack>
          {Array.from(new Set(finances?.map((f) => f.category) || [])).map((category) => (
            <FormControlLabel
              key={category}
              control={
                <Checkbox
                  checked={selectedCategories.includes(category)}
                  onChange={() =>
                    setSelectedCategories((prev) =>
                      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
                    )
                  }
                  sx={{ color: "white" }}
                />
              }
              label={category}
              sx={{ color: "white" }}
            />
          ))}
        </Stack>
      </Drawer>

      <DataTable
        columns={columns}
        data={filteredFinances}
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
