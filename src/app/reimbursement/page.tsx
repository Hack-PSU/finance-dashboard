"use client";
import React, { useState, FormEvent } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";
import { createFinanceForm } from "@/common/api/finance";
import { SubmitterType } from "@/common/api/finance/entity"; // Or wherever your enum is
import { useRouter } from "next/navigation"; // For programmatic navigation after success

export default function CreateReimbursementPage() {
  const router = useRouter();

  // Local form states
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [submitterType, setSubmitterType] = useState<SubmitterType>(
    SubmitterType.USER
  );
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // We'll store basic success/error feedback here
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  // This assumes that createFinanceForm exposes a React Query hook named `.useMutation()`
  // If your setup is different, adjust accordingly.
  const createFinanceMutation = createFinanceForm.useMutation({
    onSuccess: (data) => {
      // Show success, redirect or reset the form
      setSnackbar({
        open: true,
        message: "Reimbursement request submitted successfully!",
        severity: "success",
      });
      // Optionally navigate back or to a details page
      // router.push("/reimbursements");
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: "Error submitting reimbursement request",
        severity: "error",
      });
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Build FormData for the fields we want to send
    const formData = new FormData();
    // If your API expects these exact field names:
    formData.append("amount", amount);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("submitterType", submitterType);
    // If the server expects the file under e.g. "receipt" or "receiptFile"
    if (receiptFile) {
      formData.append("receipt", receiptFile);
    }

    createFinanceMutation.mutate(formData);
  };

  return (
    <Box sx={{ p: 2, maxWidth: 600, margin: "auto" }}>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h5" mb={2}>
          Submit Reimbursement
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Amount */}
          <TextField
            label="Amount"
            type="number"
            fullWidth
            required
            margin="normal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {/* Description */}
          <TextField
            label="Description"
            fullWidth
            required
            margin="normal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {/* Category */}
          <TextField
            label="Category"
            fullWidth
            required
            margin="normal"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          {/* Submitter Type (USER or ORGANIZER) */}
          <TextField
            select
            label="Submitter Type"
            fullWidth
            margin="normal"
            value={submitterType}
            onChange={(e) =>
              setSubmitterType(e.target.value as SubmitterType)
            }
          >
            <MenuItem value={SubmitterType.USER}>USER</MenuItem>
            <MenuItem value={SubmitterType.ORGANIZER}>ORGANIZER</MenuItem>
          </TextField>
          {/* Receipt File */}
          <Box mt={2}>
            <Button variant="outlined" component="label">
              Upload Receipt
              <input
                type="file"
                hidden
                onChange={(e) =>
                  setReceiptFile(e.target.files ? e.target.files[0] : null)
                }
              />
            </Button>
            {receiptFile && (
              <Typography variant="body2" mt={1}>
                Selected file: {receiptFile.name}
              </Typography>
            )}
          </Box>
          {/* Submit button */}
          <Box mt={3}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={createFinanceMutation.isLoading}
            >
              {createFinanceMutation.isLoading
                ? "Submitting..."
                : "Submit Request"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Snackbar for success/error notifications */}
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
