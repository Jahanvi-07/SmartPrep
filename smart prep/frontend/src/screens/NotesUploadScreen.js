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
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },
  heroCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#1a1a2e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#a0a0c0',
    textAlign: 'center',
    lineHeight: 20,
  },
  formatsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  formatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  formatIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  formatLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  pickerArea: {
    borderWidth: 2,
    borderColor: '#d0d0e0',
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 30,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  pickerAreaSelected: {
    borderColor: '#0066cc',
    borderStyle: 'solid',
    backgroundColor: '#f0f6ff',
  },
  pickerPlaceholder: {
    alignItems: 'center',
  },
  pickerIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  pickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  pickerHint: {
    fontSize: 12,
    color: '#999',
  },
  selectedFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  selectedFileIcon: {
    fontSize: 36,
    marginRight: 14,
  },
  selectedFileMeta: {
    flex: 1,
  },
  selectedFileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  selectedFileSize: {
    fontSize: 12,
    color: '#888',
    marginTop: 3,
  },
  changeFileBtn: {
    backgroundColor: '#e8e8f0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeFileBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  uploadButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#0066cc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadButtonDisabled: {
    backgroundColor: '#a0c4e8',
    shadowOpacity: 0,
    elevation: 0,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#00cc66',
  },
  resultHeader: {
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  resultFileName: {
    fontSize: 13,
    color: '#888',
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 12,
  },
  resultContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  resultCharCount: {
    fontSize: 12,
    color: '#00cc66',
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'right',
  },
  viewNotesBtn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0066cc',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 30,
  },
  viewNotesBtnText: {
    color: '#0066cc',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NotesUploadScreen;
