"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Projects", path: "/projects" },
    { name: "Events", path: "/events" },
    { name: "Sessions", path: "/sessions" },
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "Admin", path: "/admin" },
  ];

  return (
    <nav className="bg-gray-900 text-gray-300 px-6 py-3 flex gap-6 items-center shadow-lg">
      <h1 className="text-white font-bold text-xl tracking-wide">CODE-404</h1>
      <div className="flex gap-6 ml-8">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`transition font-medium ${
                isActive
                  ? "text-cyan-400 border-b-2 border-cyan-400 pb-1"
                  : "hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
