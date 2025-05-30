import React from "react";
import { Typography, Paper } from "@mui/material";
import { Status, FinanceEntity } from "@/common/api/finance/entity"; // Assuming FinanceEntity is the correct type for finances array elements

export const TotalSpending = ({ finances }: { finances: FinanceEntity[] }) => {
  const total = finances.reduce((acc, curr) => acc + curr.amount, 0);
  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 150, justifyContent: 'center', alignItems: 'center' }}>
      <Typography variant="h6" color="primary">Total Spending</Typography>
      <Typography component="p" variant="h4">
        ${total.toFixed(2)}
      </Typography>
    </Paper>
  );
};

export const SpendingByCategory = ({ finances }: { finances: FinanceEntity[] }) => {
  const byCategory = finances.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 150 }}>
      <Typography variant="h6" color="primary" gutterBottom>Spending by Category</Typography>
      {Object.entries(byCategory).map(([category, amount]) => (
        <Typography key={category} variant="body1">
          {category}: ${amount.toFixed(2)}
        </Typography>
      ))}
      {Object.keys(byCategory).length === 0 && <Typography variant="body2">No spending data by category.</Typography>}
    </Paper>
  );
};

export const SubmissionStatusCounts = ({ finances }: { finances: FinanceEntity[] }) => {
  const counts = finances.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<Status, number>);

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 150 }}>
      <Typography variant="h6" color="primary" gutterBottom>Submission Statuses</Typography>
      {Object.entries(counts).map(([status, count]) => (
        <Typography key={status} variant="body1">
          {status}: {count}
        </Typography>
      ))}
      {Object.keys(counts).length === 0 && <Typography variant="body2">No submissions found.</Typography>}
    </Paper>
  );
};
