// import React, { useContext, useEffect, useRef, useState } from "react";
// import assets, { messagesDummyData } from "../assets/assets";
// import { formatMessageTime } from "../lib/utils";
// import { ChatContext } from "../../context/ChatContext";
// import toast from "react-hot-toast";
// import { AuthContext } from "../../context/AuthContext";

// const ChatContainer = () => {
//   const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
//     useContext(ChatContext);

//   const { authUser, onlineUsers } = useContext(AuthContext);

//   const scrollEnd = useRef();
//   const [input, setInput] = useState("");

//   //handle send message
//   const handleSendMessage = async (e) => {
//     e.preventDefault();

//     if (input.trim() === "") return null;
//     await sendMessage({ text: input.trim() });
//     setInput("");
//   };

//   //handle send an image message
//   const handleSendImage = async (e) => {
//     const file = e.target.files[0];
//     if (!file || !file.type.startsWith("image/")) {
//       toast.error("Please select an image file (png or jpeg)");
//       return;
//     }
//     const reader = new FileReader();
//     reader.onloadend = async () => {
//       await sendMessage({ image: reader.result });
//       e.target.value = ""; // Clear the file input after sending the image
//     };
//     reader.readAsDataURL(file);
//   };

//   useEffect(() => {
//     if (selectedUser) {
//       //fetch messages for selected user
//       getMessages(selectedUser._id);
//     }
//   }, [selectedUser]);

//   useEffect(() => {
//     if (scrollEnd.current && messages) {
//       scrollEnd.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);
//   return selectedUser ? (
//     <div className="h-full overflow-scroll relative backdrop-blur-lg">
//       {/* header  */}
//       <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
//         <img
//           src={selectedUser.profilePic || assets.avatar_icon}
//           alt=""
//           className="w-8 rounded-full"
//         />
//         <p className="flex-1 text-lg text-white flex items-center gap-2">
//           {selectedUser.fullName}
//           {onlineUsers.includes(selectedUser._id) && (
//             <span className="w-2 h-2 rounded-full bg-green-500"></span>
//           )}
//         </p>
//         <img
//           onClick={() => setSelectedUser(null)}
//           src={assets.arrow_icon}
//           alt=""
//           className="md:hidden max-w-7"
//         />
//         <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
//       </div>
//       {/* Chat Area */}
//       <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`flex items-end gap-2 justify-end ${msg.senderId !== authUser._id && "flex-row-reverse"}`}
//           >
//             {msg.image ? (
//               <img
//                 src={msg.image}
//                 alt=""
//                 className="max-w-[230px] border-border-gray-700 rounded-lg overflow-hidden mb-8"
//               />
//             ) : (
//               <p
//                 className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${msg.senderId === authUser._id ? "rounded-br-none" : "rounded-bl-none"}`}
//               >
//                 {msg.text}
//               </p>
//             )}
//             <div className="text-center text-xs">
//               <img
//                 src={
//                   msg.senderId === authUser._id
//                     ? authUser?.profilePic || assets.avatar_icon
//                     : selectedUser?.profilePic || assets.avatar_icon
//                 }
//                 alt=""
//                 className="w-7 rounded-full"
//               />
//               <p className="text-gray-500">
//                 {formatMessageTime(msg.createdAt)}
//               </p>
//             </div>
//           </div>
//         ))}
//         <div ref={scrollEnd}></div>
//       </div>
//       {/* Message Input */}
//       <div className="p-3 border-t border-stone-500 flex items-center gap-3">
//         <input
//           type="text"
//           placeholder="Type a message..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
//           className="flex-1 bg-transparent border border-stone-500 rounded-full px-4 py-2 text-white outline-none"
//         />
//         <input
//           onChange={handleSendImage}
//           type="file"
//           id="image"
//           accept="image/png, image/jpeg"
//           hidden
//         />

