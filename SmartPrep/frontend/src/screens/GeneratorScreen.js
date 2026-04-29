import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { generateQuestions } from '../api/generator';
import { recordPractice } from '../api/dashboard';

const GeneratorScreen = () => {
  const route = useRoute();
  const [text, setText] = useState(route.params?.initialText || '');
  const [type, setType] = useState('mcq');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);

  const handleGenerate = async () => {
    if (!text.trim()) {
      return Alert.alert('Error', 'Please enter some notes to generate questions from.');
    }
    
    setLoading(true);
    setQuestions([]);
    try {
      const data = await generateQuestions(text, type);
      // data should be an array of objects
      setQuestions(data);
      try {
        await recordPractice(80, 'AI Generator Practice');
      } catch (err) {
        console.error('Failed to update streak/xp', err);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to generate questions. Did you set your Gemini API key in the backend?');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (q, index) => {
    return (
      <View key={index} style={styles.card}>
        <Text style={styles.questionText}>{index + 1}. {q.question}</Text>
        
        {q.options && q.options.length > 0 && (
          <View style={styles.optionsContainer}>
            {q.options.map((opt, i) => (
              <Text key={i} style={styles.optionText}>• {opt}</Text>
            ))}
          </View>
        )}
        
        <RevealAnswer answer={q.answer} explanation={q.explanation} />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>AI Question Generator</Text>
        <Text style={styles.subtext}>Enter a topic or paste your notes below, and the AI will generate practice questions for you.</Text>
        
        <View style={styles.typeSelector}>
          {['mcq', 'short', 'interview'].map((t) => (
            <TouchableOpacity 
              key={t}
              style={[styles.typeButton, type === t && styles.typeButtonActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeText, type === t && styles.typeTextActive]}>
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="e.g. 'Photosynthesis' or paste your full notes..."
          multiline
          numberOfLines={6}
          value={text}
          onChangeText={setText}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.generateButton} onPress={handleGenerate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Generate</Text>}
        </TouchableOpacity>

        {questions.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsHeader}>Your Questions</Text>
            {questions.map(renderQuestion)}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Sub-component to obscure the answer until tapped
const RevealAnswer = ({ answer, explanation }) => {
  const [revealed, setRevealed] = useState(false);

  if (!revealed) {
    return (
      <TouchableOpacity style={styles.revealBtn} onPress={() => setRevealed(true)}>
        <Text style={styles.revealBtnText}>Reveal Answer</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.answerBox}>
      <Text style={styles.correctAnswerLabel}>Correct Answer:</Text>
      <Text style={styles.answerText}>{answer}</Text>
      {explanation && (
        <>
          <Text style={styles.explanationLabel}>Explanation:</Text>
          <Text style={styles.explanationText}>{explanation}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6F0FA' },
  scroll: { padding: 20, paddingBottom: 50 },
  header: { fontSize: 28, fontWeight: '800', marginBottom: 8, color: '#1F2937' },
  subtext: { fontSize: 15, color: '#4B5563', marginBottom: 24, lineHeight: 22 },
  typeSelector: { flexDirection: 'row', marginBottom: 20, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#CDE0FF' },
  typeButton: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: '#D6E8FF' },
  typeButtonActive: { backgroundColor: '#DCD2FF' },
  typeText: { color: '#1F2937', fontWeight: '700' },
  typeTextActive: { color: '#1F2937' },
  input: { backgroundColor: '#D6E8FF', borderWidth: 1, borderColor: '#CDE0FF', borderRadius: 20, padding: 20, fontSize: 16, minHeight: 180, marginBottom: 20, color: '#1F2937' },
  generateButton: { backgroundColor: '#DCD2FF', padding: 18, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#CDE0FF' },
  btnText: { color: '#1F2937', fontWeight: '800', fontSize: 16 },
  resultsContainer: { marginTop: 32 },
  resultsHeader: { fontSize: 22, fontWeight: '800', marginBottom: 16, color: '#1F2937' },
  card: { backgroundColor: '#E9E2FF', padding: 24, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: '#DCD2FF' },
  questionText: { fontSize: 17, fontWeight: '800', marginBottom: 12, color: '#1F2937' },
  optionsContainer: { marginBottom: 12, paddingLeft: 12 },
  optionText: { fontSize: 15, color: '#1F2937', marginBottom: 6, fontWeight: '500' },
  revealBtn: { backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  revealBtnText: { color: '#1F2937', fontWeight: '700' },
  answerBox: { backgroundColor: '#DFF5EA', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#C9EAD9' },
  correctAnswerLabel: { fontWeight: '800', color: '#1F2937', marginBottom: 4 },
  answerText: { fontSize: 15, marginBottom: 12, color: '#1F2937' },
  explanationLabel: { fontWeight: '800', color: '#1F2937', marginBottom: 4 },
  explanationText: { fontSize: 14, color: '#4B5563', lineHeight: 20 }
});

export default GeneratorScreen;
