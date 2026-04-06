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
  container: { padding: 20, backgroundColor: '#f9f9f9', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  generateBtn: { backgroundColor: '#0066cc', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  workspace: { flex: 1 },
  problemPane: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#eee' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  problemTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  easy: { backgroundColor: '#e6ffe6' },
  medium: { backgroundColor: '#fff0e6' },
  hard: { backgroundColor: '#ffe6e6' },
  badgeText: { fontWeight: 'bold', fontSize: 12, color: '#333' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#555', marginTop: 15, marginBottom: 5 },
  text: { fontSize: 14, color: '#444', lineHeight: 20 },
  codeText: { backgroundColor: '#f4f4f4', padding: 10, borderRadius: 5, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, color: '#d14' },
  editorPane: { flex: 1 },
  editorTitle: { fontWeight: 'bold', marginBottom: 10, color: '#333' },
  editorInput: { backgroundColor: '#1e1e1e', color: '#d4d4d4', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', padding: 15, fontSize: 14, borderRadius: 8, minHeight: 300, textAlignVertical: 'top' },
  revealBtn: { backgroundColor: '#e6f2ff', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  revealBtnText: { color: '#0066cc', fontWeight: 'bold' },
  solutionBox: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginTop: 15, borderWidth: 1, borderColor: '#b3d9ff' }
});

export default CodingPracticeScreen;
