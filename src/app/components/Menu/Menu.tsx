"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import './menu.css';


type Tab = "Reimbursements" | "Analytics";

function SideNavbar() {
  const [activeTab, setActiveTab] = useState<Tab>("Reimbursements");

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="sidebar">
      <img src="android-chrome-512x512.png" alt="Logo" className='logo'></img>
      <h2 className="sidebar-title">Finance Dashboard</h2>
      <ul className="sidebar-menu">
        <li
          className={`sidebar-item ${activeTab === "Reimbursements" ? "active" : ""}`}
          onClick={() => handleTabClick("Reimbursements")}
        >
          <Link href="/reimbursements">Reimbursements</Link>
          
        </li>
        <li
          className={`sidebar-item ${activeTab === "Analytics" ? "active" : ""}`}
          onClick={() => handleTabClick("Analytics")}
        >
          <Link href="/analytics">Analytics</Link>
        </li>
      </ul>
    </div>
  );
}

export default SideNavbar;
