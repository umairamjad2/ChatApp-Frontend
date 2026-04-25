import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);

  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const filteredUsers = input
    ? users.filter((user) =>
      user.fullName.toLowerCase().includes(input.toLowerCase()),
    )
    : users;

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`bg-black/20 border-r border-white/5 h-full overflow-y-auto text-white ${selectedUser ? " max-md:hidden" : ""}`}
    >
      <div className="p-5 border-b border-white/10">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />
          <div className="relative py-2">
            <img
              onClick={() => setShowMenu(!showMenu)}
              src={assets.menu_icon}
              alt="Menu"
              className="max-h-5 cursor-pointer"
            />
            {showMenu && (
              <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-xl bg-[#1a1429]/90 backdrop-blur-xl border border-white/10 shadow-2xl text-gray-100">
                <p
                  onClick={() => {
                    navigate("/profile");
                    setShowMenu(false);
                  }}
                  className="cursor-pointer text-sm hover:text-violet-400 transition-colors"
                >
                  Edit Profile
                </p>
                <hr className="my-2 border-t border-white/10" />
                <p
                  onClick={() => {
                    logout();
                    setShowMenu(false);
                  }}
                  className="cursor-pointer text-sm hover:text-red-400 transition-colors"
                >
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white/5 rounded-full flex items-center gap-2 py-3 px-4 mt-5 border border-white/10 focus-within:ring-1 focus-within:ring-violet-500/50 transition-all">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            onChange={(e) => setInput(e.target.value)}
            type="text"
            className="bg-transparent border-none  outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search User..."
          />
        </div>
      </div>
      <div className="flex flex-col p-2 gap-1">
        {filteredUsers.map((user, index) => (
          <div
            key={index}
            onClick={() => {
              setSelectedUser(user);
              setUnseenMessages((prev) => ({
                ...prev,
                [user._id]: 0,
              }));
            }}
            className={`relative flex items-center gap-3 p-2.5 pl-3 rounded-xl cursor-pointer max-sm:text-sm transition-all duration-200 ${selectedUser?._id === user._id
              ? "bg-white/10 border border-white/10 shadow-lg"
              : "hover:bg-white/5 border border-transparent"
              }`}
          >
            <img
              src={user?.profilePic || assets.avatar_icon}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col leading-5 min-w-0">
              <p className="text-sm truncate">{user.fullName}</p>
              {onlineUsers.includes(user._id) ? (
                <span className="text-green-400 text-xs">Online</span>
              ) : (
                <span className="text-neutral-400 text-xs">Offline</span>
              )}
              <p className="text-xs text-gray-300 truncate max-w-[160px]">
                {user.status}
              </p>
            </div>
            {unseenMessages[user._id] > 0 && (
              <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                {unseenMessages[user._id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
