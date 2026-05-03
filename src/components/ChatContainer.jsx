import React, { useContext, useEffect, useRef, useState, useLayoutEffect } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import {
  ArrowLeft, MoreVertical, CheckCheck, Check,
  Smile, Image, Send, X, MessageSquare, Trash2
} from "lucide-react";

const ChatContainer = () => {
  const {
    messages, selectedUser, setSelectedUser, sendMessage, getMessages,
    deleteMessage, clearChat, isClearing, loadMoreMessages, loadingMore, hasMore, loadingMessages,
    showRightSidebar, setShowRightSidebar
  } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const messageContainerRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const shouldScrollToBottom = useRef(true);

  const [input, setInput] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [deleteMenu, setDeleteMenu] = useState(null); // { messageId, x, y, isSender }

  const scrollToBottom = (behavior = "smooth") => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    shouldScrollToBottom.current = true;
  }, [selectedUser]);

  // Load messages
  useEffect(() => {
    if (selectedUser?._id && getMessages) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = () => {
      setDeleteMenu(null);
      setShowChatMenu(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Handle send message
  const handleSendMessage = async (e) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text && !imagePreview) return;

    setInput("");
    const currentPreview = imagePreview;
    setImagePreview(null);

    try {
      await sendMessage({
        text: text || undefined,
        image: currentPreview || undefined
      });
      inputRef.current?.focus();
      setTimeout(() => scrollToBottom("smooth"), 50);
    } catch (err) {
      setInput(text);
      setImagePreview(currentPreview);
      toast.error("Failed to send message");
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Instant jump to bottom on initialization of a NEW chat
  useLayoutEffect(() => {
    if (shouldScrollToBottom.current && messages?.length > 0 && !loadingMessages) {
      const container = messageContainerRef.current;
      if (container) {
        // Use requestAnimationFrame for smoother performance
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight;
          shouldScrollToBottom.current = false;
        });
      }
    }
  }, [messages, selectedUser, loadingMessages]);

  const prevScrollHeightRef = useRef(0);
  const isPrependingRef = useRef(false);

  // Handle scroll to top for pagination
  const handleScroll = async () => {
    if (!messageContainerRef.current || loadingMore || !hasMore) return;

    const { scrollTop, scrollHeight } = messageContainerRef.current;
    if (scrollTop <= 50) { // Trigger a bit earlier for smoothness
      prevScrollHeightRef.current = scrollHeight;
      isPrependingRef.current = true;
      await loadMoreMessages(selectedUser._id, messages.length);
    }
  };

  useLayoutEffect(() => {
    if (isPrependingRef.current && messageContainerRef.current) {
      const newHeight = messageContainerRef.current.scrollHeight;
      const heightDifference = newHeight - prevScrollHeightRef.current;
      if (heightDifference > 0) {
        messageContainerRef.current.scrollTop = heightDifference;
      }
      isPrependingRef.current = false;
    }
  }, [messages]);

  useEffect(() => {
    // Only auto-scroll to bottom for NEW messages, not when loading OLD ones
    if (!shouldScrollToBottom.current && messages?.length > 0 && !loadingMore && !isPrependingRef.current) {
      const container = messageContainerRef.current;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
        if (isNearBottom) {
          scrollToBottom("smooth");
        }
      }
    }
  }, [messages, loadingMore]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#1a1429]/40 max-md:hidden">
        <div className="w-24 h-24 rounded-[40px] bg-gradient-to-tr from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center mb-8 animate-pulse">
          <MessageSquare className="w-10 h-10 text-violet-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Welcome to QuickChat</h2>
        <p className="text-white/40 max-w-sm leading-relaxed">
          Select a contact from the sidebar to start a conversation and share moments.
        </p>
      </div>
    );
  }

  // function to render skeleton loaders
  const MessageSkeleton = () => (
    <div className="flex-1 overflow-hidden p-6 space-y-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
          <div className="flex items-end gap-3 max-w-[70%]">
            {i % 2 !== 0 && <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />}
            <div className={`h-12 w-48 sm:w-64 rounded-2xl bg-white/5 animate-pulse ${i % 2 === 0 ? "rounded-br-none" : "rounded-bl-none"}`} />
          </div>
        </div>
      ))}
    </div>
  );

  // Memoized Message Item for performance
  const MessageItem = React.memo(({ msg, index, messages }) => {
    const isOwnMessage = msg.senderId === authUser?._id;
    const isConsecutivePrev = index > 0 && messages[index - 1]?.senderId === msg.senderId;
    const isConsecutiveNext = index < messages.length - 1 && messages[index + 1]?.senderId === msg.senderId;

    const handleContextMenu = (e) => {
      if (msg.isDeleted) return;
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      setDeleteMenu({
        messageId: msg._id,
        x: e.clientX || e.touches?.[0]?.clientX || rect.left,
        y: e.clientY || e.touches?.[0]?.clientY || rect.top,
        isSender: isOwnMessage
      });
    };

    // Long press logic for mobile
    let pressTimer;
    const handleTouchStart = (e) => {
      pressTimer = setTimeout(() => handleContextMenu(e), 500);
    };
    const handleTouchEnd = () => {
      clearTimeout(pressTimer);
    };

    if (msg.isDeleted) {
      return (
        <div className={`flex w-full ${isOwnMessage ? "justify-end" : "justify-start"} ${isConsecutivePrev ? "mt-1.5" : "mt-6"}`}>
          <div className={`flex items-end gap-2.5 max-w-[85%] sm:max-w-[75%] ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
            {!isOwnMessage && !isConsecutiveNext && (
              <div className="w-8 h-8 rounded-full overflow-hidden flex-none shadow-lg shadow-black/20 border border-white/5">
                <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
              </div>
            )}
            {!isOwnMessage && isConsecutiveNext && <div className="w-8" />}
            <div className={`px-4 py-2 rounded-2xl text-[13px] italic text-white/30 border border-white/5 bg-white/5 ${isOwnMessage ? "rounded-br-none" : "rounded-bl-none"}`}>
              This message was deleted
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`flex w-full ${isOwnMessage ? "justify-end" : "justify-start"} ${isConsecutivePrev ? "mt-1.5" : "mt-6"} transform-gpu will-change-transform`}
        style={{ contentVisibility: "auto" }}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`flex items-end gap-2.5 max-w-[85%] sm:max-w-[75%] ${isOwnMessage ? "flex-row-reverse" : "flex-row"
            }`}
        >
          {!isOwnMessage && !isConsecutiveNext && (
            <div className="w-8 h-8 rounded-full overflow-hidden flex-none shadow-lg shadow-black/20 border border-white/5">
              <img
                src={selectedUser.profilePic || assets.avatar_icon}
                alt=""
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          {!isOwnMessage && isConsecutiveNext && <div className="w-8" />}

          <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
            {msg.image ? (
              <div className="relative group/img mb-1.5">
                <img
                  src={msg.image}
                  alt=""
                  className={`w-auto h-auto max-w-[70vw] max-h-[200px] sm:max-w-[50vw] sm:max-h-[250px] md:max-w-[40vw] md:max-h-[300px] rounded-[18px] border border-white/10 shadow-2xl object-cover transition-all duration-300 group-hover/img:scale-[1.02] ${isOwnMessage
                    ? (isConsecutiveNext ? "rounded-br-[4px]" : "rounded-br-[2px]")
                    : (isConsecutiveNext ? "rounded-bl-[4px]" : "rounded-bl-[2px]")
                    }`}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity">
                  <p className="text-[10px] font-bold text-white/90">
                    {formatMessageTime(msg.createdAt)}
                  </p>
                  {isOwnMessage && (
                    <span className={msg.seen ? "text-sky-400" : "text-white/50"}>
                      {msg.seen ? (
                        <CheckCheck className="w-3.5 h-3.5" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={`relative px-4.5 py-3 pr-14 text-[15px] font-normal rounded-[22px] shadow-lg text-left ${isOwnMessage
                  ? `bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white ${isConsecutiveNext ? "rounded-br-[6px]" : "rounded-br-[2px]"}`
                  : `bg-[#251e36] text-white/95 border border-white/5 ${isConsecutiveNext ? "rounded-bl-[6px]" : "rounded-bl-[2px]"}`
                  }`}
              >
                <p className="break-words leading-relaxed whitespace-pre-wrap text-left">{msg.text}</p>
                <div className={`absolute bottom-2 right-3 flex items-center gap-1 ${isOwnMessage ? "text-white/60" : "text-white/40"}`}>
                  <p className="text-[10px] font-bold tracking-tight">
                    {formatMessageTime(msg.createdAt)}
                  </p>
                  {isOwnMessage && (
                    <span className={msg.seen ? "text-sky-300" : "text-white/40"}>
                      {msg.seen ? (
                        <CheckCheck className="w-3 h-3" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="h-full flex flex-col overflow-hidden relative backdrop-blur-lg">
      {/* HEADER - Fixed */}
      <div className="flex-none sticky top-0 h-[56px] sm:h-[80px] px-3 sm:px-6 border-b border-white/10 bg-[#1a1429]/80 backdrop-blur-2xl flex items-center gap-2 z-20 pl-[max(12px,env(safe-area-inset-left))] pr-[max(12px,env(safe-area-inset-right))]">
        <button
          onClick={() => setSelectedUser(null)}
          className="md:hidden p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group"
        >
          <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-white" />
        </button>

        <div className="relative group">
          <div className="w-11 h-11 sm:w-13 h-13 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-violet-500/30 transition-colors">
            <img
              src={selectedUser.profilePic || assets.avatar_icon}
              alt={selectedUser.fullName}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          </div>
          {onlineUsers?.includes(selectedUser._id) && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#1a1429] rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 ml-1">
          <p className="text-[16px] sm:text-[18px] text-white font-semibold truncate leading-tight group-hover:text-violet-400 transition-colors">
            {selectedUser.fullName}
          </p>
          <p className="text-[12px] text-white/40 font-medium truncate mt-0.5">
            {onlineUsers?.includes(selectedUser._id) ? (
              <span className="text-emerald-400/80">Active now</span>
            ) : (
              "Offline"
            )}
          </p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowChatMenu(!showChatMenu);
              }}
              className={`p-2.5 rounded-xl transition-all ${showChatMenu ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"}`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showChatMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-full right-0 z-50 w-48 mt-2 p-2 rounded-2xl bg-[#1a1429]/95 backdrop-blur-2xl border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200"
              >
                <button
                  onClick={() => {
                    setShowRightSidebar(!showRightSidebar);
                    setShowChatMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm text-white/70 hover:text-white transition-all"
                >
                  <Image className="w-4 h-4" /> Media
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to clear all messages in this chat?")) {
                      clearChat(selectedUser._id);
                    }
                    setShowChatMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-sm text-red-400 hover:text-red-300 transition-all border-t border-white/5"
                >
                  <Trash2 className="w-4 h-4" /> Clear Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CHAT MESSAGES - Scrollable Flex-1 */}
      {loadingMessages || isClearing ? (
        <MessageSkeleton />
      ) : (
        <div
          key={selectedUser._id} // Keying by userId ensures a fresh container state on switch
          ref={messageContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-6 px-[max(16px,env(safe-area-inset-left))] pr-[max(16px,env(safe-area-inset-right))] custom-scrollbar transform-gpu"
        >
          <div className="flex flex-col">
            {loadingMore && (
              <div className="flex justify-center py-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[12px] text-white/40">
                  <div className="w-3.5 h-3.5 border-2 border-violet-500/50 border-t-transparent rounded-full animate-spin" />
                  <span>Fetching history...</span>
                </div>
              </div>
            )}

            {Array.isArray(messages) &&
              messages.map((msg, index) => (
                <MessageItem key={msg._id} msg={msg} index={index} messages={messages} />
              ))}
            <div ref={scrollRef} className="h-2" />
          </div>
        </div>
      )}

      {/* INPUT BOX - Fixed Bottom */}
      <div className="flex-none p-2 sm:p-6 pb-[max(8px,calc(8px+env(safe-area-inset-bottom)))] px-[max(8px,env(safe-area-inset-left))] pr-[max(8px,env(safe-area-inset-right))] border-t border-white/5 bg-[#1a1429]/95 backdrop-blur-xl">
        <form
          onSubmit={handleSendMessage}
          className="max-w-[1200px] mx-auto flex items-end gap-1.5"
        >
          <div className="flex-1 bg-white/5 border border-white/10 rounded-[20px] flex items-end px-1.5 py-0.5 gap-0.5 focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/10 focus-within:bg-white/10 transition-all duration-300 shadow-2xl">
            <button
              type="button"
              className="p-2.5 hover:bg-white/10 rounded-2xl transition-all text-white/30 hover:text-white"
            >
              <Smile className="w-5.5 h-5.5" />
            </button>
            <textarea
              ref={inputRef}
              id="message-input"
              name="message-input"
              rows="1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Type a message..."
              className="flex-1 bg-transparent py-2.5 text-white outline-none placeholder:text-white/20 text-[14px] resize-none max-h-[120px] custom-scrollbar"
            />
            <div className="flex items-center pb-1.5 gap-1">
              <label className="p-2.5 hover:bg-white/10 rounded-2xl transition-all text-white/30 hover:text-white cursor-pointer group">
                <Image className="w-5.5 h-5.5 group-hover:scale-110 transition-transform" />
                <input
                  type="file"
                  id="image-input"
                  name="image-input"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={!input.trim() && !imagePreview}
            onMouseDown={(e) => e.preventDefault()}
            className={`flex-none w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg shadow-violet-600/20 ${input.trim() || imagePreview
              ? "bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white hover:scale-105 active:scale-95"
              : "bg-white/5 text-white/20 cursor-not-allowed"
              }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {imagePreview && (
          <div className="absolute bottom-[calc(100%+16px)] left-6 p-2 rounded-2xl bg-[#251e36] border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="relative group">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-xl"
              />
              <button
                onClick={() => setImagePreview(null)}
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteMenu && (
        <div
          className="fixed z-[100] w-56 p-2 rounded-2xl bg-[#1a1429]/95 backdrop-blur-2xl border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200"
          style={{
            left: Math.min(deleteMenu.x, window.innerWidth - 240),
            top: Math.min(deleteMenu.y, window.innerHeight - 150)
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              deleteMessage(deleteMenu.messageId, false);
              setDeleteMenu(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-[14px] text-white/70 hover:text-white transition-all font-medium"
          >
            Delete for me
          </button>
          {deleteMenu.isSender && (
            <button
              onClick={() => {
                deleteMessage(deleteMenu.messageId, true);
                setDeleteMenu(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-[14px] text-red-400 hover:text-red-300 transition-all font-medium border-t border-white/5"
            >
              Delete for everyone
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
