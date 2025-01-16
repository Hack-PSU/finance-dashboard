"use client";
import AuthGuard from "./AuthGuard";
import FirebaseProvider from "./FirebaseProvider";
import { auth } from "@/common/config";

export default function LayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FirebaseProvider auth={auth}>
        <AuthGuard>{children}</AuthGuard>
      </FirebaseProvider>
    </>
  );
}
