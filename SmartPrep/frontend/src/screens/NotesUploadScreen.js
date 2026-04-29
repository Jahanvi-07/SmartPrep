import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { uploadNote } from '../api/notes';
import { useNavigation } from '@react-navigation/native';

const NotesUploadScreen = () => {
  const navigation = useNavigation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        setUploadResult(null);
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('No File', 'Please select a file first');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const note = await uploadNote(selectedFile);
      setUploadResult(note);
      setSelectedFile(null);
      Alert.alert('Success! ✅', `"${note.fileName}" has been processed and saved.`);
    } catch (error) {
      console.error('Upload error:', error);
      // Fallback for Axios (if error.response exists) or standard Error (error.message)
      const msg = error.response?.data?.message || error.message || 'Failed to upload and process file';
      Alert.alert('Upload Failed', msg);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (name) => {
    if (!name) return '📄';
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📕';
    if (ext === 'docx') return '📘';
    if (ext === 'txt') return '📝';
    return '📄';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Hero Section */}
      <View style={styles.heroCard}>
        <Text style={styles.heroEmoji}>📚</Text>
        <Text style={styles.heroTitle}>Upload Your Notes</Text>
        <Text style={styles.heroSubtitle}>
          Upload PDF, DOCX, or TXT files and we'll extract the text for you automatically.
        </Text>
      </View>

      {/* Supported Formats */}
      <View style={styles.formatsRow}>
        <View style={styles.formatChip}>
          <Text style={styles.formatIcon}>📕</Text>
          <Text style={styles.formatLabel}>PDF</Text>
        </View>
        <View style={styles.formatChip}>
          <Text style={styles.formatIcon}>📘</Text>
          <Text style={styles.formatLabel}>DOCX</Text>
        </View>
        <View style={styles.formatChip}>
          <Text style={styles.formatIcon}>📝</Text>
          <Text style={styles.formatLabel}>TXT</Text>
        </View>
      </View>

      {/* File Picker Area */}
      <TouchableOpacity
        style={[styles.pickerArea, selectedFile && styles.pickerAreaSelected]}
        onPress={pickDocument}
        activeOpacity={0.7}
      >
        {selectedFile ? (
          <View style={styles.selectedFileInfo}>
            <Text style={styles.selectedFileIcon}>
              {getFileIcon(selectedFile.name)}
            </Text>
            <View style={styles.selectedFileMeta}>
              <Text style={styles.selectedFileName} numberOfLines={2}>
                {selectedFile.name}
              </Text>
              {selectedFile.size && (
                <Text style={styles.selectedFileSize}>
                  {formatFileSize(selectedFile.size)}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.changeFileBtn}
              onPress={pickDocument}
            >
              <Text style={styles.changeFileBtnText}>Change</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.pickerPlaceholder}>
            <Text style={styles.pickerIcon}>☁️</Text>
            <Text style={styles.pickerText}>Tap to select a file</Text>
            <Text style={styles.pickerHint}>Max 10MB • PDF, DOCX, TXT</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Upload Button */}
      <TouchableOpacity
        style={[
          styles.uploadButton,
          (!selectedFile || uploading) && styles.uploadButtonDisabled,
        ]}
        onPress={handleUpload}
        disabled={!selectedFile || uploading}
        activeOpacity={0.8}
      >
        {uploading ? (
          <View style={styles.uploadingRow}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.uploadButtonText}>  Processing...</Text>
          </View>
        ) : (
          <Text style={styles.uploadButtonText}>Upload & Extract Text</Text>
        )}
      </TouchableOpacity>

      {/* Upload Result Preview */}
      {uploadResult && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>✅ Extracted Content</Text>
            <Text style={styles.resultFileName}>{uploadResult.fileName}</Text>
          </View>
          <View style={styles.resultDivider} />
          <Text style={styles.resultContent} numberOfLines={12}>
            {uploadResult.content}
          </Text>
          <Text style={styles.resultCharCount}>
            {uploadResult.content.length.toLocaleString()} characters extracted
          </Text>
        </View>
      )}

      {/* Generate Test from Note Link */}
      {uploadResult && (
        <TouchableOpacity
          style={[styles.viewNotesBtn, { borderColor: '#00cc66', marginBottom: 15 }]}
          onPress={() => navigation.navigate('Generator', { initialText: uploadResult.content })}
          activeOpacity={0.7}
        >
          <Text style={[styles.viewNotesBtnText, { color: '#00cc66' }]}>🧠 Generate Practice Test</Text>
        </TouchableOpacity>
      )}

      {/* View All Notes Link */}
      <TouchableOpacity
        style={styles.viewNotesBtn}
        onPress={() => navigation.navigate('NotesList')}
        activeOpacity={0.7}
      >
        <Text style={styles.viewNotesBtnText}>📋 View All My Notes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#E6F0FA', flexGrow: 1 },
  heroCard: { backgroundColor: '#D6E8FF', borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#CDE0FF' },
  heroEmoji: { fontSize: 48, marginBottom: 16 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#1F2937', marginBottom: 8 },
  heroSubtitle: { fontSize: 15, color: '#4B5563', textAlign: 'center', lineHeight: 22 },
  formatsRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24 },
  formatChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E9E2FF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#DCD2FF' },
  formatIcon: { fontSize: 16, marginRight: 8 },
  formatLabel: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  pickerArea: { borderWidth: 2, borderColor: '#CDE0FF', borderStyle: 'dashed', borderRadius: 24, backgroundColor: '#D6E8FF', padding: 32, marginBottom: 24, alignItems: 'center', justifyContent: 'center', minHeight: 160 },
  pickerAreaSelected: { borderColor: '#1F2937', borderStyle: 'solid', backgroundColor: '#E9E2FF' },
  pickerPlaceholder: { alignItems: 'center' },
  pickerIcon: { fontSize: 40, marginBottom: 12 },
  pickerText: { fontSize: 17, fontWeight: '800', color: '#1F2937', marginBottom: 6 },
  pickerHint: { fontSize: 13, color: '#4B5563' },
  selectedFileInfo: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  selectedFileIcon: { fontSize: 36, marginRight: 16 },
  selectedFileMeta: { flex: 1 },
  selectedFileName: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  selectedFileSize: { fontSize: 13, color: '#4B5563', marginTop: 4 },
  changeFileBtn: { backgroundColor: '#DCD2FF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#CDE0FF' },
  changeFileBtnText: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  uploadButton: { backgroundColor: '#DCD2FF', paddingVertical: 18, borderRadius: 24, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#CDE0FF' },
  uploadButtonDisabled: { backgroundColor: 'rgba(220, 210, 255, 0.5)', opacity: 0.7 },
  uploadButtonText: { color: '#1F2937', fontSize: 18, fontWeight: '800' },
  uploadingRow: { flexDirection: 'row', alignItems: 'center' },
  resultCard: { backgroundColor: '#FCE4EC', borderRadius: 24, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: '#F8BBD0' },
  resultHeader: { marginBottom: 16 },
  resultTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginBottom: 6 },
  resultFileName: { fontSize: 14, color: '#4B5563' },
  resultDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginBottom: 16 },
  resultContent: { fontSize: 15, color: '#1F2937', lineHeight: 24 },
  resultCharCount: { fontSize: 13, color: '#1F2937', fontWeight: '700', marginTop: 16, textAlign: 'right' },
  viewNotesBtn: { backgroundColor: '#E9E2FF', borderWidth: 1, borderColor: '#DCD2FF', paddingVertical: 16, borderRadius: 24, alignItems: 'center', marginBottom: 30 },
  viewNotesBtnText: { color: '#1F2937', fontSize: 16, fontWeight: '800' },
});

export default NotesUploadScreen;
