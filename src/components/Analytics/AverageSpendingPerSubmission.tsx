import React from "react";
import { Typography, Paper } from "@mui/material";
import { FinanceEntity, Status } from "@/common/api/finance/entity";

export const AverageSpendingPerSubmission = ({
  finances,
}: {
  finances: FinanceEntity[];
}) => {
  const approvedSubmissions = finances.filter(
    (item) => item.status === Status.APPROVED,
  );
  const totalApprovedAmount = approvedSubmissions.reduce(
    (acc, curr) => acc + curr.amount,
    0,
  );
  const countApproved = approvedSubmissions.length;
  const averageSpending =
    countApproved > 0 ? totalApprovedAmount / countApproved : 0;

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
      <Typography
        variant="h6"
        color="primary"
        align="center"
        gutterBottom
        sx={{ lineHeight: 1.2, mb: 0.5 }}
      >
        {" "}
        {/* Adjusted line height and margin */}
        Average Approved Spending
      </Typography>
      <Typography component="p" variant="h4">
        ${averageSpending.toFixed(2)}
      </Typography>
      <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
        {" "}
        {/* Added top margin */}({countApproved} approved submissions)
      </Typography>
    </Paper>
  );
};
