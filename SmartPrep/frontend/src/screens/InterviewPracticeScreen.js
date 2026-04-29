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
  container: { padding: 20, backgroundColor: '#E6F0FA', flexGrow: 1 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 24, color: '#1F2937' },
  card: { backgroundColor: '#D6E8FF', padding: 24, borderRadius: 24, marginBottom: 24, borderWidth: 1, borderColor: '#CDE0FF' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardHeader: { fontWeight: '800', color: '#1F2937', fontSize: 16 },
  shuffleBtn: { color: '#1F2937', fontWeight: '800', fontSize: 13, backgroundColor: '#CDE0FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  questionText: { fontSize: 20, fontStyle: 'italic', color: '#1F2937', lineHeight: 28, fontWeight: '500' },
  actionRow: { alignItems: 'center', marginBottom: 24 },
  recordBtn: { backgroundColor: '#FCE4EC', padding: 18, borderRadius: 30, width: '90%', alignItems: 'center', borderWidth: 1, borderColor: '#F8BBD0' },
  recordingActive: { backgroundColor: '#F48FB1' },
  btnText: { color: '#1F2937', fontWeight: '800', fontSize: 16 },
  label: { fontWeight: '800', marginBottom: 12, color: '#1F2937', fontSize: 16 },
  input: { backgroundColor: '#D6E8FF', borderWidth: 1, borderColor: '#CDE0FF', borderRadius: 24, padding: 20, minHeight: 150, fontSize: 16, marginBottom: 24, color: '#1F2937', textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#DCD2FF', padding: 18, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: '#CDE0FF' },
  resultCard: { backgroundColor: '#E9E2FF', padding: 24, borderRadius: 24, marginTop: 32, borderWidth: 1, borderColor: '#DCD2FF' },
  resultTitle: { fontSize: 22, fontWeight: '800', marginBottom: 20, textAlign: 'center', color: '#1F2937' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
  scoreBox: { alignItems: 'center', backgroundColor: '#D6E8FF', padding: 16, borderRadius: 16, minWidth: 80, borderWidth: 1, borderColor: '#CDE0FF' },
  scoreNumber: { fontSize: 22, fontWeight: '800', color: '#1F2937' },
  scoreLabel: { fontSize: 12, color: '#4B5563', marginTop: 6, fontWeight: '700', textTransform: 'uppercase' },
  overallScore: { backgroundColor: '#DCD2FF', padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#CDE0FF' },
  overallText: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  feedbackText: { fontSize: 15, color: '#4B5563', lineHeight: 24, fontWeight: '500' }
});

export default InterviewPracticeScreen;
