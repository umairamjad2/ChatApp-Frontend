import React, { useContext } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../../context/ChatContext";

const HomePage = () => {
  const { selectedUser, showRightSidebar } = useContext(ChatContext);
  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex flex-col h-[100dvh] w-full">
      {/* Blurred Background Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bgImage.svg')",
          filter: "blur(80px)",
          opacity: "0.5"
        }}
      ></div>

      {/* Main Content Wrapper */}
      <div
        className={`fixed inset-0 flex flex-col overflow-hidden bg-[#1a1429]/60 md:grid md:grid-cols-[280px_1fr] ${selectedUser && showRightSidebar ? "lg:grid-cols-[280px_1.6fr_280px] xl:grid-cols-[320px_1.8fr_320px]" : "lg:grid-cols-[280px_1fr]"} pt-[env(safe-area-inset-top)]`}
      >
        <Sidebar />
        <ChatContainer />
        {selectedUser && showRightSidebar && <RightSidebar />}
      </div>
    </div>
  );
};

export default HomePage;
