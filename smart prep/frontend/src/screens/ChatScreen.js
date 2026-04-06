import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import authApi from '../api/auth';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [convId, setConvId] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { _id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // NOTE: You will need to setup axios base config or full URL based on your env
      const res = await authApi.post('/chat/message', { 
         message: userMsg.content, 
         conversationId: convId 
      });
      setConvId(res.data.conversationId);
      setMessages(prev => [...prev, { _id: Date.now().toString()+1, role: 'model', content: res.data.response }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { _id: Date.now().toString()+2, role: 'model', content: "Failed to connect to the AI tutor." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <FlatList 
        data={messages}
        keyExtractor={item => item._id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={[styles.messageBubble, item.role === 'user' ? styles.userBubble : styles.modelBubble]}>
            <Text style={item.role === 'user' ? styles.userText : styles.modelText}>{item.content}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          value={input} 
          onChangeText={setInput} 
          placeholder="Ask your AI Tutor anything..." 
          editable={!loading}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading}>
          <Text style={styles.sendButtonText}>{loading ? "..." : "Send"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  messageBubble: { padding: 12, marginVertical: 6, borderRadius: 12, maxWidth: '80%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
  modelBubble: { alignSelf: 'flex-start', backgroundColor: '#e5e5ea' },
  userText: { color: '#fff' },
  modelText: { color: '#333' },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#ccc' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 20, backgroundColor: '#fff' },
  sendButton: { paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#007AFF', borderRadius: 20, marginLeft: 10 },
  sendButtonText: { color: '#fff', fontWeight: 'bold' }
});
