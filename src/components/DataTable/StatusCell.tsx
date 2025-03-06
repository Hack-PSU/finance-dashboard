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
import { Status } from "@/common/api/finance";
import { styled } from "@mui/material/styles";

interface StatusCellProps {
  status: Status;
  onChange?: (newStatus: Status) => void;
}

// Define color mapping for each status
const statusColors: Record<Status, string> = {
  APPROVED: "var(--accent-primary)", // Use theme accent color
  PENDING: "#FFA726",
  REJECTED: "#FF5252",
  DEPOSIT: "#000000", // Include DEPOSIT status even if not used in UI
};
// Styled FormControl to apply dynamic border color
const StyledFormControl = styled(FormControl)<{ status: Status }>(
  ({ status }) => ({
    minWidth: 120,
    "& .MuiInputLabel-root": {
      color: "var(--text-primary)",
    },
    "& .MuiOutlinedInput-root": {
      color: "var(--text-primary)",
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
      color: "var(--text-primary)",
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
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: "var(--background-secondary)",
                border: "1px solid var(--border-color)",
              },
            },
          }}
          sx={{
            color: "var(--text-primary)",
            "& .MuiOutlinedInput-input": {
              padding: "8px 10px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderWidth: 2,
            },
            "& .MuiMenuItem-root": {
              color: "var(--text-primary)",
              backgroundColor: "var(--background-secondary)",
              "&:hover": {
                backgroundColor: "var(--accent-primary)",
              },
              "&.Mui-selected": {
                backgroundColor: "var(--accent-primary)",
                "&:hover": {
                  backgroundColor: "var(--accent-hover)",
                },
              },
            },
          }}
        >
          <MenuItem
            value="APPROVED"
            sx={{
              color: statusColors.APPROVED,
              "&:hover": {
                backgroundColor: "var(--accent-primary)",
                color: "var(--text-primary)",
              },
            }}
          >
            Approved
          </MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="REJECTED">Rejected</MenuItem>
        </Select>
      </StyledFormControl>
    </Box>
  );
};
