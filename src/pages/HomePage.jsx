import React, { useContext } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../../context/ChatContext";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext);
  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
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
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-3xl border border-white/10 overflow-hidden w-full h-full md:w-[94vw] md:h-[86vh] md:rounded-3xl max-w-[1600px] max-h-[820px] grid grid-cols-1 bg-[#1a1429]/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ${selectedUser ? "md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1.6fr_280px] xl:grid-cols-[320px_1.8fr_320px]" : "md:grid-cols-[320px_1fr]"}`}
      >
        <Sidebar />
        <ChatContainer />
        <RightSidebar />
      </div>
    </div>
  );
};

export default HomePage;
