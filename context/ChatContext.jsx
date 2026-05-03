import { createContext, useContext, useEffect, useState } from "react";
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // function to get users for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get(`/api/messages/users`);
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to get selected user messages
  const getMessages = async (userId) => {
    setLoadingMessages(true);
    setHasMore(true);
    try {
      const { data } = await axios.get(`/api/messages/${userId}?limit=20`);
      if (data.success) {
        setMessages(data.messages);
        if (data.messages.length < 20) setHasMore(false);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  // function to load older messages
  const loadMoreMessages = async (userId, offset) => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const { data } = await axios.get(`/api/messages/${userId}?limit=20&offset=${offset}`);
      if (data.success) {
        if (data.messages.length < 20) setHasMore(false);
        if (data.messages.length > 0) {
          setMessages((prev) => [...data.messages, ...prev]);
          return data.messages.length; // Return number of new messages for height calculation
        }
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setLoadingMore(false);
    }
    return 0;
  };
  //function to send message
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData,
      );

      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to delete message
  const deleteMessage = async (messageId, deleteForEveryone) => {
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
  };

  // function to clear chat
  const clearChat = async (userId) => {
    setIsClearing(true);
    try {
      const { data } = await axios.delete(`/api/messages/clear/${userId}`);
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
  };
  // function to subscribe to selected user messages
  const subscribeToMessages = async () => {
    if (!socket) return;
    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
            ? prevUnseenMessages[newMessage.senderId] + 1
            : 1,
        }));
      }
    });

    socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, isDeleted: true, text: "", image: "" } : msg
        )
      );
    });
  };

  //function to unsubscribe from selected user messages
  const unsubscribeFromMessages = async () => {
    if (!socket) return;
    socket.off("newMessage");
    socket.off("messageDeleted");
  };

  //  Listen for incoming messages
  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    setMessages,
    sendMessage,
    deleteMessage,
    clearChat,
    isClearing,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    getMessages,
    loadMoreMessages,
    loadingMore,
    hasMore,
    showRightSidebar,
    setShowRightSidebar,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
