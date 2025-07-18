// client/src/Chat.jsx
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io.connect('https://backend-t4u2.onrender.com');

const Chat = () => {
  const [message, setMessage] = useState('');
  const [room, setRoom] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const roomFromURL = new URLSearchParams(window.location.search).get("room");
    if (roomFromURL) {
      setRoom(roomFromURL);
      socket.emit('join_room', roomFromURL);
      setJoined(true);
    }

    socket.on('receive_message', (data) => {
      setChatMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  const joinRoom = () => {
    if (room !== '') {
      socket.emit('join_room', room);
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (message !== '') {
      const msgData = {
        room,
        author: 'You',
        message,
        time: new Date().toLocaleTimeString(),
      };
      socket.emit('send_message', msgData);
      setChatMessages([...chatMessages, msgData]);
      setMessage('');
    }
  };

  const getInviteLink = () => {
    return `${window.location.origin}?room=${room}`;
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(getInviteLink());
    alert("Invite link copied!");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>💬 Real-Time Chat App</h2>

      {!joined ? (
        <div style={styles.joinSection}>
          <input
            placeholder="Enter Room ID"
            style={styles.input}
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button style={styles.button} onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <div style={styles.chatBox}>
          <div style={styles.linkBox}>
            <span>Invite friends:</span>
            <input value={getInviteLink()} readOnly style={styles.linkInput} />
            <button onClick={copyInviteLink} style={styles.copyButton}>Copy</button>
          </div>

          <div style={styles.messages}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={msg.author === 'You' ? styles.myMessage : styles.otherMessage}>
                <b>{msg.author}</b>: {msg.message}
                <span style={styles.timestamp}>{msg.time}</span>
              </div>
            ))}
          </div>

          <div style={styles.sendSection}>
            <input
              placeholder="Type message..."
              style={styles.input}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button style={styles.button} onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 600,
    margin: '30px auto',
    padding: 20,
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  joinSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  chatBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
  },
  input: {
    padding: 10,
    borderRadius: 6,
    border: '1px solid #ccc',
    fontSize: 16,
    width: '100%',
  },
  button: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    fontSize: 16,
    cursor: 'pointer',
  },
  sendSection: {
    display: 'flex',
    gap: 10,
  },
  messages: {
    maxHeight: 300,
    overflowY: 'auto',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    border: '1px solid #ddd',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  otherMessage: {
    backgroundColor: '#f1f0f0',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  timestamp: {
    display: 'block',
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  linkBox: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  linkInput: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    border: '1px solid #ccc',
  },
  copyButton: {
    padding: 8,
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
};

export default Chat;
