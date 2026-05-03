import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { socket, authUser, axios } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const lastRequestedUserId = useRef(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // function to get users for sidebar
  const getUsers = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/messages/users`);
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);

        // Restore persisted selected user after refresh
        const savedUserId = localStorage.getItem("selectedUserId");
        if (savedUserId) {
          const savedUser = data.users.find((u) => u._id === savedUserId);
          if (savedUser) {
            setSelectedUser(savedUser);
          } else {
            // User no longer exists or is inaccessible — clear it
            localStorage.removeItem("selectedUserId");
          }
        }
      } else {
        console.log(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [axios]);

  // function to get selected user messages
  const getMessages = useCallback(async (userId) => {
    if (!userId) return;

    // 1. Immediately clear messages and show loading to prevent flicker
    setMessages([]);
    setLoadingMessages(true);
    setHasMore(true);

    // 2. Track the request to prevent race conditions
    lastRequestedUserId.current = userId;

    try {
      const { data } = await axios.get(`/api/messages/${userId}?limit=20`);

      // 3. Only update state if this is still the most recent request
      if (lastRequestedUserId.current === userId) {
        if (data.success) {
          setMessages(data.messages);
          if (data.messages.length < 20) setHasMore(false);
        } else {
          console.log(data.message);
        }
      }
    } catch (error) {
      if (lastRequestedUserId.current === userId) {
        toast.error(error.message);
      }
    } finally {
      if (lastRequestedUserId.current === userId) {
        setLoadingMessages(false);
      }
    }
  }, [axios]);

  // function to load older messages
  const loadMoreMessages = useCallback(async (userId, offset) => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const { data } = await axios.get(`/api/messages/${userId}?limit=20&offset=${offset}`);
      if (data.success) {
        if (data.messages.length < 20) setHasMore(false);
        if (data.messages.length > 0) {
          setMessages((prev) => {
            const allMessages = [...data.messages, ...prev];
            // Deduplicate by _id
            const uniqueMessages = Array.from(
              new Map(allMessages.map((m) => [m._id, m])).values()
            );
            // Sort by createdAt to ensure correct order
            return uniqueMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          });
          return data.messages.length; // Return number of new messages for height calculation
        }
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setLoadingMore(false);
    }
    return 0;
  }, [axios, loadingMore, hasMore]);
  //function to send message
  const sendMessage = useCallback(async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData,
      );

      if (data.success) {
        setMessages((prev) => {
          const newMessages = [...prev, data.message];
          return Array.from(new Map(newMessages.map((m) => [m._id, m])).values());
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [axios, selectedUser]);

  // function to delete message
  const deleteMessage = useCallback(async (messageId, deleteForEveryone) => {
    try {
      const { data } = await axios.delete(`/api/messages/${messageId}`, {
        data: { delete_for_everyone: deleteForEveryone },
      });

      if (data.success) {
        if (deleteForEveryone) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === messageId ? { ...msg, isDeleted: true, text: "", image: "" } : msg
            )
          );
        } else {
          setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        }
        toast.success("Message deleted");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }, [axios]);

  // function to clear chat
  const clearChat = useCallback(async (userId) => {
    if (!userId) return toast.error("User ID is required");
    setIsClearing(true);
    try {
      const { data } = await axios.delete(`/api/messages/clear-conversation/${userId}`);
      if (data.success) {
        setMessages([]);
        toast.success("Chat cleared");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsClearing(false);
    }
  }, [axios]);
  // function to subscribe to selected user messages
  const subscribeToMessages = useCallback(() => {
    if (!socket) return;

    // Handle new incoming messages
    socket.on("newMessage", (newMessage) => {
      const isCurrentChat = selectedUser && newMessage.senderId === selectedUser._id;

      if (isCurrentChat) {
        // Chat is open — mark as seen immediately
        newMessage.seen = true;
        newMessage.status = "seen";
        setMessages((prev) => {
          const newMessages = [...prev, newMessage];
          return Array.from(new Map(newMessages.map((m) => [m._id, m])).values());
        });
        // Tell the backend this message has been seen
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        // Chat is not open — mark as delivered only
        newMessage.status = "delivered";
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
            ? prevUnseenMessages[newMessage.senderId] + 1
            : 1,
        }));
      }
    });

    // Single message seen (e.g., triggered by markMessageAsSeen API + socket emit from backend)
    socket.on("messageSeen", ({ messageId, seenAt }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, seen: true, status: "seen", seenAt }
            : msg
        )
      );
    });

    // Bulk messages seen (e.g., when receiver opens the chat and backend marks all as seen)
    socket.on("messagesSeen", ({ senderId, receiverId, seenAt }) => {
      // Only update messages WE sent that the receiver has now read
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === senderId && msg.receiverId === receiverId && !msg.seen
            ? { ...msg, seen: true, status: "seen", seenAt }
            : msg
        )
      );
    });

    // Handle message deletions
    socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, isDeleted: true, text: "", image: "" } : msg
        )
      );
    });
  }, [socket, selectedUser, axios]);

  // function to unsubscribe from selected user messages
  const unsubscribeFromMessages = useCallback(() => {
    if (!socket) return;
    socket.off("newMessage");
    socket.off("messageSeen");
    socket.off("messagesSeen");
    socket.off("messageDeleted");
  }, [socket]);

  //  Listen for incoming messages
  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages]);

  const handleSetSelectedUser = useCallback((user) => {
    setSelectedUser(user);
    if (user) {
      setMessages([]);
      setLoadingMessages(true);
      localStorage.setItem("selectedUserId", user._id);
    } else {
      localStorage.removeItem("selectedUserId");
    }
  }, []);

  const value = useMemo(() => ({
    messages,
    users,
    selectedUser,
    getUsers,
    setMessages,
    sendMessage,
    deleteMessage,
    clearChat,
    isClearing,
    setSelectedUser: handleSetSelectedUser,
    unseenMessages,
    setUnseenMessages,
    loadingMessages,
    getMessages,
    loadMoreMessages,
    loadingMore,
    hasMore,
    showRightSidebar,
    setShowRightSidebar,
  }), [
    messages, users, selectedUser, getUsers, sendMessage, deleteMessage,
    clearChat, isClearing, handleSetSelectedUser, unseenMessages,
    loadingMessages, getMessages, loadMoreMessages, loadingMore,
    hasMore, showRightSidebar, setShowRightSidebar
  ]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