//         <label htmlFor="image">
//           <img
//             src={assets.gallery_icon}
//             className="w-5 mr-2 cursor-pointer"
//             alt=""
//           />
//         </label>
//         <img
//           src={assets.send_button}
//           alt=""
//           onClick={handleSendMessage}
//           className="w-7 cursor-pointer"
//         />
//       </div>
//     </div>
//   ) : (
//     <div className="flex flex-col justify-center items-center gap-2 text-gray-500 bg-white/10 max-md:hidden ">
//       <img src={assets.logo_icon} className="max-w-16" alt="" />
//       <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
//     </div>
//   );
// };

// export default ChatContainer;

import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef();
  const messageContainerRef = useRef(null);
  const shouldScrollToBottom = useRef(true);
  const [input, setInput] = useState("");

  useEffect(() => {
    shouldScrollToBottom.current = true;
  }, [selectedUser]);

  // send text message
  const handleSendMessage = async (e) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text) return;

    setInput(""); // Optimistically clear input for smooth UX

    try {
      await sendMessage({ text });
    } catch (err) {
      setInput(text); // Revert on failure
      toast.error("Failed to send message");
    }
  };

  // send image message
  const handleSendImage = async (e) => {
    const file = e.target.files[0];

    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await sendMessage({ image: reader.result });
      } catch (err) {
        toast.error("Failed to send image");
      }
      e.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  // load messages
  useEffect(() => {
    if (selectedUser?._id && getMessages) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  // auto scroll
  useEffect(() => {
    const messageContainer = messageContainerRef.current;
    if (!messageContainer) return;

    const distanceFromBottom =
      messageContainer.scrollHeight -
      messageContainer.scrollTop -
      messageContainer.clientHeight;

    if (shouldScrollToBottom.current || distanceFromBottom < 120) {
      setTimeout(() => {
        if (messageContainer) {
          messageContainer.scrollTop = messageContainer.scrollHeight;
        }
        if (messages?.length > 0) {
          shouldScrollToBottom.current = false;
        }
      }, 100);
    }
  }, [messages]);

  const [showChatMenu, setShowChatMenu] = useState(false);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg flex flex-col">
      {/* HEADER */}
      <div className="h-[64px] sm:h-[72px] px-3 sm:px-5 border-b border-white/10 bg-[#1a1429]/80 backdrop-blur-2xl flex items-center gap-3 z-20">
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="Back"
          className="md:hidden w-8 h-8 p-1.5 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer transition"
        />

        <div className="relative">
          <img
            src={selectedUser.profilePic || assets.avatar_icon}
            alt={selectedUser.fullName}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-white/10 shadow-sm"
          />
          {onlineUsers?.includes(selectedUser._id) && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#1a1429] rounded-full"></span>
          )}
        </div>

        <div className="flex-1 min-w-0 ml-1">
          <p className="text-[16px] sm:text-[18px] text-white font-medium truncate leading-tight">
            {selectedUser.fullName}
          </p>
          <p className="text-[12px] text-white/50 font-light truncate mt-0.5">
            {onlineUsers?.includes(selectedUser._id) ? "Online now" : "Offline"}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowChatMenu(!showChatMenu)}
            type="button"
            className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Chat options"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>

          {showChatMenu && (
            <div className="absolute top-full right-0 mt-2 z-30 w-40 p-2 rounded-2xl bg-[#251e36]/95 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-gray-100">
              <p
                onClick={() => {
                  navigate("/profile");
                  setShowChatMenu(false);
                }}
                className="cursor-pointer text-[14px] px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                View Profile
              </p>
              <div className="h-[1px] bg-white/5 my-1 mx-2" />
              <p
                onClick={() => {
                  logout();
                  setShowChatMenu(false);
                }}
                className="cursor-pointer text-[14px] px-4 py-2.5 rounded-xl hover:bg-white/10 text-red-400 transition-colors"
              >
                Logout
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CHAT MESSAGES */}
      <div
        ref={messageContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 scroll-smooth"
      >
        {Array.isArray(messages) &&
          messages.map((msg, index) => {
            if (!msg) return null; // 🔥 prevents crash

            const isOwnMessage = msg.senderId === authUser?._id;
            const prevMsg = messages[index - 1];
            const nextMsg = messages[index + 1];
            
            // Check if messages are grouped together
            const isConsecutivePrev = prevMsg?.senderId === msg.senderId;
            const isConsecutiveNext = nextMsg?.senderId === msg.senderId;

            return (
              <div
                key={index}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} ${isConsecutivePrev ? "mt-1.5" : "mt-6"}`}
              >
                <div
                  className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%] ${
                    isOwnMessage ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {!isOwnMessage && (
                    <div className="w-8 flex-shrink-0 flex justify-center">
                      {!isConsecutiveNext && (
                        <img
                          src={selectedUser?.profilePic || assets.avatar_icon}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover shadow-sm mb-5"
                        />
                      )}
                    </div>
                  )}

                  <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"} min-w-[80px]`}>
                    {msg.image ? (
                      <div className="relative group">
                        <img
                          src={msg.image}
                          alt=""
                          className={`max-w-[240px] sm:max-w-[320px] rounded-[20px] border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.15)] object-cover ${
                            isOwnMessage ? (isConsecutiveNext ? "rounded-br-[4px]" : "rounded-br-sm") : (isConsecutiveNext ? "rounded-bl-[4px]" : "rounded-bl-sm")
                          }`}
                        />
                      </div>
                    ) : (
                      <div
                        className={`relative px-4 py-2.5 text-[15.5px] font-normal rounded-[22px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] ${
                          isOwnMessage
                            ? `bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white ${isConsecutiveNext ? "rounded-br-[6px]" : "rounded-br-[2px]"}`
                            : `bg-[#251e36] text-white/95 border border-white/5 ${isConsecutiveNext ? "rounded-bl-[6px]" : "rounded-bl-[2px]"}`
                        }`}
                      >
                        <p className="break-words leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    )}

                    {!isConsecutiveNext && (
                      <div className={`flex items-center gap-1 mt-1.5 px-1 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                        <p className="text-[10.5px] font-medium text-white/40 uppercase tracking-wider">
                          {formatMessageTime(msg.createdAt)}
                        </p>
                        {isOwnMessage && (
                          <span className={msg.seen ? "text-sky-400" : "text-white/30"}>
                            {msg.seen ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 7 17l-5-5" /><path d="m22 10-7.5 7.5L13 16" /></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

        <div ref={scrollEnd}></div>
      </div>

      {/* INPUT BOX */}
      <div className="sticky bottom-0 z-10 w-full p-3 sm:px-4 pb-[calc(12px+env(safe-area-inset-bottom))] border-t border-white/10 bg-[#1a1429]/95 backdrop-blur-xl flex items-end gap-2">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-[24px] flex items-end px-2 py-1 gap-2 focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/50 focus-within:bg-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
          <input
            type="text"
            name="message"
            autoComplete="off"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
            className="flex-1 bg-transparent px-3 py-2.5 text-white outline-none placeholder-gray-400 text-[15px] min-h-[44px] w-full"
          />

          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
          />

          <label htmlFor="image" className="p-2.5 rounded-full hover:bg-white/10 cursor-pointer transition-colors mb-0.5">
            <img
              src={assets.gallery_icon}
              className="w-5 h-5 object-contain opacity-80 hover:opacity-100 transition-opacity"
              alt="Gallery"
            />
          </label>
        </div>

        <button
          onClick={handleSendMessage}
          disabled={!input.trim()}
          className={`w-[48px] h-[48px] rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
            input.trim()
              ? "bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-[0_4px_16px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_20px_rgba(139,92,246,0.5)] active:scale-95 cursor-pointer text-white"
              : "bg-white/10 text-white/50 cursor-not-allowed"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col justify-center items-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} className="max-w-16" alt="" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
