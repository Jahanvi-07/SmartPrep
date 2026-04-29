import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Platform } from 'react-native';
import { generateCodingProblem } from '../api/practice';
import { recordPractice } from '../api/dashboard';

const CodingPracticeScreen = () => {
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [practiceRecorded, setPracticeRecorded] = useState(false);

  const fetchProblem = async () => {
    setLoading(true);
    setProblem(null);
    setShowSolution(false);
    setCode('');
    setPracticeRecorded(false);
    try {
      const data = await generateCodingProblem();
      setProblem(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to generate coding problem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>💻 DSA Coding Practice</Text>
      
      {!problem ? (
        <TouchableOpacity style={styles.generateBtn} onPress={fetchProblem} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Generate Random Problem</Text>}
        </TouchableOpacity>
      ) : (
        <View style={styles.workspace}>
          <View style={styles.problemPane}>
            <View style={styles.headerRow}>
              <Text style={styles.problemTitle}>{problem.title}</Text>
              <View style={[styles.badge, problem.difficulty === 'Hard' ? styles.hard : problem.difficulty === 'Medium' ? styles.medium : styles.easy]}>
                <Text style={styles.badgeText}>{problem.difficulty}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Problem Statement</Text>
            <Text style={styles.text}>{problem.problemStatement}</Text>

            <Text style={styles.sectionTitle}>Examples & Expected I/O</Text>
            <Text style={styles.codeText}>{problem.inputOutput}</Text>

            <Text style={styles.sectionTitle}>Constraints</Text>
            <Text style={styles.text}>{problem.constraints}</Text>
          </View>

          <View style={styles.editorPane}>
            <Text style={styles.editorTitle}>Code Editor</Text>
            <TextInput
              style={styles.editorInput}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              placeholder="# Write your solution here..."
              placeholderTextColor="#888"
              value={code}
              onChangeText={setCode}
            />

            <TouchableOpacity style={styles.revealBtn} onPress={async () => {
              setShowSolution(!showSolution);
              if (!showSolution && !practiceRecorded) {
                setPracticeRecorded(true);
                try {
                  await recordPractice(85, 'Coding Practice');
                  Alert.alert('Nice work!', 'You earned XP and updated your streak!');
                } catch (e) {
                  console.error(e);
                }
              }
            }}>
              <Text style={styles.revealBtnText}>{showSolution ? 'Hide Solution' : 'Reveal Solution'}</Text>
            </TouchableOpacity>

            {showSolution && (
              <View style={styles.solutionBox}>
                <Text style={styles.sectionTitle}>Solution Code</Text>
                <Text style={styles.codeText}>{problem.solution}</Text>
                
                <Text style={styles.sectionTitle}>Explanation</Text>
                <Text style={styles.text}>{problem.explanation}</Text>
              </View>
            )}
            
            <TouchableOpacity style={[styles.generateBtn, { marginTop: 30 }]} onPress={fetchProblem} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Skip & Generate New Problem</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#E6F0FA', flexGrow: 1 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 24, color: '#1F2937' },
  generateBtn: { backgroundColor: '#DCD2FF', padding: 18, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#CDE0FF' },
  btnText: { color: '#1F2937', fontWeight: '800', fontSize: 16 },
  workspace: { flex: 1 },
  problemPane: { backgroundColor: '#D6E8FF', padding: 24, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: '#CDE0FF' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  problemTitle: { fontSize: 22, fontWeight: '800', color: '#1F2937', flex: 1 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  easy: { backgroundColor: '#DFF5EA' },
  medium: { backgroundColor: '#F3EFFF' },
  hard: { backgroundColor: '#FCE4EC' },
  badgeText: { fontWeight: '700', fontSize: 13, color: '#1F2937' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1F2937', marginTop: 20, marginBottom: 8 },
  text: { fontSize: 15, color: '#4B5563', lineHeight: 22 },
  codeText: { backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 16, borderRadius: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 14, color: '#1F2937', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  editorPane: { flex: 1 },
  editorTitle: { fontWeight: '800', marginBottom: 12, color: '#1F2937', fontSize: 16 },
  editorInput: { backgroundColor: '#1F2937', color: '#E6F0FA', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', padding: 20, fontSize: 15, borderRadius: 24, minHeight: 350, textAlignVertical: 'top' },
  revealBtn: { backgroundColor: '#E9E2FF', padding: 16, borderRadius: 20, alignItems: 'center', marginTop: 15, borderWidth: 1, borderColor: '#DCD2FF' },
  revealBtnText: { color: '#1F2937', fontWeight: '800' },
  solutionBox: { backgroundColor: '#E9E2FF', padding: 24, borderRadius: 24, marginTop: 15, borderWidth: 1, borderColor: '#DCD2FF' }
});

export default CodingPracticeScreen;
