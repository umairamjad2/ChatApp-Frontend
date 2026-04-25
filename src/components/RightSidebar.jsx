import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    if (!Array.isArray(messages)) {
      setMsgImages([]);
      return;
    }

    setMsgImages(
      messages
        .filter((msg) => msg && msg.image)
        .map((msg) => msg.image)
        .filter(Boolean),
    );
  }, [messages]);

  return selectedUser ? (
    <div className="bg-black/20 backdrop-blur-lg h-full p-4 flex flex-col gap-4 border-l border-white/5 relative max-lg:hidden">
      {/* Profile */}
      <div className="flex flex-col items-center gap-2 mt-2">
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt=""
          className="w-22 h-22 rounded-full object-cover ring-2 ring-white/10 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
        />
        <h2 className="text-white text-2xl font-semibold text-center">
          {selectedUser?.fullName}
        </h2>
        <p className="text-xs text-violet-200/90">
          {onlineUsers?.includes(selectedUser?._id) ? "Online" : "Offline"}
        </p>
        <p className="text-gray-400 text-sm text-center px-2">{selectedUser?.bio}</p>
      </div>
      <hr className="border-white/5 my-1" />

      {/* Media / Documents */}
      <div className="px-3 text-xs flex-1 overflow-hidden">
        <h3 className="text-gray-300 text-sm font-semibold ">Media</h3>

        <div className="mt-3 max-h-[260px] overflow-y-auto grid grid-cols-2 gap-3 opacity-90 pr-1">
          {msgImages.map((url, index) => (
            <div
              key={index}
              className="cursor-pointer rounded-xl overflow-hidden border border-white/10 aspect-square hover:ring-2 hover:ring-violet-500/50 hover:shadow-lg transition-all duration-200"
              onClick={() => window.open(url, "_blank")}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <button
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white font-medium py-2.5 px-16 rounded-full cursor-pointer shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all active:translate-y-0"
        onClick={() => logout()}
      >
        Logout
      </button>
    </div>
  ) : null;
};

export default RightSidebar;
