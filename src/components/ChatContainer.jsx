import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import EmojiPicker from "emoji-picker-react";
import {
  ArrowLeft, MoreVertical, CheckCheck, Check,
  Smile, Image, Send, X, MessageSquare, Trash2
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton loader — hoisted outside to prevent re-creation on every render
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// TickIndicator — stateless helper for message status ticks
// ─────────────────────────────────────────────────────────────────────────────
const TickIndicator = ({ status, seen, size = "sm" }) => {
  const cls = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";
  // Resolve effective status: new 'status' field > legacy 'seen' bool
  const effective = status || (seen ? "seen" : "sent");

  if (effective === "seen") return <CheckCheck className={`${cls} text-sky-400`} />;
  if (effective === "delivered") return <CheckCheck className={`${cls} text-white/50`} />;
  return <Check className={`${cls} text-white/40`} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// MessageItem — hoisted outside ChatContainer so React does NOT unmount/remount
// the full list on every parent re-render. It receives all needed data as props.
// ─────────────────────────────────────────────────────────────────────────────
const MessageItem = React.memo(({
  msg, index, messages, authUserId, selectedUser, onContextMenu
}) => {
  const isOwnMessage = msg.senderId === authUserId;
  const isConsecutivePrev = index > 0 && messages[index - 1]?.senderId === msg.senderId;
  const isConsecutiveNext = index < messages.length - 1 && messages[index + 1]?.senderId === msg.senderId;

  // Long-press for mobile context menu
  const pressTimer = useRef(null);
  const handleTouchStart = (e) => {
    if (msg.isDeleted) return;
    pressTimer.current = setTimeout(() => onContextMenu(e, msg, isOwnMessage), 500);
  };
  const handleTouchEnd = () => clearTimeout(pressTimer.current);

  const handleRightClick = (e) => {
    if (msg.isDeleted) return;
    e.preventDefault();
    onContextMenu(e, msg, isOwnMessage);
  };

  if (msg.isDeleted) {
    return (
      <div className={`flex w-full ${isOwnMessage ? "justify-end" : "justify-start"} ${isConsecutivePrev ? "mt-1.5" : "mt-6"}`}>
        <div className={`flex items-end gap-2.5 max-w-[85%] sm:max-w-[75%] ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
          {!isOwnMessage && !isConsecutiveNext && (
            <div className="w-8 h-8 rounded-full overflow-hidden flex-none border border-white/5">
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
      className={`flex w-full ${isOwnMessage ? "justify-end" : "justify-start"} ${isConsecutivePrev ? "mt-1.5" : "mt-6"}`}
      onContextMenu={handleRightClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={`flex items-end gap-2.5 max-w-[85%] sm:max-w-[75%] ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
        {!isOwnMessage && !isConsecutiveNext && (
          <div className="w-8 h-8 rounded-full overflow-hidden flex-none border border-white/5 shadow-lg shadow-black/20">
            <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
          </div>
        )}
        {!isOwnMessage && isConsecutiveNext && <div className="w-8" />}

        <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
          {msg.image ? (
            <div className="relative group/img mb-1.5">
              <img
                src={msg.image}
                alt=""
                className={`w-auto h-auto max-w-[70vw] max-h-[200px] sm:max-w-[50vw] sm:max-h-[250px] md:max-w-[40vw] md:max-h-[300px] rounded-[18px] border border-white/10 shadow-2xl object-cover transition-transform duration-300 group-hover/img:scale-[1.02] ${isOwnMessage
                  ? (isConsecutiveNext ? "rounded-br-[4px]" : "rounded-br-[2px]")
                  : (isConsecutiveNext ? "rounded-bl-[4px]" : "rounded-bl-[2px]")
                  }`}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity">
                <p className="text-[10px] font-bold text-white/90">{formatMessageTime(msg.createdAt)}</p>
                {isOwnMessage && <TickIndicator status={msg.status} seen={msg.seen} size="md" />}
              </div>
            </div>
          ) : (
            <div className={`relative px-4 py-3 pr-14 text-[15px] font-normal rounded-[22px] shadow-lg text-left ${isOwnMessage
              ? `bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white ${isConsecutiveNext ? "rounded-br-[6px]" : "rounded-br-[2px]"}`
              : `bg-[#251e36] text-white/95 border border-white/5 ${isConsecutiveNext ? "rounded-bl-[6px]" : "rounded-bl-[2px]"}`
              }`}>
              <p className="break-words leading-relaxed whitespace-pre-wrap text-left">{msg.text}</p>
              <div className={`absolute bottom-2 right-3 flex items-center gap-1 ${isOwnMessage ? "text-white/60" : "text-white/40"}`}>
                <p className="text-[10px] font-bold tracking-tight">{formatMessageTime(msg.createdAt)}</p>
                {isOwnMessage && <TickIndicator status={msg.status} seen={msg.seen} size="sm" />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// ChatContainer — main component
// ─────────────────────────────────────────────────────────────────────────────
const ChatContainer = () => {
  const {
    messages, selectedUser, setSelectedUser, sendMessage, getMessages,
    deleteMessage, clearChat, isClearing, loadMoreMessages, loadingMore,
    hasMore, loadingMessages, showRightSidebar, setShowRightSidebar
  } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  // ── refs ──
  const containerRef = useRef(null); // the scrollable message list
  const scrollAnchorRef = useRef(null); // invisible div at bottom of list
  const inputRef = useRef(null);
  const isInitialLoad = useRef(true); // true while loading the first batch
  const isPrepending = useRef(false); // true while loading older messages
  const prevScrollHeight = useRef(0);

  // ── local state ──
  const [input, setInput] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [deleteMenu, setDeleteMenu] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  // ─── Reset flags on chat switch ───────────────────────────────────────────
  useEffect(() => {
    isInitialLoad.current = true;
  }, [selectedUser]);

  // ─── Load messages when chat switches ─────────────────────────────────────
  useEffect(() => {
    if (selectedUser?._id) getMessages(selectedUser._id);
  }, [selectedUser, getMessages]);

  // ─── Scroll to bottom on initial load (instant, no animation) ────────────
  useLayoutEffect(() => {
    if (!isInitialLoad.current || loadingMessages || !messages?.length) return;
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    isInitialLoad.current = false;
  }, [messages, loadingMessages]);

  // ─── Auto-scroll for new messages (only when near bottom) ────────────────
  useEffect(() => {
    if (isInitialLoad.current || isPrepending.current || loadingMessages) return;
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    // Only auto-scroll if the user is within 150px of the bottom
    if (distanceFromBottom < 150) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loadingMessages]);

  // ─── Preserve scroll position when prepending older messages ─────────────
  useLayoutEffect(() => {
    if (!isPrepending.current || !containerRef.current) return;
    const el = containerRef.current;
    el.scrollTop = el.scrollHeight - prevScrollHeight.current;
    isPrepending.current = false;
  }, [messages]);

  // ─── Infinite scroll handler ───────────────────────────────────────────────
  const handleScroll = useCallback(async () => {
    const el = containerRef.current;
    if (!el || loadingMore || !hasMore) return;
    if (el.scrollTop <= 50) {
      prevScrollHeight.current = el.scrollHeight;
      isPrepending.current = true;
      await loadMoreMessages(selectedUser._id, messages.length);
    }
  }, [loadingMore, hasMore, loadMoreMessages, selectedUser, messages.length]);

  // ─── Close menus on outside click ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      setDeleteMenu(null);
      setShowChatMenu(false);
      // Close emoji picker only if click is outside the picker AND the emoji button
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  // ─── Send message ─────────────────────────────────────────────────────────
  const handleSendMessage = async (e) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text && !imagePreview) return;
    setInput("");
    const currentPreview = imagePreview;
    setImagePreview(null);
    try {
      await sendMessage({ text: text || undefined, image: currentPreview || undefined });
      inputRef.current?.focus();
    } catch {
      setInput(text);
      setImagePreview(currentPreview);
      toast.error("Failed to send message");
    }
  };

  // ─── Image selection ──────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // ─── Context menu for message deletion ────────────────────────────────────
  const handleMessageContextMenu = useCallback((e, msg, isSender) => {
    const x = e.clientX || e.touches?.[0]?.clientX || 0;
    const y = e.clientY || e.touches?.[0]?.clientY || 0;
    setDeleteMenu({ messageId: msg._id, x, y, isSender });
  }, []);

  // ─── Empty state ──────────────────────────────────────────────────────────
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

  // ─── Main layout ──────────────────────────────────────────────────────────
  // The outer wrapper uses `min-h-0` so flex children can scroll correctly
  // without causing the container to grow beyond its bounds.
  return (
    <div className="h-full flex flex-col overflow-hidden relative backdrop-blur-lg">

      {/* ── HEADER ── fixed, never moves */}
      <div className="flex-none h-[56px] sm:h-[70px] px-3 sm:px-6 border-b border-white/10 bg-[#1a1429]/80 backdrop-blur-2xl flex items-center gap-2 z-20 pl-[max(12px,env(safe-area-inset-left))] pr-[max(12px,env(safe-area-inset-right))]">
        <button
          onClick={() => setSelectedUser(null)}
          className="md:hidden p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group"
        >
          <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-white" />
        </button>

        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/5 hover:border-violet-500/30 transition-colors">
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
          <p className="text-[16px] sm:text-[18px] text-white font-semibold truncate leading-tight">
            {selectedUser.fullName}
          </p>
          <p className="text-[12px] font-medium truncate mt-0.5">
            {onlineUsers?.includes(selectedUser._id)
              ? <span className="text-emerald-400/80">Active now</span>
              : <span className="text-white/40">Offline</span>}
          </p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowChatMenu(!showChatMenu); }}
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
                  onClick={() => { setShowRightSidebar(!showRightSidebar); setShowChatMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm text-white/70 hover:text-white transition-all"
                >
                  <Image className="w-4 h-4" /> Media
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to clear all messages in this chat?")) clearChat(selectedUser._id);
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

      {/* ── MESSAGE LIST ── flex-1 + min-h-0 = fills space and scrolls correctly */}
      {loadingMessages || isClearing ? (
        <MessageSkeleton />
      ) : (
        <div
          key={selectedUser._id}
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 px-[max(16px,env(safe-area-inset-left))] pr-[max(16px,env(safe-area-inset-right))] custom-scrollbar"
        >
          {/* Loading older messages indicator */}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[12px] text-white/40">
                <div className="w-3.5 h-3.5 border-2 border-violet-500/50 border-t-transparent rounded-full animate-spin" />
                <span>Fetching history...</span>
              </div>
            </div>
          )}

          {/* Message list */}
          <div className="flex flex-col">
            {Array.isArray(messages) && messages.map((msg, index) => (
              <MessageItem
                key={msg._id}
                msg={msg}
                index={index}
                messages={messages}
                authUserId={authUser?._id}
                selectedUser={selectedUser}
                onContextMenu={handleMessageContextMenu}
              />
            ))}
          </div>

          {/* Invisible scroll anchor */}
          <div ref={scrollAnchorRef} className="h-1" />
        </div>
      )}

      {/* ── INPUT BOX ── fixed at bottom, never resizes the message area */}
      <div className="flex-none relative p-2 sm:p-4 pb-[max(8px,calc(8px+env(safe-area-inset-bottom)))] px-[max(8px,env(safe-area-inset-left))] pr-[max(8px,env(safe-area-inset-right))] border-t border-white/5 bg-[#1a1429]/95 backdrop-blur-xl">
        {/* Image preview */}
        {imagePreview && (
          <div className="mb-2 ml-2 inline-block p-2 rounded-2xl bg-[#251e36] border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="relative group">
              <img src={imagePreview} alt="Preview" className="w-28 h-28 object-cover rounded-xl" />
              <button
                onClick={() => setImagePreview(null)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="max-w-[1200px] mx-auto flex items-end gap-1.5">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-[20px] flex items-end px-1.5 py-0.5 gap-0.5 focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/10 focus-within:bg-white/10 transition-all duration-300 shadow-2xl">
            {/* Emoji picker button */}
            <div className="relative" ref={emojiPickerRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // prevent the window click handler from immediately closing it
                  setShowEmojiPicker((prev) => !prev);
                }}
                className={`p-2.5 rounded-2xl transition-all ${showEmojiPicker ? "bg-violet-500/20 text-violet-400" : "text-white/30 hover:bg-white/10 hover:text-white"}`}
              >
                <Smile className="w-5 h-5" />
              </button>

              {/* Emoji picker popover */}
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 z-50 shadow-2xl rounded-2xl overflow-hidden">
                  <EmojiPicker
                    theme="dark"
                    emojiStyle="native"
                    skinTonesDisabled
                    searchDisabled={false}
                    height={380}
                    width={320}
                    onEmojiClick={(emojiData) => {
                      // Insert emoji at cursor position, or append if no cursor
                      const textarea = inputRef.current;
                      if (textarea) {
                        const start = textarea.selectionStart ?? input.length;
                        const end = textarea.selectionEnd ?? input.length;
                        const newVal = input.slice(0, start) + emojiData.emoji + input.slice(end);
                        setInput(newVal);
                        // Restore cursor position after emoji
                        requestAnimationFrame(() => {
                          textarea.focus();
                          const pos = start + emojiData.emoji.length;
                          textarea.setSelectionRange(pos, pos);
                        });
                      } else {
                        setInput((prev) => prev + emojiData.emoji);
                      }
                    }}
                  />
                </div>
              )}
            </div>
            <textarea
              ref={inputRef}
              id="message-input"
              name="message-input"
              rows="1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
              }}
              placeholder="Type a message..."
              className="flex-1 bg-transparent py-2.5 text-white outline-none placeholder:text-white/20 text-[14px] resize-none max-h-[120px] custom-scrollbar"
            />
            <div className="flex items-center pb-1.5 gap-1">
              <label className="p-2.5 hover:bg-white/10 rounded-2xl transition-all text-white/30 hover:text-white cursor-pointer group">
                <Image className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <input type="file" id="image-input" name="image-input" accept="image/*" className="hidden" onChange={handleImageChange} />
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
      </div>

      {/* ── DELETE CONTEXT MENU ── */}
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
            onClick={() => { deleteMessage(deleteMenu.messageId, false); setDeleteMenu(null); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-[14px] text-white/70 hover:text-white transition-all font-medium"
          >
            Delete for me
          </button>
          {deleteMenu.isSender && (
            <button
              onClick={() => { deleteMessage(deleteMenu.messageId, true); setDeleteMenu(null); }}
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
