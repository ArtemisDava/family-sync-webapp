import { useMediaQuery } from "./header";
import { useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 1024px)");

  if (
    (location.pathname === "/login" && !isMobile) ||
    (location.pathname === "/signup" && !isMobile)
  ) {
    return null;
  }

  return (
    <footer className="w-full border-t bg-white px-4 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} Family-Sync. All rights reserved.
      </div>
    </footer>
  );
}
