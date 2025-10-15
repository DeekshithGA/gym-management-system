import { db, auth } from './firebase-config.js';
import { collection, addDoc, doc, setDoc, onSnapshot, query, where, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { logEvent } from './logging.js';

const messagesCollection = collection(db, 'messages');
const typingCollection = collection(db, 'typingStatus');
const presenceCollection = collection(db, 'presence');

// Send a message to a room or user
export async function sendMessage(roomId, senderId, content, type = 'text', replyTo = null) {
  try {
    await addDoc(messagesCollection, {
      roomId,
      senderId,
      content,
      type,           // 'text', 'image', 'file'
      timestamp: new Date(),
      status: 'sent',
      replyTo,
      reactions: {}
    });
    logEvent('Message sent', { roomId, senderId });
  } catch (err) {
    console.error('Send message error:', err);
  }
}

// Listen to messages in a room in real-time
export function subscribeToMessages(roomId, callback) {
  const messagesQuery = query(messagesCollection, where('roomId', '==', roomId));
  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = [];
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added' || change.type === 'modified') {
        messages.push({ id: change.doc.id, ...change.doc.data() });
      } else if (change.type === 'removed') {
        // handle delete UI if needed
      }
    });
    callback(messages);
  });
}

// Update message status (delivered/read)
export async function updateMessageStatus(messageId, status) {
  try {
    const messageDoc = doc(db, 'messages', messageId);
    await updateDoc(messageDoc, { status });
  } catch (err) {
    console.error('Update message status error:', err);
  }
}

// Add or remove typing indicator (called when user types/stops)
export async function setTypingStatus(roomId, userId, isTyping) {
  try {
    const typingDoc = doc(db, 'typingStatus', `${roomId}_${userId}`);
    if (isTyping) {
      await setDoc(typingDoc, { roomId, userId, timestamp: new Date() });
    } else {
      await deleteDoc(typingDoc);
    }
  } catch (err) {
    console.error('Typing status set error:', err);
  }
}

// Listen to typing users in a room
export function subscribeTypingStatus(roomId, callback) {
  const typingQuery = query(typingCollection, where('roomId', '==', roomId));
  return onSnapshot(typingQuery, (snapshot) => {
    const typingUsers = snapshot.docs.map(doc => doc.data().userId).filter(uid => uid !== auth.currentUser.uid);
    callback(typingUsers);
  });
}

// React to a message
export async function reactToMessage(messageId, userId, emoji) {
  try {
    const messageDoc = doc(db, 'messages', messageId);
    const messageSnap = await getDoc(messageDoc);
    if (!messageSnap.exists()) return;

    const data = messageSnap.data();
    const reactions = data.reactions || {};
    if (!reactions[emoji]) reactions[emoji] = [];
    const idx = reactions[emoji].indexOf(userId);
    if (idx === -1) {
      reactions[emoji].push(userId);
    } else {
      reactions[emoji].splice(idx, 1);
    }
    await updateDoc(messageDoc, { reactions });
  } catch (err) {
    console.error('React to message error:', err);
  }
}

// Edit a message content
export async function editMessage(messageId, newContent) {
  try {
    const messageDoc = doc(db, 'messages', messageId);
    await updateDoc(messageDoc, { content: newContent, edited: true, editedAt: new Date() });
  } catch (err) {
    console.error('Edit message error:', err);
  }
}

// Delete a message (soft delete)
export async function deleteMessage(messageId) {
  try {
    const messageDoc = doc(db, 'messages', messageId);
    await updateDoc(messageDoc, { deleted: true, deletedAt: new Date() });
  } catch (err) {
    console.error('Delete message error:', err);
  }
}

// Update user presence (called on login/heartbeat)
export async function setUserPresence(userId, online = true) {
  try {
    const presenceDoc = doc(db, 'presence', userId);
    await setDoc(presenceDoc, { online, lastActive: new Date() });
  } catch (err) {
    console.error('Set presence error:', err);
  }
}

// Listen for presence updates (online/offline status)
export function subscribeToPresence(callback) {
  return onSnapshot(presenceCollection, snapshot => {
    const statuses = {};
    snapshot.docs.forEach(doc => { statuses[doc.id] = doc.data(); });
    callback(statuses);
  });
}
