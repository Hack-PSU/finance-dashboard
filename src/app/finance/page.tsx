"use client";
import React, { useEffect, useMemo, useState } from "react";
import type { Status, Category, SubmitterType } from "@/common/api/finance/entity";
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
import { Checkbox } from "@mui/material";
import { Stack, FormControlLabel } from "@mui/material";
import { Drawer, IconButton, Button, TextField } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FirstPageIcon from '@mui/icons-material/FirstPage';

export default function Reimbursements() {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const [selectedSubmitterTypes, setSelectedSubmitterTypes] = useState<SubmitterType[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<Status[]>([]);
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");

  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleStatusChangeFilter = (status: Status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
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
        selectedSubmitterTypes.length === 0 || selectedSubmitterTypes.includes(submitterType as SubmitterType);

      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(f.category as Category);

      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(f.status as Status);

      const matchesMinAmount =
        minAmount === "" || f.amount >= parseFloat(minAmount);

      const matchesMaxAmount =
        maxAmount === "" || f.amount <= parseFloat(maxAmount);

      return matchesType && matchesCategory && matchesStatus && matchesMinAmount && matchesMaxAmount;
    });
  }, [finances, organizerData, selectedSubmitterTypes, selectedCategories, selectedStatuses, minAmount, maxAmount]);

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

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { backgroundColor: "#121212", color: "white", width: 300, padding: 2 },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5">Filters</Typography>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: "white" }}>
            <FirstPageIcon />
          </IconButton>
        </Box>
        <hr style={{ borderColor: 'white', marginBottom: '16px' }} />

        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          Submitter Type
        </Typography>
        <Stack sx={{ mb: 3 }}>
          {(["Organizer", "Participant"] as SubmitterType[]).map((type) => (
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
        <Stack sx={{ mb: 3 }}>
          {[...new Set(finances?.map((f) => f.category) || [])].map((category) => {
            const cat = category as Category;
            return (
              <FormControlLabel
                key={cat}
                control={
                  <Checkbox
                    checked={selectedCategories.includes(cat)}
                    onChange={() =>
                      setSelectedCategories((prev) =>
                        prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                      )
                    }
                    sx={{ color: "white" }}
                  />
                }
                label={cat}
                sx={{ color: "white"}}
              />
            );
          })}
        </Stack>

        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          Status
        </Typography>
        <Stack sx={{ mb: 3 }}>
          {(["PENDING", "APPROVED", "REJECTED"] as Status[]).map((status) => (
            <FormControlLabel
              key={status}
              control={
                <Checkbox
                  checked={selectedStatuses.includes(status)}
                  onChange={() => handleStatusChangeFilter(status)}
                  sx={{ color: "white" }}
                />
              }
              label={status.charAt(0) + status.slice(1).toLowerCase()}
              sx={{ color: "white"}}
            />
          ))}
        </Stack>

        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          Amount Range
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Min"
            variant="outlined"
            size="small"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            sx={{ input: { color: "white" }, label: { color: "white" }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'white' }, '&:hover fieldset': { borderColor: 'white' }, '&.Mui-focused fieldset': { borderColor: 'white' } } }}
            type="number"
            inputProps={{ min: 0, step: "0.01" }}
          />
          <TextField
            label="Max"
            variant="outlined"
            size="small"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            sx={{ input: { color: "white" }, label: { color: "white" }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'white' }, '&:hover fieldset': { borderColor: 'white' }, '&.Mui-focused fieldset': { borderColor: 'white' } } }}
            type="number"
            inputProps={{ min: 0, step: "0.01" }}
          />
        </Stack>

        <Button
          variant="outlined"
          onClick={() => {
            setSelectedSubmitterTypes([]);
            setSelectedCategories([]);
            setSelectedStatuses([]);
            setMinAmount("");
            setMaxAmount("");
          }}
          sx={{ color: "white", borderColor: "white" }}
        >
          Reset Filters
        </Button>
      </Drawer>

      <DataTable
        columns={columns}
        data={filteredFinances}
        getRowId={(row) => row.id}
        searchPlaceholder="Search Finance Items..."
        maxHeight={600}
        startAdornment={
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "white" }}>
            <FilterListIcon />
          </IconButton>
        }
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
