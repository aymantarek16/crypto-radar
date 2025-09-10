"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useState } from "react";
import {
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineHome,
  AiOutlineStar,
  AiOutlineBell,
} from "react-icons/ai";

const links = [
  { href: "/", label: "Home", icon: <AiOutlineHome className="text-lg" /> },
  {
    href: "/watchlist",
    label: "Watchlist",
    icon: <AiOutlineStar className="text-lg" />,
  },
  {
    href: "/alerts",
    label: "Alerts",
    icon: <AiOutlineBell className="text-lg" />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ✅ Desktop Sidebar */}
      <motion.aside
        className="hidden md:flex h-full w-56 border-r border-gray-800 bg-gray-950 flex-col p-4"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl font-bold text-blue-500 px-3">CryptoRadar</h1>
        <nav className="flex flex-col gap-2 mt-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition",
                pathname === link.href
                  ? "bg-blue-600 !text-white font-bold"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
      </motion.aside>

      {/* ✅ Mobile Navbar */}
  <div className="md:hidden">
  <button
    onClick={() => setIsOpen(true)}
    className="fixed top-2 right-4 z-50 text-white text-2xl p-2 rounded-lg bg-gray-900/80 hover:bg-gray-800 shadow-lg"
    aria-label="Open Menu"
  >
    <AiOutlineMenu />
  </button>
</div>


      {/* ✅ Mobile Sidebar (Full Screen Overlay) */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 0.3 }}
        >
          {/* Fullscreen Sidebar */}
          <motion.aside
            className="relative w-full h-full bg-gray-950 p-6 flex flex-col"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white text-2xl p-2 rounded-lg hover:bg-gray-800"
              aria-label="Close Menu"
            >
              <AiOutlineClose />
            </button>

            <h1 className="text-2xl font-bold text-blue-500 mb-8">
              CryptoRadar
            </h1>

            <nav className="flex flex-col gap-4 text-lg">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition",
                    pathname === link.href
                      ? "bg-blue-600 !text-white font-bold"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.aside>
        </motion.div>
      )}

    </>
  );
}
