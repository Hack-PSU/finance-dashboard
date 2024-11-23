"use client";
import React from "react"
import SideNavbar from "../components/Menu/Menu"
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/reimbursements");
  return (
    <div className="App">
      <SideNavbar />
      <div className="content">
      </div>
    </div>
  )
}