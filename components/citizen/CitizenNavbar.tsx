"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Plus } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/my-reports", label: "My Reports" },
  { href: "/report", label: "Report Problem" },
  { href: "/map", label: "Water Map" },
];

export default function CitizenNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-surface-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Brand */}
        <Link
          href="/"
          className="text-[25px] font-black tracking-[-0.03em] text-ink-900"
        >
          AquaWatch AI
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-ink-900"
                    : "text-ink-700/70 hover:text-ink-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-md px-3.5 py-2 text-sm font-medium text-ink-800 transition-colors hover:bg-ink-900/[0.05]"
          >
            Log in
          </Link>

          <Link
            href="/register"
            className="rounded-md bg-ink-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-ink-800"
          >
            Register
          </Link>

          <Link
            href="/report"
            className="ml-1 flex items-center gap-1.5 rounded-md bg-teal-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-600"
          >
            <Plus
              className="h-4 w-4"
              strokeWidth={2.5}
            />
            Report
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-ink-800 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <nav
          className="border-t border-surface-line bg-surface-raised px-4 pb-4 pt-2 md:hidden"
          aria-label="Mobile"
        >
          <div className="flex flex-col gap-1">

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-ink-800 hover:bg-surface-sunken"
              >
                {link.label}
              </Link>
            ))}

            <div className="my-2 h-px bg-surface-line" />

            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-ink-800 hover:bg-surface-sunken"
            >
              Log in
            </Link>

            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="rounded-md bg-ink-900 px-3 py-2.5 text-center text-sm font-medium text-white"
            >
              Register
            </Link>

            <Link
              href="/report"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center justify-center gap-1.5 rounded-md bg-teal-500 px-3 py-2.5 text-sm font-semibold text-white"
            >
              <Plus
                className="h-4 w-4"
                strokeWidth={2.5}
              />
              Report a Problem
            </Link>

          </div>
        </nav>
      )}
    </header>
  );
}