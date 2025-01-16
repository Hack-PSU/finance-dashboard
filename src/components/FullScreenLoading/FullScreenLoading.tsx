import React from "react";
import { CircularProgress, Typography, Box } from "@mui/material";

const FullScreenLoading: React.FC = () => {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 3 }}>
        Loading...
      </Typography>
    </Box>
  );
};

export default FullScreenLoading;
