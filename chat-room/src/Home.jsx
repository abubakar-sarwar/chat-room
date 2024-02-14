import { useEffect, useRef, useState } from "react"
import jwt from "./Auth/jwt"

import Echo from 'laravel-echo';
window.Pusher = require('pusher-js');
 
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'my_pusher_key',
    cluster: 'mt1',
    wsHost: window.location.hostname,
    wsPort: 6001,
    forceTLS: false,
    encrypted: false,
    authorizer: (channel, options) => {
      return {
          authorize: (socketId, callback) => {
              jwt.post('/broadcasting/auth', {
                  socket_id: socketId,
                  channel_name: channel.name
              })
              .then(response => {
                  callback(false, response.data);
              })
              .catch(error => {
                  callback(true, error);
              });
          }
      };
  },
});

const Home = () => {
  
  const fetchUser = () => {
    const info = window.localStorage.getItem('userData');
    // ** Parse stored json or if none return null
    return info ? JSON.parse(info) : localStorage.clear();
  }
  
  const user = fetchUser();
  const [data, setData] = useState([]);
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("");
  const [toUser, setToUser] = useState(-1);

  const chatbody = useRef(null);
 
  useEffect(() => {
    jwt.get('/users').then(res => {
      if(res.status === 200)
        setData(res.data)

      console.log(res.data)
    })


    if(user) {
      const channel = window.Echo.private('private.chat.' + user.id);
    
      channel.subscribed(() => {
        console.log('it Worked')
      }).listen('.chat', (event) => {
        if(event.from_id === toUser)
          setMessages(oldArray => [...oldArray, { received: true, message: event.message }])
        else
          console.log('Message from ' + event.from_id)
      })
    }

  }, [])
  
  const getChat = (usr) => {
    setToUser(usr)
    jwt.get(`/messages/${usr}`).then(res => {
      if(res.status === 200) {
        setMessages(res.data)
      }
    })
  }

  const submit = (e) => {
    e.preventDefault();

    jwt.post('/messages', { message: text, user: toUser })
    .then(res => {
      if(res.status === 200)
        setMessages(oldArray => [...oldArray, { received: false, message: text }])
    })
  }

  return (
    <>
      <div className="user-list">
        <div className="title">
          Chats
        </div>
        <div className="list">
          <ul>
            {data.length > 0 ? data.map((usr, index) => (
              <li key={usr.id}>
                <button className="user-card" onClick={() => getChat(usr.id)}>
                  <div>
                    <div className="name">
                      <p>{usr.name}</p>
                      <p>{"akjsdhkjas"}</p>
                    </div>
                  </div>
                  <div>
                    <span className="date">Jan 30</span>
                    <span className="new-msg">2</span>
                  </div>
                </button>
              </li>
            )) : (
              <li>Users</li>
            )}
          </ul>
        </div>
      </div>
      <div className="wrapper">
        <div className="chat-room">
          <div className="title">
            {user?.name}
          </div>
          <div ref={chatbody} className="body">
            {messages.length > 0 ? messages.map((msg, index) => (
              <div className="chat" key={index} >
                <div className="chat-body">
                  <div className={`chat-left${msg.received ? '' : ' right'}`}>
                    {/* <span className="sm">{msg.user.name}</span> */}
                    <span>{msg.message}</span>
                  </div>
                </div>
              </div>
            )) :
            <div className="chat">
              <div className="chat-left right">
                No Chat
              </div>
            </div> }
          </div>
          <form onSubmit={submit}>
            <div className="action">
              <input placeholder="To user..." type="text" className="action-input user-input" value={toUser} onChange={(e) => setToUser(e.target.value)} />
              <input placeholder="Message..." type="text" className="action-input" value={text} onChange={(e) => setText(e.target.value)} />
              <button className="btn" type="submit" >Send</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default Home