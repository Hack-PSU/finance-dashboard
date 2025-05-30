import React from "react";
import { Typography, Paper, Box } from "@mui/material"; // Added Box
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Status, FinanceEntity } from "@/common/api/finance/entity"; // Assuming FinanceEntity is the correct type for finances array elements
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import HighlightOff from "@mui/icons-material/HighlightOff";
import HourglassEmpty from "@mui/icons-material/HourglassEmpty";
import HelpOutline from "@mui/icons-material/HelpOutline"; // For other statuses

export const TotalSpending = ({ finances }: { finances: FinanceEntity[] }) => {
  const total = finances.reduce((acc, curr) => acc + curr.amount, 0);
  return (
    <Paper
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        height: 150,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography variant="h6" color="primary">
        Total Spending
      </Typography>
      <Typography component="p" variant="h4">
        ${total.toFixed(2)}
      </Typography>
    </Paper>
  );
};

export const SpendingByCategory = ({
  finances,
}: {
  finances: FinanceEntity[];
}) => {
  const byCategory = finances.reduce(
    (acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const chartData = Object.entries(byCategory).map(([name, value]) => ({
    name,
    value,
  }));

  if (chartData.length === 0) {
    return (
      <Paper
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <Typography variant="h6" color="primary" gutterBottom align="center">
          Spending by Category
        </Typography>
        <Typography variant="body2">No spending data by category.</Typography>
      </Paper>
    );
  }

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#AA336A",
    "#FF69B4",
    "#A0522D",
  ];

  return (
    <Paper
      sx={{ p: 2, display: "flex", flexDirection: "column", minHeight: 300 }}
    >
      <Typography variant="h6" color="primary" gutterBottom align="center">
        Spending by Category
      </Typography>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            
            outerRadius={110} // Increased outerRadius
            fill="#8884d8"
            dataKey="value"
            nameKey="name" // Ensure nameKey is set for Tooltip
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          {/* Updated Tooltip to show name and formatted value */}
          <Tooltip
            formatter={(value: number, name: string) => [
              `$${value.toFixed(2)}`,
              name,
            ]}
          />
          {/* <Legend /> component removed */}
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export const SubmissionStatusCounts = ({
  finances,
}: {
  finances: FinanceEntity[];
}) => {
  const counts = finances.reduce(
    (acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    },
    {} as Record<Status, number>,
  );

  const statusConfig = {
    [Status.APPROVED]: {
      icon: <CheckCircleOutline />,
      color: "green",
      label: "Approved",
    },
    [Status.REJECTED]: {
      icon: <HighlightOff />,
      color: "red",
      label: "Rejected",
    },
    [Status.PENDING]: {
      icon: <HourglassEmpty />,
      color: "orange",
      label: "Pending",
    },
  };

  const statusesToDisplay = Object.keys(counts) as Status[];

  if (finances.length === 0) {
    // Check if finances array is empty, which means counts will be empty
    return (
      <Paper
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 150,
        }}
      >
        <Typography variant="h6" color="primary" gutterBottom>
          Submission Statuses
        </Typography>
        <Typography variant="body2">No submissions found.</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{ p: 2, display: "flex", flexDirection: "column", minHeight: 150 }}
    >
      <Typography variant="h6" color="primary" gutterBottom>
        Submission Statuses
      </Typography>
      {statusesToDisplay.map((status) => {
        const count = counts[status];
        // Ensure status is a valid key for statusConfig
        const config = statusConfig[status as keyof typeof statusConfig] || {
          icon: <HelpOutline />,
          color: "grey",
          label: status,
        };

        return (
          <Box
            key={status}
            sx={{ display: "flex", alignItems: "center", mb: 1 }}
          >
            {React.cloneElement(config.icon, {
              sx: { color: config.color, mr: 1 },
            })}
            <Typography
              variant="body1"
              sx={{ color: config.color, fontWeight: "medium" }}
            >
              {config.label}:{" "}
              <Typography
                component="span"
                variant="body1"
                sx={{ fontWeight: "bold" }}
              >
                {count}
              </Typography>
            </Typography>
          </Box>
        );
      })}
    </Paper>
  );
};
