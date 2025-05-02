"use client";
import React, { useState } from "react";
import ButtonAppBar from "../Menu/Menu";
import Sidebar from "../Sidebar/Sidebar";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (state: "open" | "close") => {
    setOpen(state === "open");
  };

  return (
    <>
      <ButtonAppBar toggleDrawer={toggleDrawer} />
      <Sidebar open={open} onOpenChange={toggleDrawer} />
    </>
  );
}
