"use client";
import React from "react";
import "./reimbursements.css";
import { DataTable } from "../../components/DataTable";


function Reimbursements() {
    return (
        <div className="text"> 
                <br /> 
                <div className="content-container">       
                    <DataTable />
                </div>
        </div>
    );
}

export default Reimbursements;

