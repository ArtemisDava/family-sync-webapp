import { useState, useEffect, useCallback, useRef } from "react";
import { IonIcon } from "@ionic/react";
import { menu } from "ionicons/icons";
import { handleMenu } from "./menu";
import { Link, useLocation } from "react-router-dom";
import Button from "@mui/material/Button";
import { useUser } from "../../contexts/user.context";
import { useNavigate } from "react-router-dom";

const navLinks = [
  { name: "HOME", to: "/" },
  { name: "ABOUT", to: "/" },
];

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
};

export default function Header() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuState, setMenuState] = useState<"menu" | "close">("close");
  const menuRef = useRef<HTMLDivElement>(null);

  const isMobile = useMediaQuery("(max-width: 1024px)");
  const showMenu = isMobile ? menuState === "menu" : true;

  const toggleMenu = useCallback(() => {
    const newState = menuState === "menu" ? "close" : "menu";
    setMenuState(newState);
    handleMenu({ name: newState });
  }, [menuState]);

  useEffect(() => {
    if (!isMobile && menuState === "menu") {
      setMenuState("close");
    }
  }, [isMobile, menuState]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobile &&
        menuState === "menu" &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuState("close");
        handleMenu({ name: "close" });
      }
    };

    if (menuState === "menu" && isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuState, isMobile]);

  const navLinksClasses = "text-base hover:text-[#6DBE45] duration-200";

  if (location.pathname === "/login" || location.pathname === "/singup") {
    return null;
  }

  return (
    <header className="bg-white text-black h-24 z-15 relative">
      <nav
        ref={menuRef}
        className="max-w-[72rem] mx-auto  bg-whitemd:px-4 xl:px-0 py-5 text-base  lg:flex md:items-center lg:justify-between"
      >
        <div className="flex justify-between items-center">
          <Link to="/" className="text-3xl font-bold cursor-pointer">
            Family-Sync
          </Link>

          <span className="text-3xl cursor-pointer mx-2 lg:hidden flex items-center justify-center">
            <IonIcon icon={menu} onClick={toggleMenu} />
          </span>
        </div>

        {showMenu && (
          <ul className="lg:flex lg:items-center bg-white z-10 lg:z-auto lg:static absolute  w-full left-0 lg:w-auto lg:py-0 py-4 lg:pl-0 pl-4 top-[70px] transition-all ease-in duration-200">
            {navLinks.map((link) => (
              <li key={link.name} className="text-black mx-4 my-6 md:my-0">
                <Button
                  href="/"
                  className={navLinksClasses}
                  variant="text"
                  color="inherit"
                  onClick={toggleMenu}
                  sx={{
                    ":hover": {
                      fontWeight: "bold",
                      background: "transparent",
                    },
                  }}
                >
                  {link.name}
                </Button>
              </li>
            ))}
            {!user && (
              <>
                <li>
                  <Button
                    variant="text"
                    onClick={() => navigate("/login")}
                    size="small"
                    color="inherit"
                    sx={{
                      ":hover": {
                        fontWeight: "bold",
                        background: "transparent",
                      },
                    }}
                  >
                    Login
                  </Button>
                </li>
              </>
            )}
            {user && (
              <>
                {user.role === "admin" && (
                  <li className="mx-4 my-6 md:my-0">
                    <Button
                      variant="text"
                      size="small"
                      color="inherit"
                      className="mx-4"
                      sx={{
                        ":hover": {
                          fontWeight: "bold",
                          background: "transparent",
                        },
                      }}
                      onClick={() => navigate("/admin/preview")}
                    >
                      Admin Panel
                    </Button>
                  </li>
                )}
                <li className="mx-4 my-6 md:my-0">
                  <Button
                    variant="text"
                    size="small"
                    color="inherit"
                    className="mx-4"
                    sx={{
                      ":hover": {
                        fontWeight: "bold",
                        background: "transparent",
                      },
                    }}
                    onClick={() => navigate("/schedules")}
                  >
                    Schedule
                  </Button>
                </li>
                <li className="mx-4 my-6 md:my-0">
                  <Button
                    variant="text"
                    size="small"
                    color="inherit"
                    className="mx-4"
                    sx={{
                      ":hover": {
                        fontWeight: "bold",
                        background: "transparent",
                      },
                    }}
                    onClick={() => navigate("/profile")}
                  >
                    Profile
                  </Button>
                </li>
                <li className="my-6 md:my-0 md:mx-0">
                  <Button
                    variant="text"
                    sx={{
                      color: "#F50C0C",
                      ":hover": {
                        fontWeight: "bold",
                        background: "transparent",
                        padding: 0,
                        margin: 0,
                      },
                    }}
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                  >
                    Logout
                  </Button>
                </li>
              </>
            )}
          </ul>
        )}
      </nav>
    </header>
  );
}
