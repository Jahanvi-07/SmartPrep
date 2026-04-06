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
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  headerCount: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#0066cc',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  noteIcon: {
    fontSize: 30,
    marginRight: 12,
  },
  noteMeta: {
    flex: 1,
  },
  noteFileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  noteSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fileTypeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  noteDate: {
    fontSize: 12,
    color: '#888',
  },
  noteChars: {
    fontSize: 12,
    color: '#aaa',
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 8,
  },
  deleteBtnText: {
    fontSize: 18,
  },
  notePreview: {
    fontSize: 13,
    color: '#777',
    lineHeight: 19,
    paddingLeft: 42,
  },
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyUploadBtn: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#0066cc',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  emptyUploadBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#fafafa',
  },
  modalCloseBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 10,
  },
  modalCloseBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 12,
    color: '#888',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#eee',
  },
  modalContentScroll: {
    flex: 1,
    padding: 20,
  },
  modalContent: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
  },
  generateModalBtn: {
    marginTop: 15,
    backgroundColor: '#00cc66',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateModalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default NotesListScreen;
