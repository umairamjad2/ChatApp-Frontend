import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  //check if user is authenticated and if so, set the user data and connect to socket
  const checkAuth = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      console.log("Check Auth Error:", error.message);
      setAuthUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);
  //function to update token and user data on login or logout

  const login = useCallback(async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        axios.defaults.headers.common["token"] = data.token;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, []);

  //function to handle logout, clear all auth data and disconnect socket
  const logout = useCallback(async () => {
    // Remove from localStorage
    localStorage.removeItem("token");
    // Clear all auth data
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);

    // Remove from axios headers
    axios.defaults.headers.common["token"] = null;
    toast.success("Logged out successfully");

    // Disconnect socket
    if (socket) socket.disconnect();
  }, [socket]);

  //update profile function to update user profile updates
  const updateProfile = useCallback(async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, []);

  //connect socket function to handle socket connections and online users updates
  const connectSocket = useCallback((userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });
    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });
  }, [socket]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
      checkAuth();
    } else {
      setIsCheckingAuth(false);
    }
  }, []);

  const value = useMemo(() => ({
    axios,
    authUser,
    onlineUsers,
    socket,
    isCheckingAuth,
    login,
    logout,
    updateProfile,
  }), [authUser, onlineUsers, socket, isCheckingAuth, login, logout, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
