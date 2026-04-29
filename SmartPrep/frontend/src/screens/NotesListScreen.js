import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getNotes, deleteNote } from '../api/notes';

const NotesListScreen = () => {
  const navigation = useNavigation();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchNotes = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getNotes();
      setNotes(data);
    } catch (error) {
      console.error('Fetch notes error:', error);
      Alert.alert('Error', 'Failed to load notes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Re-fetch whenever this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [])
  );

  const handleDelete = (noteId, fileName) => {
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${fileName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(noteId);
            try {
              await deleteNote(noteId);
              setNotes((prev) => prev.filter((n) => n._id !== noteId));
              if (selectedNote?._id === noteId) setSelectedNote(null);
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete note');
            } finally {
              setDeleting(null);
            }
          },
        },
      ]
    );
  };

  const getFileIcon = (name) => {
    if (!name) return '📄';
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📕';
    if (ext === 'docx') return '📘';
    if (ext === 'txt') return '📝';
    return '📄';
  };

  const getFileTypeColor = (name) => {
    if (!name) return '#888';
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '#e53935';
    if (ext === 'docx') return '#1565c0';
    if (ext === 'txt') return '#43a047';
    return '#888';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const renderNoteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => setSelectedNote(item)}
      activeOpacity={0.7}
    >
      <View style={styles.noteRow}>
        <Text style={styles.noteIcon}>{getFileIcon(item.fileName)}</Text>
        <View style={styles.noteMeta}>
          <Text style={styles.noteFileName} numberOfLines={1}>
            {item.fileName}
          </Text>
          <View style={styles.noteSubRow}>
            <View
              style={[
                styles.fileTypeBadge,
                { backgroundColor: getFileTypeColor(item.fileName) + '18' },
              ]}
            >
              <Text
                style={[
                  styles.fileTypeText,
                  { color: getFileTypeColor(item.fileName) },
                ]}
              >
                {item.fileName.split('.').pop().toUpperCase()}
              </Text>
            </View>
            <Text style={styles.noteDate}>{formatDate(item.createdAt)}</Text>
            <Text style={styles.noteChars}>
              {item.content.length.toLocaleString()} chars
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item._id, item.fileName)}
          disabled={deleting === item._id}
        >
          {deleting === item._id ? (
            <ActivityIndicator size="small" color="#e53935" />
          ) : (
            <Text style={styles.deleteBtnText}>🗑️</Text>
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.notePreview} numberOfLines={2}>
        {item.content}
      </Text>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>📭</Text>
      <Text style={styles.emptyTitle}>No Notes Yet</Text>
      <Text style={styles.emptySubtitle}>
        Upload your first file to get started!
      </Text>
      <TouchableOpacity
        style={styles.emptyUploadBtn}
        onPress={() => navigation.navigate('NotesUpload')}
      >
        <Text style={styles.emptyUploadBtnText}>+ Upload Notes</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading your notes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Notes</Text>
          <Text style={styles.headerCount}>
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} saved
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('NotesUpload')}
        >
          <Text style={styles.addBtnText}>+ Upload</Text>
        </TouchableOpacity>
      </View>

      {/* Notes List */}
      <FlatList
        data={notes}
        keyExtractor={(item) => item._id}
        renderItem={renderNoteItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          notes.length === 0 ? styles.emptyContainer : styles.listContainer
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchNotes(true)}
            colors={['#0066cc']}
            tintColor="#0066cc"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Note Detail Modal */}
      <Modal
        visible={!!selectedNote}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedNote(null)}
      >
        {selectedNote && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedNote(null)}
              >
                <Text style={styles.modalCloseBtnText}>✕ Close</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedNote.fileName}
              </Text>
              <Text style={styles.modalDate}>
                Uploaded {formatDate(selectedNote.createdAt)} •{' '}
                {selectedNote.content.length.toLocaleString()} characters
              </Text>
              <TouchableOpacity
                style={styles.generateModalBtn}
                onPress={() => {
                  const content = selectedNote.content;
                  setSelectedNote(null);
                  navigation.navigate('Generator', { initialText: content });
                }}
              >
                <Text style={styles.generateModalBtnText}>🧠 Generate Practice Test</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalDivider} />
            <ScrollView
              style={styles.modalContentScroll}
            >
              <Text style={styles.modalContent}>
                {selectedNote.content}
              </Text>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E6F0FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E6F0FA' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#4B5563', fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 18, backgroundColor: '#D6E8FF', borderBottomWidth: 1, borderBottomColor: '#CDE0FF' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1F2937' },
  headerCount: { fontSize: 14, color: '#4B5563', marginTop: 2, fontWeight: '600' },
  addBtn: { backgroundColor: '#DCD2FF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: '#CDE0FF' },
  addBtnText: { color: '#1F2937', fontWeight: '800', fontSize: 15 },
  listContainer: { padding: 20, paddingBottom: 40 },
  emptyContainer: { flexGrow: 1 },
  noteCard: { backgroundColor: '#D6E8FF', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#CDE0FF' },
  noteRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  noteIcon: { fontSize: 32, marginRight: 14 },
  noteMeta: { flex: 1 },
  noteFileName: { fontSize: 17, fontWeight: '800', color: '#1F2937', marginBottom: 4 },
  noteSubRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fileTypeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  fileTypeText: { fontSize: 12, fontWeight: '800' },
  noteDate: { fontSize: 12, color: '#4B5563', fontWeight: '600' },
  noteChars: { fontSize: 12, color: '#6B7280' },
  deleteBtn: { padding: 10, marginLeft: 8 },
  deleteBtnText: { fontSize: 20 },
  notePreview: { fontSize: 14, color: '#4B5563', lineHeight: 22, paddingLeft: 46 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 24, fontWeight: '800', color: '#1F2937', marginBottom: 10 },
  emptySubtitle: { fontSize: 15, color: '#4B5563', textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  emptyUploadBtn: { backgroundColor: '#DCD2FF', paddingHorizontal: 32, paddingVertical: 18, borderRadius: 20, borderWidth: 1, borderColor: '#CDE0FF' },
  emptyUploadBtnText: { color: '#1F2937', fontSize: 17, fontWeight: '800' },
  modalContainer: { flex: 1, backgroundColor: '#E6F0FA' },
  modalHeader: { paddingHorizontal: 24, paddingVertical: 24, backgroundColor: '#E9E2FF', borderBottomWidth: 1, borderBottomColor: '#DCD2FF' },
  modalCloseBtn: { alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 16, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 12, marginBottom: 12 },
  modalCloseBtnText: { fontSize: 14, fontWeight: '800', color: '#1F2937' },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#1F2937', marginBottom: 6 },
  modalDate: { fontSize: 13, color: '#4B5563', fontWeight: '600' },
  modalDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)' },
  modalContentScroll: { flex: 1, padding: 24 },
  modalContent: { fontSize: 16, color: '#1F2937', lineHeight: 26 },
  generateModalBtn: { marginTop: 20, backgroundColor: '#DCD2FF', paddingVertical: 16, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#CDE0FF' },
  generateModalBtnText: { color: '#1F2937', fontWeight: '800', fontSize: 16 },
});

export default NotesListScreen;
