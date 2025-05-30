"use client";

import React from "react";
import { useAllFinances } from "@/common/api/finance";
import { Typography, Grid, CircularProgress, Alert } from "@mui/material";
// Paper component is no longer directly used here, Status is used in the widgets
import { TotalSpending, SpendingByCategory, SubmissionStatusCounts } from "@/components/Analytics/FinanceAnalyticsWidgets";


export default function FinanceAnalyticsPage(): React.JSX.Element {
  const { data: finances, isLoading, error } = useAllFinances();

  if (isLoading) {
    return (
      <Grid container justifyContent="center" alignItems="center" sx={{ height: "100vh" }}>
        <CircularProgress />
      </Grid>
    );
  }

  if (error || !finances) {
    return (
      <Grid container justifyContent="center" alignItems="center" sx={{ height: "100vh" }}>
        <Alert severity="error">Error fetching financial data: {error?.message || "No data"}</Alert>
      </Grid>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Typography variant="h4" component="h1" gutterBottom align="center" color="textPrimary" sx={{ mb: 4, color: '#F25C54' }}>
        Finance Analytics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <TotalSpending finances={finances} />
        </Grid>
        <Grid item xs={12} md={4}>
          <SpendingByCategory finances={finances} />
        </Grid>
        <Grid item xs={12} md={4}>
          <SubmissionStatusCounts finances={finances} />
        </Grid>
        {/* More analytics components can be added here */}
      </Grid>
    </div>
  );
}
