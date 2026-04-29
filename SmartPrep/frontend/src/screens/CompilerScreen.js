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
  container: { flex: 1, padding: 20, backgroundColor: '#E6F0FA' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 20, color: '#1F2937' },
  langSelector: { marginBottom: 16 },
  langChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, backgroundColor: '#D6E8FF', marginRight: 10, borderWidth: 1, borderColor: '#CDE0FF' },
  langChipActive: { backgroundColor: '#DCD2FF' },
  langChipText: { color: '#1F2937', fontWeight: '700' },
  langChipTextActive: { color: '#1F2937' },
  editor: { 
    height: 300, 
    backgroundColor: '#1F2937', 
    color: '#E6F0FA', 
    padding: 20, 
    borderRadius: 24,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 15,
    textAlignVertical: 'top'
  },
  runButton: { backgroundColor: '#DCD2FF', padding: 18, borderRadius: 24, alignItems: 'center', marginVertical: 20, borderWidth: 1, borderColor: '#CDE0FF' },
  runText: { color: '#1F2937', fontWeight: '800', fontSize: 16 },
  outputTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12, color: '#1F2937' },
  outputContainer: { flex: 1, backgroundColor: '#E9E2FF', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#DCD2FF' },
  outputText: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', color: '#1F2937', fontSize: 14 }
});
