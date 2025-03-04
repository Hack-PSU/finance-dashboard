"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Logo from "../../../public/android-chrome-512x512.png";
import Image from "next/image";

interface ButtonAppBarProps {
  toggleDrawer: (state: "open" | "close") => void;
}

export default function ButtonAppBar({ toggleDrawer }: ButtonAppBarProps) {
  const handleToggleDrawer = (open: boolean) => () => {
    toggleDrawer(open ? "open" : "close");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar 
        sx={{ 
          backgroundColor: 'var(--background-secondary)',
          borderBottom: '1px solid var(--border-color)',
          boxShadow: 'none'
        }} 
        position="static"
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            aria-label="menu"
            sx={{ 
              mr: 2, 
              color: 'var(--text-secondary)',
              '&:hover': {
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--text-primary)'
              }
            }}
            onClick={handleToggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Image src={Logo} alt="Logo" width="40" height="40" />
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              flexGrow: 1, 
              color: 'var(--text-primary)',
              ml: 3,
              fontSize: '1.1rem',
              letterSpacing: '0.5px'
            }}
          >
            Finance Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
