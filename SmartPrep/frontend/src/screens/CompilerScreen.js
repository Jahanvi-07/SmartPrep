import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import authApi from '../api/auth';

const LANGUAGES = [
  { id: 'python', name: 'Python', defaultCode: 'print("Hello World")' },
  { id: 'javascript', name: 'JavaScript', defaultCode: 'console.log("Hello World");' },
  { id: 'java', name: 'Java', defaultCode: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello World");\n  }\n}' },
  { id: 'c', name: 'C', defaultCode: '#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}' },
  { id: 'cpp', name: 'C++', defaultCode: '#include <iostream>\n\nint main() {\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}' }
];

export default function CompilerScreen() {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].defaultCode);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLangChange = (lang) => {
    setSelectedLang(lang);
    setCode(lang.defaultCode);
    setOutput('');
  };

  const runCode = async () => {
    setLoading(true);
    setOutput("Running code...");
    try {
      const res = await authApi.post('/compiler/execute', { 
        language: selectedLang.id, 
        sourceCode: code 
      });
      setOutput(res.data.output || res.data.error || "Execution completed.");
    } catch (e) {
      console.error(e);
      setOutput("Error connecting to compiler service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text style={styles.title}>Online Compiler</Text>

      <View style={styles.langSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity 
              key={lang.id} 
              style={[styles.langChip, selectedLang.id === lang.id && styles.langChipActive]}
              onPress={() => handleLangChange(lang)}
            >
              <Text style={[styles.langChipText, selectedLang.id === lang.id && styles.langChipTextActive]}>
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TextInput 
        style={styles.editor} 
        value={code} 
        onChangeText={setCode} 
        multiline 
        autoCapitalize="none"
        autoCorrect={false}
      />

      
      <TouchableOpacity style={styles.runButton} onPress={runCode} disabled={loading}>
        <Text style={styles.runText}>{loading ? 'Executing...' : 'Run Code'}</Text>
      </TouchableOpacity>

      <Text style={styles.outputTitle}>Output console:</Text>
      <ScrollView style={styles.outputContainer}>
        <Text style={styles.outputText}>{output}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f0f0f5' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  langSelector: { marginBottom: 10 },
  langChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e0e0e0', marginRight: 8 },
  langChipActive: { backgroundColor: '#4CAF50' },
  langChipText: { color: '#333', fontWeight: 'bold' },
  langChipTextActive: { color: 'white' },
  editor: { 
    height: 250, 
    borderWidth: 1, 
    borderColor: '#333', 
    backgroundColor: '#1e1e1e', 
    color: '#d4d4d4', 
    padding: 12, 
    borderRadius: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlignVertical: 'top'
  },
  runButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 15 },
  runText: { color: 'white', fontWeight: 'bold' },
  outputTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#444' },
  outputContainer: { flex: 1, backgroundColor: '#e0e0e0', padding: 10, borderRadius: 8 },
  outputText: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', color: '#111' }
});
