import React, { createContext, useContext, useState } from "react";
import { UserService } from "../services/user.service.ts";
import type LoginInformation from "../models/loginInformation.tsx";

interface UserContextType {
  user: LoginInformation | null;
  setUser: (user: LoginInformation | null) => void;
  login: (user: LoginInformation, token: string) => void;
  logout: () => void;
  token: string | null;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const storedUser = UserService.getUser();
  const storedToken = localStorage.getItem("token");

  const [user, setUser] = useState<LoginInformation | null>(storedUser);
  const [token, setToken] = useState<string | null>(storedToken);

  const login = (userData: LoginInformation, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setToken(token);
  };

  const logout = () => {
    UserService.logout();
    setUser(null);
    setToken(null);
  };

  const contextValue: UserContextType = {
    user,
    token,
    setUser,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
