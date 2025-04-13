import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXing } from "@fortawesome/free-brands-svg-icons";
import { Button } from "../ui/Button";
import { Github } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

export const AppBar: React.FC = () => {
  const [user, setUser] = useState<{
    username: string;
    name?: string;
    avatar?: string;
    email?: string;
  } | null>(null);
  const navigate = useNavigate();
  
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/auth/user", {
          withCredentials: true,
        });
        setUser(res.data as { username: string; name?: string; avatar?: string; email?: string; });
      } catch (err) {
        console.log(`Not logged in : ${err}`);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const handleLogin = () => {
    window.location.href = "http://localhost:3000/auth/github";
  };

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3000/auth/logout", {
        withCredentials: true,
      });
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 flex items-center justify-between p-2 backdrop-blur-md bg-background/50 border-b border-white/10 z-50">
      <div className="flex items-center ml-4 space-x-4">
        <FontAwesomeIcon icon={faXing} className="w-8 h-7" />
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent animate-type-slide-in">
          EvokeX
        </Link>
      </div>

      <div className="flex items-center gap-4 mr-4">
        <div className="flex items-center md:order-2 space-x-3 md:space-x-0">

          {!user ? (
            <>
              <Button variant="ghost" size="sm" className="text-sm" onClick={handleLogin}>
                <Github className="w-4 h-4 mr-2" />
                Sign in with GitHub
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 transition-opacity mr-3"
                onClick={handleLogin}
              >
                Get Started
              </Button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                onClick={toggleDropdown}
              >
                <span className="sr-only">Open user menu</span>
                <img
                  className="w-6 h-6 rounded-full"
                  src={user.avatar || "https://github.com/identicons/github.png"}
                  alt="user avatar"
                />
              </button>

              <div
                className={`z-50 ${
                  dropdownOpen ? "" : "hidden"
                } text-base list-none bg-blue-950 divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600`}
              >
                <div className="px-4 py-3">
                  <span className="block text-sm text-gray-900 dark:text-white">
                    {user.name || user.username}
                  </span>
                  <span className="block text-sm text-gray-500 truncate dark:text-gray-400">
                    {user.email || "Not Available"}
                  </span>
                </div>
                <ul className="py-2">
                  <li>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                    >
                      Settings
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                    >
                      Sign out
                    </button>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};