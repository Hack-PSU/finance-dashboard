// components/DataTable/StatusCell.tsx
import React from "react";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  SelectChangeEvent,
} from "@mui/material";
import { styled } from "@mui/system";
import { Status } from "@/common/api/finance";

interface StatusCellProps {
  status: Status;
  onChange?: (newStatus: Status) => void;
}

// Define color mapping for each status
const statusColors: Record<Status, string> = {
  APPROVED: "#4CAF50", // Green
  PENDING: "#FF9800", // Orange
  REJECTED: "#F44336", // Red
};

// Styled FormControl to apply dynamic border color
const StyledFormControl = styled(FormControl)<{ status: Status }>(
  ({ status }) => ({
    minWidth: 120,
    "& .MuiInputLabel-root": {
      color: statusColors[status],
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: statusColors[status],
      },
      "&:hover fieldset": {
        borderColor: statusColors[status],
      },
      "&.Mui-focused fieldset": {
        borderColor: statusColors[status],
      },
    },
    "& .MuiSelect-icon": {
      color: statusColors[status],
    },
  }),
);

export const StatusCell: React.FC<StatusCellProps> = ({ status, onChange }) => {
  const handleChange = (event: SelectChangeEvent) => {
    const newStatus = event.target.value as Status;
    if (onChange) {
      onChange(newStatus);
    }
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <StyledFormControl variant="outlined" size="small" status={status}>
        <InputLabel id="status-select-label">Status</InputLabel>
        <Select
          labelId="status-select-label"
          value={status}
          onChange={handleChange}
          label="Status"
          sx={{
            "& .MuiOutlinedInput-input": {
              padding: "8px 10px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderWidth: 2,
            },
          }}
        >
          <MenuItem value="APPROVED">Approved</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="REJECTED">Rejected</MenuItem>
        </Select>
      </StyledFormControl>
    </Box>
  );
};
