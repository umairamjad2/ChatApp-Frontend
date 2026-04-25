import React, { useContext } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../../context/ChatContext";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);
  return (
    <div className="w-full h-screen relative px-2 py-2 sm:px-[8%] sm:py-[3%] bg-black overflow-hidden">
      {/* Blurred Background Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{ 
          backgroundImage: "url('/bgImage.svg')",
          filter: "blur(80px)",
          opacity: "0.6"
        }}
      ></div>

      <div
        className={`relative backdrop-blur-3xl border border-white/10 rounded-3xl overflow-hidden h-full grid grid-cols-1 bg-[#1a1429]/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ${selectedUser ? "md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1.6fr_280px] xl:grid-cols-[320px_1.8fr_320px]" : "md:grid-cols-[320px_1fr]"}`}
      >
        <Sidebar />
        <ChatContainer />
        <RightSidebar />
      </div>
    </div>
  );
};

export default HomePage;
