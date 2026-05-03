import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { MessageSquare, MoreVertical, Search, LogOut, User } from "lucide-react";

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
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const filteredUsers = input
    ? users.filter((user) =>
      user.fullName.toLowerCase().includes(input.toLowerCase()),
    )
    : users;

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  return (
    <div
      className={`bg-black/20 border-r border-white/5 h-full flex flex-col overflow-hidden text-white pl-[env(safe-area-inset-left)] ${selectedUser ? " max-md:hidden" : ""}`}
    >
      {/* Header - Fixed */}
      <div className="p-4 sm:p-6 border-b border-white/10 flex-none">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <MessageSquare className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              QuickChat
            </span>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute top-full right-0 z-50 w-48 mt-2 p-2 rounded-2xl bg-[#1a1429]/95 backdrop-blur-2xl border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => { navigate("/profile"); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm text-white/70 hover:text-white transition-all"
                >
                  <User className="w-4 h-4" /> Edit Profile
                </button>
                <div className="h-px bg-white/5 my-1" />
                <button
                  onClick={() => { logout(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-sm text-red-400 hover:text-red-300 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-violet-400 transition-colors" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 sm:py-3.5 pl-11 pr-4 text-[14px] sm:text-[15px] placeholder:text-white/20 outline-none focus:border-violet-500/30 focus:bg-white/10 transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
      </div>

      {/* User List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-3 py-2 sm:py-4 custom-scrollbar">
        <div className="space-y-0.5 sm:space-y-1">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelectedUser(user);
                  setUnseenMessages((prev) => ({
                    ...prev,
                    [user._id]: 0,
                  }));
                }}
                className={`relative flex items-center gap-3 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 group ${selectedUser?._id === user._id
                    ? "bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/20 shadow-lg"
                    : "hover:bg-white/5 border border-transparent"
                  }`}
              >
                <div className="relative flex-none">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-violet-500/30 transition-colors">
                    <img
                      src={user?.profilePic || assets.avatar_icon}
                      alt=""
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {onlineUsers.includes(user._id) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#1a1429] rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full border-2 border-[#1a1429] animate-pulse" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className="font-semibold text-[14px] sm:text-[15px] truncate text-white/90 group-hover:text-white transition-colors">
                      {user.fullName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`text-[11px] sm:text-xs truncate ${onlineUsers.includes(user._id) ? "text-emerald-400/70" : "text-white/30"}`}>
                      {onlineUsers.includes(user._id) ? "Active now" : "Offline"}
                    </p>
                  </div>
                </div>

                {unseenMessages[user._id] > 0 && (
                  <div className="flex-none flex items-center justify-center">
                    <div className="min-w-[20px] h-5 rounded-full bg-violet-600 flex items-center justify-center px-1.5 shadow-lg shadow-violet-600/30 animate-in zoom-in duration-300">
                      <span className="text-[10px] font-bold text-white">
                        {unseenMessages[user._id]}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-white/10" />
              </div>
              <p className="text-white/40 font-medium">No results found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
