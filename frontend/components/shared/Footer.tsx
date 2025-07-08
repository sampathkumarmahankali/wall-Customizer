import React from "react";

export default function Footer() {
  return (
    <footer className="w-full py-4 bg-gradient-to-r from-indigo-100 via-purple-100 to-blue-100 text-center text-gray-600 text-sm mt-8 border-t border-gray-200">
      <span>
        © {new Date().getFullYear()} Wallora. Crafted with <span className="text-pink-500">♥</span> for creative wall design.
      </span>
    </footer>
  );
} 