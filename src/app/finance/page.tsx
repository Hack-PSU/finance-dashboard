// app/components/Reimbursements/index.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import type {
  Status,
  Category,
  SubmitterType,
} from "@/common/api/finance/entity";
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
import { FilterList as FilterListIcon } from "@mui/icons-material";
import { IconButton, Snackbar, Alert } from "@mui/material";
import { FilterDrawer } from "@/components/FilterDrawer/FilterDrawer";

export default function Reimbursements() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const [selectedSubmitterTypes, setSelectedSubmitterTypes] = useState<
    SubmitterType[]
  >([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<Status[]>([]);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const { data: finances, error } = useAllFinances();
  const updateMutation = useUpdateFinanceStatus();

  useEffect(() => {
    if (error) {
      setSnackbar({
        open: true,
        message: "Error fetching finances",
        severity: "error",
      });
    }
  }, [error]);

  const handleStatusUpdate = (id: string, newStatus: Status) => {
    updateMutation.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () =>
          setSnackbar({
            open: true,
            message: `Status updated to ${newStatus}`,
            severity: "success",
          }),
        onError: (e: Error) =>
          setSnackbar({ open: true, message: e.message, severity: "error" }),
      },
    );
  };

  const columns: TableColumn<FinanceEntity>[] = [
    {
      id: "submitterId",
      label: "Submitter",
      sortable: true,
      render: (r) => r.submitterId,
    },
    {
      id: "amount",
      label: "Amount",
      sortable: true,
      render: (r) => `$${r.amount.toFixed(2)}`,
    },
    { id: "description", label: "Description", sortable: true },
    { id: "category", label: "Category", sortable: true },
    {
      id: "status",
      label: "Status",
      sortable: true,
      render: (r) => (
        <StatusCell
          status={r.status}
          onChange={(s) => handleStatusUpdate(r.id, s)}
        />
      ),
    },
    {
      id: "receiptUrl",
      label: "Receipt",
      render: (r) =>
        r.receiptUrl ? (
          <a
            href={r.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F25C54] hover:underline"
          >
            View Receipt
          </a>
        ) : (
          "—"
        ),
    },
  ];

  const filtered = useMemo(() => {
    return (finances || []).filter((f) => {
      const byType =
        !selectedSubmitterTypes.length ||
        selectedSubmitterTypes.includes(f.submitterType);
      const byCat =
        !selectedCategories.length || selectedCategories.includes(f.category);
      const byStatus =
        !selectedStatuses.length || selectedStatuses.includes(f.status);
      const byMin = !minAmount || f.amount >= parseFloat(minAmount);
      const byMax = !maxAmount || f.amount <= parseFloat(maxAmount);
      return byType && byCat && byStatus && byMin && byMax;
    });
  }, [
    finances,
    selectedSubmitterTypes,
    selectedCategories,
    selectedStatuses,
    minAmount,
    maxAmount,
  ]);

  const toggleType = (t: SubmitterType) =>
    setSelectedSubmitterTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  const toggleCat = (c: Category) =>
    setSelectedCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  const toggleStatus = (s: Status) =>
    setSelectedStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const resetFilters = () => {
    setSelectedSubmitterTypes([]);
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setMinAmount("");
    setMaxAmount("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h2 className="text-3xl font-bold text-[#F25C54] text-center mb-8">
        Reimbursements
      </h2>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selectedSubmitterTypes={selectedSubmitterTypes}
        selectedCategories={selectedCategories}
        selectedStatuses={selectedStatuses}
        minAmount={minAmount}
        maxAmount={maxAmount}
        onToggleSubmitterType={toggleType}
        onToggleCategory={toggleCat}
        onToggleStatus={toggleStatus}
        onMinAmountChange={setMinAmount}
        onMaxAmountChange={setMaxAmount}
        onReset={resetFilters}
      />

      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(r) => r.id}
        searchPlaceholder="Search finance items..."
        maxHeight={600}
        startAdornment={
          <IconButton
            onClick={() => setDrawerOpen(true)}
            className="text-gray-700 hover:text-[#F25C54] hover:bg-[#F25C54] hover:bg-opacity-10 rounded"
          >
            <FilterListIcon />
          </IconButton>
        }
      />

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
            className="font-medium"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </div>
  );
}
