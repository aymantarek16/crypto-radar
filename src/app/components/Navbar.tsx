"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Navbar() {
  return (
    <motion.nav
      className="w-full h-14 flex items-center justify-between px-6 border-b border-gray-800 bg-gray-950"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo */}
      <Link href="/" className="text-xl font-bold text-white">
        Crypto<span className="text-blue-500">Radar</span>
      </Link>

    
    </motion.nav>
  );
}
