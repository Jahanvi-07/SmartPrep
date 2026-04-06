import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { getDashboardData, recordPractice } from '../api/dashboard';
import { useNavigation } from '@react-navigation/native';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [practicing, setPracticing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handlePractice = async () => {
    setPracticing(true);
    try {
      // Simulate random score between 60 and 100 for Gamification
      const randomScore = Math.floor(Math.random() * 40) + 60;
      await recordPractice(randomScore, 'Math Review');
      await fetchDashboard(); // Refresh UI to show new streak/xp
      Alert.alert('Great job!', `You completed a session and scored ${randomScore}!`);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to record practice session');
    } finally {
      setPracticing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 20, fontSize: 16 }}>Failed to load data. Your session may be invalid.</Text>
        <TouchableOpacity style={styles.actionButton} onPress={logout}>
          <Text style={styles.actionBtnText}>Logout & Clear Session</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const xpProgress = Math.min((data.xp / data.nextLevelXp) * 100, 100);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Row */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {data.name}</Text>
          <Text style={styles.levelText}>Level {data.level}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Gamification Stats */}
      <View style={styles.statsCard}>
        <View style={styles.streakBox}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakCount}>{data.streak}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
        </View>

        <View style={styles.xpDivider} />

        <View style={styles.xpBox}>
          <Text style={styles.xpCount}>{data.xp} / {data.nextLevelXp}</Text>
          <Text style={styles.xpLabel}>XP to Level Up</Text>
          
          {/* Progress Bar Container */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${xpProgress}%` }]} />
          </View>
        </View>
      </View>

      {/* Action Area */}
      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={handlePractice}
        disabled={practicing}
      >
        {practicing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.actionBtnText}>Start Practice Session</Text>
        )}
      </TouchableOpacity>

      {/* Practice Modules Banner Row */}
      <View style={styles.practiceModulesRow}>
        <TouchableOpacity 
          style={[styles.aiBanner, styles.interviewBanner, { flex: 1, marginRight: 10 }]} 
          onPress={() => navigation.navigate('InterviewPractice')}
        >
          <Text style={styles.aiBannerTitle}>🎙️ Mock Interview</Text>
          <Text style={styles.aiBannerSub}>AI voice practice</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.aiBanner, styles.codingBanner, { flex: 1, marginLeft: 10 }]} 
          onPress={() => navigation.navigate('CodingPractice')}
        >
          <Text style={styles.aiBannerTitle}>💻 Code Practice</Text>
          <Text style={styles.aiBannerSub}>DSA interview logic</Text>
        </TouchableOpacity>
      </View>

      {/* Chat & Compiler Features Row */}
      <View style={styles.practiceModulesRow}>
        <TouchableOpacity 
          style={[styles.aiBanner, styles.chatBanner, { flex: 1, marginRight: 10 }]} 
          onPress={() => navigation.navigate('Chat')}
        >
          <Text style={styles.aiBannerTitle}>🤖 AI Tutor</Text>
          <Text style={styles.aiBannerSub}>Chat & Learn</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.aiBanner, styles.compilerBanner, { flex: 1, marginLeft: 10 }]} 
          onPress={() => navigation.navigate('Compiler')}
        >
          <Text style={styles.aiBannerTitle}>⚙️ Compiler</Text>
          <Text style={styles.aiBannerSub}>Run JS/Python code</Text>
        </TouchableOpacity>
      </View>

      {/* AI Generator Banner */}
      <TouchableOpacity 
        style={styles.aiBanner} 
        onPress={() => navigation.navigate('Generator')}
      >
        <Text style={styles.aiBannerTitle}>✨ AI Question Generator</Text>
        <Text style={styles.aiBannerSub}>Paste notes to create custom practice tests!</Text>
      </TouchableOpacity>

      {/* Notes Upload Banner */}
      <TouchableOpacity 
        style={[styles.aiBanner, styles.notesBanner]} 
        onPress={() => navigation.navigate('NotesUpload')}
      >
        <Text style={styles.aiBannerTitle}>📚 Notes Upload</Text>
        <Text style={styles.aiBannerSub}>Upload PDF, DOCX, or TXT files & extract text!</Text>
      </TouchableOpacity>

      {/* History */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Recent History</Text>
        {data.practiceHistory.length === 0 ? (
          <Text style={styles.emptyText}>No practice sessions yet.</Text>
        ) : (
          data.practiceHistory.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <View>
                <Text style={styles.historyTopic}>{item.topic}</Text>
                <Text style={styles.historyDate}>{new Date(item.date).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.historyScore}>{item.score}%</Text>
            </View>
          )).reverse() // Show newest first
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  levelText: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '600',
    marginTop: 4,
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: '#ffe6e6',
    borderRadius: 8,
  },
  logoutText: {
    color: '#cc0000',
    fontWeight: 'bold',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: 25,
  },
  streakBox: {
    flex: 1,
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 32,
  },
  streakCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff9900',
  },
  streakLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  xpDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#eee',
    marginHorizontal: 15,
  },
  xpBox: {
    flex: 2,
  },
  xpCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  xpLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00cc66',
  },
  actionButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0066cc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 30,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  aiBanner: {
    backgroundColor: '#4a2599',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#4a2599',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  aiBannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  aiBannerSub: {
    color: '#d1bfff',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  practiceModulesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  interviewBanner: {
    backgroundColor: '#008080',
    shadowColor: '#008080',
    alignItems: 'center',
  },
  codingBanner: {
    backgroundColor: '#ff6600',
    shadowColor: '#ff6600',
    alignItems: 'center',
  },
  notesBanner: {
    backgroundColor: '#0066cc',
    shadowColor: '#0066cc',
    alignItems: 'center',
  },
  chatBanner: {
    backgroundColor: '#1E90FF',
    shadowColor: '#1E90FF',
    alignItems: 'center',
  },
  compilerBanner: {
    backgroundColor: '#2F4F4F',
    shadowColor: '#2F4F4F',
    alignItems: 'center',
  },
  historySection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  historyTopic: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  historyDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  historyScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00cc66',
  }
});

export default DashboardScreen;
