"use client";
import React from "react";
import "./reimbursements.css";
import { DataTable } from "../components/DataTable";


function Reimbursements() {
    return (
        <div className="text">
            <h1>Reimbursements</h1>  
                <br /> 
                <div className="content-container">       
                    <DataTable />
                </div>
        </div>
    );
}

export default Reimbursements;