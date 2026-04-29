import React, { useContext } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../../context/ChatContext";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);
  return (
    <div className="fixed top-0 left-0 w-full h-[100dvh] bg-black overflow-hidden flex flex-col">
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
        className={`relative z-10 w-full h-full md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[94vw] md:h-[86vh] md:rounded-3xl max-w-[1600px] max-h-[820px] flex flex-col md:grid md:backdrop-blur-3xl md:border md:border-white/10 overflow-hidden bg-[#1a1429]/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ${selectedUser ? "md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1.6fr_280px] xl:grid-cols-[320px_1.8fr_320px]" : "md:grid-cols-[320px_1fr]"}`}
      >
        <Sidebar />
        <ChatContainer />
        <RightSidebar />
      </div>
    </div>
  );
};

export default HomePage;
