import { useState, useEffect, useCallback, useRef } from "react";
import { IonIcon } from "@ionic/react";
import { menu, searchOutline } from "ionicons/icons";
import { handleMenu } from "./menu";
import { Link, useLocation } from "react-router-dom";
import Button from "@mui/material/Button";
import { useUser } from "../../contexts/user.context";
import { useModal } from "../../contexts/modal.context";
import { useNavigate } from "react-router-dom";
import { UserService } from "../../services/user.service";
import { FamiliesService } from "../../services/families.service";

const navLinks = [
  { name: "HOME", to: "/" },
  { name: "ABOUT", to: "/" },
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
  const { user, logout, token } = useUser();
  const { invokeInviteUserModal } = useModal();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuState, setMenuState] = useState<"menu" | "close">("close");
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLLIElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { _id: string; name: string; email: string }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [families, setFamilies] = useState<{ name: string; _id: string }[]>([]);

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
    const fetchFamilies = async () => {
      if (user && token) {
        try {
          const fetchedFamilies = await FamiliesService.getFamilies(token);
          setFamilies(fetchedFamilies);
        } catch (error) {
          console.error("Error fetching families:", error);
        }
      }
    };
    fetchFamilies();
  }, [user, token]);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await UserService.searchUsers(
          searchQuery,
          token ?? undefined
        );
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUserClick = (selectedUser: {
    _id: string;
    name: string;
    email: string;
  }) => {
    if (families.length === 0) {
      alert("You need to be part of a family to invite users.");
      return;
    }
    invokeInviteUserModal({
      user: selectedUser,
      families: families,
    });
    setShowSearchResults(false);
    setSearchQuery("");
  };

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
        className="max-w-6xl mx-auto  px-4 lg:px-0 bg-whitemd:px-4 xl:px-0 py-5 text-base  lg:flex md:items-center lg:justify-between"
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
                <li className="mx-4 my-6 md:my-0 relative" ref={searchRef}>
                  <div className="relative group">
                    <div className="flex items-center border border-gray-300 rounded-full px-2 py-1 bg-white transition-all duration-300 ease-in-out hover:rounded-md focus-within:rounded-md">
                      <IonIcon
                        icon={searchOutline}
                        className="text-gray-500 cursor-pointer text-lg shrink-0"
                      />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() =>
                          searchQuery.length > 0 && setShowSearchResults(true)
                        }
                        className="outline-none text-sm w-0 group-hover:w-full lg:group-hover:w-40 focus:w-32 lg:focus:w-40 transition-all duration-300 ease-in-out group-hover:ml-2 focus:ml-2 peer"
                      />
                    </div>
                    {showSearchResults && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto min-w-[200px]">
                        {isSearching ? (
                          <div className="p-3 text-center text-gray-500 text-sm">
                            Searching...
                          </div>
                        ) : searchResults.length > 0 ? (
                          searchResults.map((result) => (
                            <div
                              key={result._id}
                              onClick={() => handleUserClick(result)}
                              className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <p className="font-medium text-sm">
                                {result.name}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center text-gray-500 text-sm">
                            No users found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              </>
            )}
          </ul>
        )}
      </nav>
    </header>
  );
}
