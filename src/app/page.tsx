"use client";
import React from "react";
import SideNavbar from "../components/DashboardLayout/DashboardLayout";

export default function Home() {
  return (
    <div className="App">
      <SideNavbar />
      <div className="content"></div>
    </div>
  );
}
