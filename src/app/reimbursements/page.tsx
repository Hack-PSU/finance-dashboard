"use client";
import React from "react";
import "./reimbursements.css";
import { DataTable } from "../../components/Tables/ReimbursementTable";


function Reimbursements() {
  return (
      <div className="text"> 
              <div className="content-container">       
                  <DataTable />
              </div>
      </div>
  );
}

export default Reimbursements;
