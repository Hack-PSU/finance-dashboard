// components/Layout/Header.tsx
"use client";

import React from "react";
import Link from "next/link";
import MenuIcon from "@mui/icons-material/Menu";
import Image from "next/image";
import Logo from "../../../public/android-chrome-512x512.png";

interface HeaderProps {
  toggleDrawer: (state: "open" | "close") => void;
}

export default function Header({ toggleDrawer }: HeaderProps) {
  const openDrawer = () => toggleDrawer("open");

  return (
    <header className="flex items-center bg-white border-b border-gray-200 px-4 h-16">
      <button
        onClick={openDrawer}
        aria-label="Open menu"
        className="p-2 mr-3 rounded hover:bg-[#F25C54] hover:bg-opacity-10 transition"
      >
        <MenuIcon className="w-6 h-6 text-gray-700 hover:text-[#F25C54]" />
      </button>

      <Link href="/" className="flex items-center">
        <Image src={Logo} alt="Logo" width={40} height={40} />
        <span className="ml-3 text-lg font-bold text-[#F25C54]">
          Finance Dashboard
        </span>
      </Link>
    </header>
  );
}
