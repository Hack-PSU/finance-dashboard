"use client"; // If using state and effects directly in this component

import React, { useState, useMemo } from "react";
import { Paper, Typography, TextField, Grid, Box } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FinanceEntity } from "@/common/api/finance/entity";
import {
  format,
  parseISO,
  isWithinInterval,
  startOfMonth,
  endOfDay,
} from "date-fns";

const formatDateForInput = (date: Date): string => format(date, "yyyy-MM-dd");

export const SpendingTrendChart = ({
  finances,
}: {
  finances: FinanceEntity[];
}) => {
  const [startDate, setStartDate] = useState<string>(() =>
    formatDateForInput(startOfMonth(new Date())),
  );
  const [endDate, setEndDate] = useState<string>(() =>
    formatDateForInput(endOfDay(new Date())),
  );

  const filteredAndAggregatedData = useMemo(() => {
    if (!finances || finances.length === 0) return [];

    const start = parseISO(startDate);
    const end = endOfDay(parseISO(endDate));

    const dailySpending: Record<string, number> = {};

    finances.forEach((item) => {
      // Ensure item.createdAt is treated as a Date object
      const itemDate =
        typeof item.createdAt === "string"
          ? parseISO(item.createdAt)
          : item.createdAt;
      if (isWithinInterval(itemDate, { start, end })) {
        const day = format(itemDate, "yyyy-MM-dd");
        dailySpending[day] = (dailySpending[day] || 0) + item.amount;
      }
    });

    return Object.entries(dailySpending)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [finances, startDate, endDate]);

  return (
    <Paper
      sx={{ p: 2, display: "flex", flexDirection: "column", minHeight: 400 }}
    >
      <Typography variant="h6" color="primary" gutterBottom>
        Spending Trends
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Grid>
      </Grid>
      {filteredAndAggregatedData.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 200,
          }}
        >
          <Typography variant="body1">
            No spending data for the selected period.
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredAndAggregatedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(tick) => format(parseISO(tick), "MMM dd")}
            />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <Tooltip
              formatter={(value: number, name: string, props: any) => [
                `$${value.toFixed(2)}`,
                props.payload.date,
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
              name="Spending"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};
