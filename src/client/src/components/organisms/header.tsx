import { useState, useEffect, useCallback } from "react";
import { IonIcon } from "@ionic/react";
import { menu } from "ionicons/icons";
import { handleMenu } from "./menu";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
// import { useModal } from "../../contexts/modal.context";
import { useUser } from "../../contexts/user.context";
import { useNavigate } from "react-router-dom";

const navLinks = [
  { name: "HOME", to: "/" },
  { name: "ABOUT", to: "/" },
  { name: "CONTACT", to: "/" },
];

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
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
  //I'm prob going to remove modals completely, idk about the design yet
  // const { invokeLoginModal } = useModal();
  const { user, logout } = useUser();
  let navigate = useNavigate();

  const [menuState, setMenuState] = useState<"menu" | "close">("close");

  const isMobile = useMediaQuery("(max-width: 768px)");
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

  const navLinksClasses = "text-base hover:text-[#6DBE45] duration-200";

  return (
    <header className="bg-white text-black h-24 z-15">
      <nav className="md:max-w-7xl mx-auto bg-whitemd:px-4 xl:px-0 py-5 text-base  md:flex md:items-center md:justify-between">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-3xl font-bold cursor-pointer">
            Family-Sync
          </Link>

          <span className="text-3xl cursor-pointer mx-2 md:hidden flex items-center justify-center">
            <IonIcon icon={menu} onClick={toggleMenu} />
          </span>
        </div>

        {showMenu && (
          <ul className="md:flex md:items-center bg-white z-10 md:z-auto md:static absolute  w-full left-0 md:w-auto md:py-0 py-4 md:pl-0 pl-4 top-[70px] transition-all ease-in duration-200">
            {navLinks.map((link) => (
              <li key={link.name} className="text-black mx-4 my-6 md:my-0">
                {/* Remove inherited styling later */}
                <Button
                  href="/"
                  className={navLinksClasses}
                  variant="text"
                  color="inherit"
                  onClick={toggleMenu}
                >
                  {link.name}
                </Button>
              </li>
            ))}
            {!user && (
              <>
                <li>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/login")}
                    size="small"
                    color="inherit"
                  >
                    Login
                  </Button>
                </li>
              </>
            )}
            {user && (
              <>
                <li className="mx-4 my-6 md:my-0">
                  <Button
                    variant="contained"
                    size="small"
                    color="inherit"
                    className="mx-4"
                    onClick={() => navigate("/profile")}
                  >
                    Profile
                  </Button>
                </li>
                <li className="mx-4 my-6 md:my-0">
                  <Button variant="contained" onClick={() => logout()}>
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
