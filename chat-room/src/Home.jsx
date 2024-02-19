import { useCallback, useEffect, useRef, useState } from "react";
import jwt from "./Auth/jwt";
import Navbar from "./Navbar";

import Echo from "laravel-echo";
window.Pusher = require("pusher-js");

window.Echo = new Echo({
  broadcaster: "pusher",
  key: "my_pusher_key",
  cluster: "mt1",
  wsHost: window.location.hostname,
  wsPort: 6001,
  forceTLS: false,
  encrypted: false,
  authorizer: (channel, options) => {
    return {
      authorize: (socketId, callback) => {
        jwt
          .post("/broadcasting/auth", {
            socket_id: socketId,
            channel_name: channel.name,
          })
          .then((response) => {
            callback(false, response.data);
          })
          .catch((error) => {
            callback(true, error);
          });
      },
    };
  },
});

const Home = () => {
  const fetchUser = () => {
    const info = window.localStorage.getItem("userData");
    // ** Parse stored json or if none return null
    return info ? JSON.parse(info) : localStorage.clear();
  };

  const user = fetchUser();
  const [data, setData] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [toUser, setToUser] = useState("");
  const [loading, setLoading] = useState(false);

  const chatbody = useRef(null);
  const channelRef = useRef(null);

  const addChat = (event) => {
    console.log("Event:", event); // Log the entire event object
    console.log("toUser.id:", toUser.id); // Log the value of toUser.id
    console.log("event.from_id:", event.message.from_id);
    if (event.from_id === toUser?.id) {
      setMessages((oldArray) => [...oldArray, event.message]);
    }
  };

  const [newMessage, setNewMessage] = useState({});

  useEffect(() => {
    setMessages((oldArray) => {
      if (toUser?.id === newMessage?.from_id) {
        return [...oldArray, newMessage];
      } else {
        return oldArray;
      }
    });
  }, [newMessage]);

  useEffect(() => {
    jwt.get("/users").then((res) => {
      if (res.status === 200) {
        setData(res.data);
      }
    });

    if (user) {
      const channel = window.Echo.private("private.chat." + user.id);
      channelRef.current = channel; // Store channel reference

      channel
        .subscribed(() => {
          console.log("it Worked");
        })
        .listen(".chat", (event) => {
          setNewMessage(event.message);
          setData((prev) => {
            return prev.map((item) => {
              if (item.id === event.message.from_id) {
                return { ...item, lastMessage: event.message };
              } else {
                return item;
              }
            });
          });
        });
    }

    // Cleanup function to unsubscribe from channel when component unmounts
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (chatbody.current) {
      chatbody.current.scrollTop = chatbody.current.scrollHeight;
    }
  }, [chatbody.current, messages]);

  const getChat = (usr) => {
    setToUser(usr);
    jwt.get(`/messages/${usr.id}`).then((res) => {
      if (res.status === 200) {
        setMessages(res.data);
      }
    });
  };

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);

    jwt.post("/messages", { message: text, user: toUser?.id }).then((res) => {
      if (res.status === 201)
        setMessages((oldArray) => [
          ...oldArray,
          { received: false, message: text },
        ]);
      setLoading(false);
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) {
      return "----";
    }
    const options = { month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  return (
    <>
      <Navbar />
      <div className="user-list">
        <div className="title">Chats</div>
        <div className="list">
          <ul>
            {data.length > 0 ? (
              data.map((usr, index) => (
                <li key={usr.id}>
                  <button
                    className={`user-card${
                      toUser?.id === usr?.id ? " active" : ""
                    }`}
                    onClick={() => getChat(usr)}
                  >
                    <div>
                      <div className="name">
                        <p>{usr.name}</p>
                        <p>{usr?.lastMessage?.message || "-------"}</p>
                      </div>
                    </div>
                    <div className="date-user">
                      <span className="date">
                        {formatDate(usr?.lastMessage?.created_at)}
                      </span>
                    </div>
                  </button>
                </li>
              ))
            ) : (
              <li>Users</li>
            )}
          </ul>
        </div>
      </div>
      <div className="wrapper">
        <div className="chat-room">
          <div ref={chatbody} className="body">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div className="chat" key={index}>
                  <div className="chat-body">
                    <div
                      className={`chat-left${
                        msg.to_id === user?.id ? "" : " right"
                      }`}
                    >
                      <span>{msg.message}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-chat">
                <p>No Chat</p>
              </div>
            )}
          </div>
          <form onSubmit={submit}>
            <div className="action">
              <input
                placeholder="Message..."
                type="text"
                className="action-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button className="btn" type="submit">
                <span className={`${loading ? "btn-hide" : ""}`}>Send</span>
                <div className={`btn-loader ${loading ? "" : "hide"}`}>
                  <div className="loader"></div>
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Home;
