"use client";

import * as React from "react";
import ReimbursementDetail from "@/components/Detail/Detail";

export default function FinancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // unwrap the promise:
  const { id } = React.use(params);

  return <ReimbursementDetail id={id} />; // Pass the id to the component
}
