// app/components/Reimbursements/ReimbursementDetail.tsx
"use client";

import {
  Category,
  FinanceEntity,
  useFinanceGetOne,
  useFinancePatchFinance,
} from "@hackpsu/react-sdk";
import React, { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

type EditableFields = Pick<
  FinanceEntity,
  | "amount"
  | "description"
  | "category"
  | "street"
  | "city"
  | "state"
  | "postalCode"
>;

export default function ReimbursementDetail({
  id,
}: {
  id: string;
}): React.JSX.Element {
  const router = useRouter();
  const { data: finance, isLoading, error } = useFinanceGetOne(id);
  const patchMutation = useFinancePatchFinance();

  const [form, setForm] = useState<EditableFields>({
    amount: 0,
    description: "",
    category: Category.Telephone_Rental,
    street: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  // initialize form
  useEffect(() => {
    if (finance) {
      const { amount, description, category, street, city, state, postalCode } =
        finance;
      setForm({
        amount,
        description,
        category,
        street,
        city,
        state,
        postalCode,
      });
    }
  }, [finance]);

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center h-full">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !finance) {
    return (
      <Typography color="error">
        Error loading reimbursement.
        <Button onClick={() => router.back()}>Go back</Button>
      </Typography>
    );
  }

  const handleChange =
    <K extends keyof EditableFields>(field: K) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const value = field === "amount" ? parseFloat(raw) : raw;
      setForm((prev) => ({ ...prev, [field]: value as EditableFields[K] }));
    };

  const handleBlur =
    <K extends keyof EditableFields>(field: K) =>
    () => {
      patchMutation.mutate(
        { id: finance.id, data: { [field]: form[field] } },
        {
          onSuccess: () =>
            setSnackbar({
              open: true,
              message: `${field} updated`,
              severity: "success",
            }),
          onError: (err: unknown) =>
            setSnackbar({
              open: true,
              message: (err instanceof Error ? err.message : undefined) ?? `Failed updating ${field}`,
              severity: "error",
            }),
        },
      );
    };

  return (
    <Paper className="p-6 max-w-2xl mx-auto space-y-6">
      <Typography variant="h4" className="text-[#F25C54]">
        Reimbursement Details
      </Typography>

      <Box className="space-y-4">
        {/* Read-only */}
        <Typography>
          <strong>ID:</strong> {finance.id}
        </Typography>
        <Typography>
          <strong>Status:</strong> {finance.status}
        </Typography>
        <Typography>
          <strong>Submitter:</strong> {finance.submitterType} (
          {finance.submitterId})
        </Typography>
        <Typography>
          <strong>Hackathon ID:</strong> {finance.hackathonId}
        </Typography>
        {finance.receiptUrl && (
          <Typography>
            <strong>Receipt:</strong>{" "}
            <a
              href={finance.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View
            </a>
          </Typography>
        )}
        <Typography>
          <strong>Created At:</strong>{" "}
          {new Date(finance.createdAt).toLocaleString()}
        </Typography>
        {finance.updatedBy && (
          <Typography>
            <strong>Updated By:</strong> {finance.updatedBy}
          </Typography>
        )}

        {/* Editable with onBlur->patch */}
        <TextField
          label="Amount"
          type="number"
          fullWidth
          value={form.amount}
          onChange={handleChange("amount")}
          onBlur={handleBlur("amount")}
        />

        <TextField
          label="Description"
          fullWidth
          value={form.description}
          onChange={handleChange("description")}
          onBlur={handleBlur("description")}
        />

        <TextField
          select
          label="Category"
          fullWidth
          value={form.category}
          onChange={handleChange("category")}
          onBlur={handleBlur("category")}
        >
          {Object.values(Category).map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Street"
          fullWidth
          value={form.street}
          onChange={handleChange("street")}
          onBlur={handleBlur("street")}
        />
        <TextField
          label="City"
          fullWidth
          value={form.city}
          onChange={handleChange("city")}
          onBlur={handleBlur("city")}
        />
        <TextField
          label="State"
          fullWidth
          value={form.state}
          onChange={handleChange("state")}
          onBlur={handleBlur("state")}
        />
        <TextField
          label="Postal Code"
          fullWidth
          value={form.postalCode}
          onChange={handleChange("postalCode")}
          onBlur={handleBlur("postalCode")}
        />

        <Box className="flex items-center space-x-4">
          <Button variant="outlined" onClick={() => router.back()}>
            Cancel
          </Button>
        </Box>
      </Box>

      {snackbar && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar(null)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert onClose={() => setSnackbar(null)} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Paper>
  );
}
