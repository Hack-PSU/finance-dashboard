"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MoneyIcon from "@mui/icons-material/AttachMoney";
import LoginIcon from "@mui/icons-material/Login";
import Link from "next/link";

interface TemporaryDrawerProps {
  open: boolean;
  onOpenChange: (state: "open" | "close") => void;
}

export default function TemporaryDrawer({
  open,
  onOpenChange,
}: TemporaryDrawerProps) {
  const menuItems = [
    { text: "Finance", path: "/finance" },
    { text: "Reimbursement", path: "/reimbursement" },
    { text: "Login", path: "/login" },
  ];

  const handleToggleDrawer = (open: boolean) => () => {
    onOpenChange(open ? "open" : "close");
  };

  const DrawerList = (
    <Drawer
      anchor="left"
      open={open}
      onClose={handleToggleDrawer(false)}
      PaperProps={{
        sx: {
          backgroundColor: "var(--background-secondary)",
          borderRight: "1px solid var(--border-color)",
          width: 280,
        },
      }}
    >
      <Box sx={{ width: 280 }} role="presentation">
        <List>
          {menuItems.map((item, index) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                href={item.path}
                onClick={handleToggleDrawer(false)}
                sx={{
                  py: 2,
                  "&:hover": {
                    backgroundColor: "var(--accent-primary)",
                    "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
                      color: "var(--text-primary)",
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: "var(--text-secondary)" }}>
                  {index == 0 ? (
                    <MoneyIcon />
                  ) : index == 1 ? (
                    <LoginIcon />
                  ) : null}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    "& .MuiListItemText-primary": {
                      color: "var(--text-secondary)",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );

  return DrawerList;
}
