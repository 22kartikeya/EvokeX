import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXing } from "@fortawesome/free-brands-svg-icons";
import { Button } from "../ui/Button";
import { Github } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { BACKEND_URL } from "@/config";

export const AppBar: React.FC = () => {
  const [user, setUser] = useState<{
    username: string;
    name?: string;
    avatar?: string;
    email?: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/auth/user`, {
          withCredentials: true,
        });
        setUser(res.data);
      } catch (err) {
        console.log(`Not logged in : ${err}`);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/github`;
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${BACKEND_URL}/auth/logout`, {
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
              <Menu as="div" className="relative ml-3">
              <div>
                <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Open user menu</span>
                  <img
                    alt="user avatar"
                    src={user.avatar || "https://github.com/identicons/github.png"}
                    className="size-8 rounded-full"
                  />
                </MenuButton>
              </div>
              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
              >
                <MenuItem>
                  <span className="block px-4 py-2 text-lg font-semibold text-gray-700 data-[focus]:bg-gray-100 data-[focus]:outline-none">
                    {user.name || user.username}
                  </span>
                </MenuItem>
                <MenuItem>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:outline-none"
                  >
                    Settings
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:outline-none"
                  >
                    Sign out
                  </a>
                </MenuItem>
              </MenuItems>
            </Menu>
            </>
          )}
        </div>
      </div>
    </header>
  );
};