"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileUp, Pencil } from "lucide-react";
import { cn } from "@/lib/utils"; // shadcn utility for conditional classNames
import FileUpload from "../components/FileUpload";
import { useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    const [fileUploadOpen, setFileUploadOpen] = useState(false)
  const pathname = usePathname();

  const navItems = [
    {
      name: "Edit Stations",
      href: "/settings/edit-stations",
      icon: Pencil,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* SIDE APP BAR for Desktop */}
      <aside className="hidden md:flex md:max-w-56 flex-col border-r border-gray-700 bg-gray-800 text-white">
        <div className="flex-1 py-8">
          <nav className="space-y-2 sticky top-24">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <div key={item.name} className="w-full">
                    <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-800 transition",
                        active && "bg-blue-600 font-medium"
                    )}
                    >
                    <Icon className="h-4 w-4" />
                    {item.name}
                    </Link>
                </div>
              );
            })}
            <p 
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-800 transition active:bg-blue-600 active:font-medium"
                onClick={() => setFileUploadOpen(true)}
            >
                <FileUp className="h-4 w-4" />
                Upload Master File
            </p>
            <FileUpload fileUploadOpen={fileUploadOpen} setFileUploadOpen={setFileUploadOpen} />
          </nav>
        </div>
      </aside>

      {children}

      {/* BOTTOM APP BAR for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-gray-700 bg-gray-800 py-2 md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "w-full flex flex-col items-center justify-center gap-1 text-xs text-gray-400 hover:text-white transition",
                active && "text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
        <p 
            className="w-full flex flex-col items-center justify-center gap-1 text-xs text-gray-400 hover:text-white transition active:text-white active:font-medium"
            onClick={() => setFileUploadOpen(true)}
        >
            <FileUp className="h-4 w-4" />
            Upload Master File
        </p>
        <FileUpload fileUploadOpen={fileUploadOpen} setFileUploadOpen={setFileUploadOpen} />
      </nav>
    </div>
  );
}
