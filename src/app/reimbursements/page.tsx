"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

interface ReimbursementData {
  firstName: string;
  lastName: string;
  amount: number;
  status: string;
}

const mockData: ReimbursementData[] = [
  {
    firstName: "John",
    lastName: "Doe",
    amount: 100.0,
    status: "Pending",
  },
  {
    firstName: "Jane",
    lastName: "Doe",
    amount: 200.0,
    status: "Approved",
  },
];

const Reimbursements: React.FC = () => {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="Reimbursements Table">
        <TableHead>
          <TableRow>
            <TableCell>First Name</TableCell>
            <TableCell>Last Name</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockData.map((row) => (
            <TableRow key={row.firstName + row.lastName}>
              <TableCell>{row.firstName}</TableCell>
              <TableCell>{row.lastName}</TableCell>
              <TableCell>{row.amount}</TableCell>
              <TableCell>{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Reimbursements;
