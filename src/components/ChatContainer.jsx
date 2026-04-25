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

    if (input.trim() === "") return;

    try {
      await sendMessage({ text: input.trim() });
      setInput("");
    } catch (err) {
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
        scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
        if (messages?.length > 0) {
          shouldScrollToBottom.current = false;
        }
      }, 100);
    }
  }, [messages]);

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg flex flex-col">
      {/* HEADER */}
      <div className="h-[72px] px-4 border-b border-white/10 bg-white/5 backdrop-blur-xl flex items-center gap-3">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt={selectedUser.fullName}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
        />

        <div className="flex-1 min-w-0">
          <p className="text-base sm:text-lg text-white font-medium truncate">
            {selectedUser.fullName}
          </p>
          <p className="text-[11px] text-violet-100/80 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${onlineUsers?.includes(selectedUser._id)
                ? "bg-emerald-400"
                : "bg-slate-400"
                }`}
            ></span>
            {onlineUsers?.includes(selectedUser._id) ? "Online" : "Offline"}
          </p>
        </div>

        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="Back"
          className="md:hidden w-8 h-8 p-2 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer transition"
        />

        <button
          type="button"
          className="max-md:hidden w-8 h-8 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          aria-label="Chat info"
        >
          <img src={assets.help_icon} alt="Info" className="w-3.5" />
        </button>
      </div>

      {/* CHAT MESSAGES */}
      <div
        ref={messageContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-3 pb-6"
      >
        {Array.isArray(messages) &&
          messages.map((msg, index) => {
            if (!msg) return null; // 🔥 prevents crash

            const isOwnMessage = msg.senderId === authUser?._id;

            return (
              <div
                key={index}
                className={`mb-4 flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex items-end gap-2 max-w-[78%] ${isOwnMessage ? "flex-row-reverse" : "flex-row"
                    }`}
                >
                  {!isOwnMessage && (
                    <img
                      src={selectedUser?.profilePic || assets.avatar_icon}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  )}
                  <div className={isOwnMessage ? "text-right" : "text-left"}>
                    {msg.image ? (
                      <img
                        src={msg.image}
                        alt=""
                        className="max-w-[230px] rounded-xl border border-white/10"
                      />
                    ) : (
                      <p
                        className={`px-3 py-2 max-w-[240px] md:text-sm font-light rounded-xl wrap-break-word text-white ${isOwnMessage
                          ? "bg-violet-500/35 rounded-br-sm"
                          : "bg-white/10 rounded-bl-sm"
                          }`}
                      >
                        {msg.text}
                      </p>
                    )}
                    <div className={`flex items-center gap-1 mt-1 px-1 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                      <p className="text-[11px] text-gray-400">
                        {formatMessageTime(msg.createdAt)}
                      </p>
                      {isOwnMessage && (
                        <span className={msg.seen ? "text-blue-400" : "text-gray-400"}>
                          {msg.seen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 7 17l-5-5" /><path d="m22 10-7.5 7.5L13 16" /></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        <div ref={scrollEnd}></div>
      </div>

      {/* INPUT BOX */}
      <div className="p-3 border-t border-white/10 bg-black/10 backdrop-blur-md flex items-center gap-3">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
        />

        <input
          onChange={handleSendImage}
          type="file"
          id="image"
          accept="image/png, image/jpeg"
          hidden
        />

        <label htmlFor="image">
          <img
            src={assets.gallery_icon}
            className="w-5 mr-2 cursor-pointer"
            alt=""
          />
        </label>

        <img
          src={assets.send_button}
          alt=""
          onClick={handleSendMessage}
          className="w-7 cursor-pointer"
        />
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
