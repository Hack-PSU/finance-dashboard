import React, { useState } from 'react';
import './menu.css';

type Tab = "Reimbursements" | "Analytics";

function SideNavbar() {
  const [activeTab, setActiveTab] = useState("Reimbursements");

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Dashboard</h2>
      <ul className="sidebar-menu">
        <li
          className={`sidebar-item ${activeTab === "Reimbursements" ? "active" : ""}`}
          onClick={() => handleTabClick("Reimbursements")}
        >
          Reimbursements
        </li>
        <li
          className={`sidebar-item ${activeTab === "Analytics" ? "active" : ""}`}
          onClick={() => handleTabClick("Analytics")}
        >
          Analytics
        </li>
      </ul>
    </div>
  );
}

export default SideNavbar;
