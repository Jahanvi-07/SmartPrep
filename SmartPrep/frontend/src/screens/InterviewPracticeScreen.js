import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Platform } from 'react-native';
import { analyzeInterview } from '../api/practice';
import { recordPractice } from '../api/dashboard';

const INTERVIEW_QUESTIONS = [
  "Tell me about a time you had to overcome a difficult technical challenge.",
  "Describe a situation where you had a conflict with a team member and how you resolved it.",
  "Why do you want to work for our company specifically?",
  "What is your greatest weakness, and how are you working to improve it?",
  "Tell me about a project that failed and what you learned from the experience.",
  "How do you handle tight deadlines and high-pressure situations?",
  "Explain a complex technical concept to me as if I were a beginner.",
  "Where do you see your career in the next five years?",
  "Tell me about a time you took the initiative to improve a process."
];

const InterviewPracticeScreen = () => {
  const [question, setQuestion] = useState(INTERVIEW_QUESTIONS[0]);
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Web Speech API reference
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Setup Web Speech API if running on a compatible web browser
    if (Platform.OS === 'web' && window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      
      rec.onresult = (event) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        setTranscript(fullTranscript);
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
      
      setRecognition(rec);
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognition) recognition.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      if (recognition) {
        recognition.start();
        setIsRecording(true);
      } else {
        // Fallback for native devices mapped to Expo Go
        Alert.alert('Speech to text', 'Native speech-to-text requires a custom dev client. Please manually type your response below for this demo.');
        setIsRecording(true); // just toggle UI state
      }
    }
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      return Alert.alert('Error', 'Please provide a vocal response or type the transcript first.');
    }

    setLoading(true);
    setResult(null);
    try {
      const data = await analyzeInterview(question, transcript.trim());
      setResult(data);
      try {
        await recordPractice(data.score || 80, 'Mock Interview');
      } catch (err) {
        console.error('Failed to update streak/xp', err);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to analyze response via AI.');
    } finally {
      setLoading(false);
    }
  };

  const shuffleQuestion = () => {
    const randomIndex = Math.floor(Math.random() * INTERVIEW_QUESTIONS.length);
    setQuestion(INTERVIEW_QUESTIONS[randomIndex]);
    setResult(null);
    setTranscript('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎙️ Interview Practice</Text>
      
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardHeader}>AI Interviewer asks:</Text>
          <TouchableOpacity onPress={shuffleQuestion}>
            <Text style={styles.shuffleBtn}>🔄 Next Random Question</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.questionText}>"{question}"</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.recordBtn, isRecording && styles.recordingActive]} 
          onPress={toggleRecording}
        >
          <Text style={styles.btnText}>{isRecording ? '⏹ Stop Recording' : '🔴 Start Voice Record'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Your Response (Live Transcript):</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Your speech will appear here, or you can manually type it..."
        value={transcript}
        onChangeText={setTranscript}
      />

      <TouchableOpacity style={styles.submitBtn} onPress={handleAnalyze} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Analyze & Score My Answer</Text>}
      </TouchableOpacity>

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Feedback Report</Text>
          
          <View style={styles.scoreRow}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreNumber}>{result.clarity}/10</Text>
              <Text style={styles.scoreLabel}>Clarity</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreNumber}>{result.grammar}/10</Text>
              <Text style={styles.scoreLabel}>Grammar</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreNumber}>{result.confidence}/10</Text>
              <Text style={styles.scoreLabel}>Confidence</Text>
            </View>
          </View>

          <View style={styles.overallScore}>
            <Text style={styles.overallText}>Overall Score: {result.score}/100</Text>
          </View>

          <Text style={styles.feedbackText}>{result.feedback}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f9f9f9', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  card: { backgroundColor: '#e6f2ff', padding: 15, borderRadius: 10, marginBottom: 20 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardHeader: { fontWeight: 'bold', color: '#0066cc', marginBottom: 0 },
  shuffleBtn: { color: '#0066cc', fontWeight: 'bold', fontSize: 13, backgroundColor: '#cce6ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 },
  questionText: { fontSize: 18, fontStyle: 'italic', color: '#333' },
  actionRow: { alignItems: 'center', marginBottom: 20 },
  recordBtn: { backgroundColor: '#cc0000', padding: 15, borderRadius: 30, width: '80%', alignItems: 'center' },
  recordingActive: { backgroundColor: '#666' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  label: { fontWeight: 'bold', marginBottom: 10, color: '#666' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 15, minHeight: 120, fontSize: 16, marginBottom: 20, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#00cc66', padding: 15, borderRadius: 8, alignItems: 'center' },
  resultCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginTop: 30, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  resultTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  scoreBox: { alignItems: 'center' },
  scoreNumber: { fontSize: 22, fontWeight: 'bold', color: '#0066cc' },
  scoreLabel: { fontSize: 12, color: '#888', marginTop: 5 },
  overallScore: { backgroundColor: '#f2f2f2', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  overallText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  feedbackText: { fontSize: 15, color: '#444', lineHeight: 22 }
});

export default InterviewPracticeScreen;
