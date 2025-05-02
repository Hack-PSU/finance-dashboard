// components/Navigation/TemporaryDrawer.tsx
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
import { usePathname } from "next/navigation";

interface TemporaryDrawerProps {
  open: boolean;
  onOpenChange: (state: "open" | "close") => void;
}

export default function TemporaryDrawer({
  open,
  onOpenChange,
}: TemporaryDrawerProps) {
  const pathname = usePathname();

  const menuItems = [
    { text: "Finance", path: "/finance", icon: <MoneyIcon /> },
    { text: "Reimbursement", path: "/reimbursement", icon: <MoneyIcon /> },
    { text: "Login", path: "/login", icon: <LoginIcon /> },
  ];

  const closeDrawer = () => onOpenChange("close");

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={closeDrawer}
      PaperProps={{
        className: "bg-white border-r border-gray-200 w-72",
      }}
    >
      <Box className="w-full">
        <List disablePadding>
          {menuItems.map(({ text, path, icon }) => {
            const isActive = pathname === path;
            return (
              <ListItem key={text} disablePadding>
                <Link href={path} onClick={closeDrawer} className="w-full">
                  <ListItemButton
                    className={
                      "flex items-center px-3 py-2 rounded-lg transition " +
                      (isActive
                        ? "bg-[#F25C54] bg-opacity-10 text-[#F25C54]"
                        : "text-gray-700 hover:bg-gray-100")
                    }
                  >
                    <ListItemIcon
                      className={
                        "min-w-[40px] w-10 h-10 flex items-center justify-center " +
                        (isActive ? "text-[#F25C54]" : "text-[#F25C54]")
                      }
                    >
                      {icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={text}
                      primaryTypographyProps={{
                        className: "font-medium",
                      }}
                    />
                  </ListItemButton>
                </Link>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
}
