import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { X, Image } from "lucide-react";

const RightSidebar = () => {
  const { selectedUser, messages, setShowRightSidebar } = useContext(ChatContext);
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
    <div className="fixed inset-0 md:relative md:w-[320px] lg:w-auto bg-[#1a1429]/95 md:bg-[#1a1429]/40 backdrop-blur-3xl md:backdrop-blur-2xl h-full flex flex-col gap-6 border-l border-white/5 z-[60] md:z-30 animate-in slide-in-from-right duration-300 shadow-2xl overflow-hidden">
      {/* Close Button */}
      <button 
        onClick={() => setShowRightSidebar(false)}
        className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all z-40"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {/* Profile */}
        <div className="flex flex-col items-center gap-4 mt-8">
          <div className="relative group">
            <img
              src={selectedUser?.profilePic || assets.avatar_icon}
              alt=""
              className="w-32 h-32 rounded-full object-cover ring-4 ring-white/5 shadow-2xl transition-transform duration-500 group-hover:scale-105"
            />
            {onlineUsers?.includes(selectedUser?._id) && (
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-[#1a1429] rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#1a1429]" />
              </div>
            )}
          </div>
          <div className="text-center">
            <h2 className="text-white text-2xl font-bold tracking-tight mb-1">
              {selectedUser?.fullName}
            </h2>
            <p className={`text-sm font-medium ${onlineUsers?.includes(selectedUser?._id) ? "text-emerald-400" : "text-white/40"}`}>
              {onlineUsers?.includes(selectedUser?._id) ? "Online" : "Offline"}
            </p>
          </div>
          
          <div className="w-full h-px bg-white/5 my-2" />
          
          <div className="w-full">
            <p className="text-white/60 text-sm leading-relaxed text-center italic">
              {selectedUser?.bio || "No bio available"}
            </p>
          </div>
        </div>

        <div className="h-px bg-white/5 my-6" />

        {/* Media / Documents */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-[16px]">Media</h3>
            <span className="text-[11px] font-bold text-white/20 uppercase tracking-widest">{msgImages.length} Items</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {msgImages.map((url, index) => (
              <div
                key={index}
                className="cursor-pointer rounded-lg overflow-hidden border border-white/5 aspect-square hover:ring-2 hover:ring-violet-500/50 transition-all duration-200"
                onClick={() => window.open(url, "_blank")}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          {msgImages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center opacity-20">
              <Image className="w-10 h-10 mb-2" />
              <p className="text-xs">No media shared yet</p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  ) : null;
};

export default RightSidebar;
