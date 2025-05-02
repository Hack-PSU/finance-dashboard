"use client";
import React, { useState } from "react";
import ButtonAppBar from "../Menu/Menu";
import TemporaryDrawer from "../Sidebar/Sidebar";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (state: "open" | "close") => {
    setOpen(state === "open");
  };

  return (
    <>
      <ButtonAppBar toggleDrawer={toggleDrawer} />
      <TemporaryDrawer open={open} onOpenChange={toggleDrawer} />
    </>
  );
}
