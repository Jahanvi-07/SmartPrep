import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, 
  Alert, TextInput, Platform, SafeAreaView
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { getDashboardData } from '../api/dashboard';
import { useNavigation } from '@react-navigation/native';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#DCEBFF" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#1F2937', marginBottom: 20 }}>Failed to load data.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={logout}>
          <Text style={styles.primaryBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logoText}>SmartPrep</Text>
        </View>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput 
            placeholder="Search learning materials..." 
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.streakText}>🔥 {data.streak || 0}</Text>
          <TouchableOpacity onPress={logout}>
            <View style={styles.profileAvatar}>
              <Text style={styles.avatarText}>{data.name ? data.name[0] : 'U'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Section */}
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Prepare Smarter, Not Harder</Text>
            <Text style={styles.heroSubtitle}>AI-powered learning & test preparation tailored for your success.</Text>
            <View style={styles.heroActions}>
              <TouchableOpacity style={styles.primaryHeroBtn} onPress={() => navigation.navigate('Generator')}>
                <Text style={styles.primaryHeroBtnText}>Start Test</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.secondaryHeroBtn, { backgroundColor: '#E9E2FF', borderColor: '#DCD2FF' }]}>
                <Text style={styles.secondaryHeroBtnText}>Resume</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.heroIllustration}>🚀</Text>
        </View>

        {/* Bento Grid */}
        <View style={styles.bentoGrid}>
          
          {/* Performance Overview */}
          <View style={[styles.card, styles.span2, { backgroundColor: '#FCE4EC', borderColor: '#F8BBD0' }]}>
            <Text style={styles.cardTitle}>📊 Performance Overview</Text>
            <View style={styles.performanceStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>87%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{data.streak || 0}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{data.xp || 0}/100</Text>
                <Text style={styles.statLabel}>XP Progress</Text>
                <View style={styles.xpBarBg}>
                  <View style={[styles.xpBarFill, { width: `${(data.xp || 0) % 100}%` }]} />
                </View>
              </View>
            </View>
          </View>



          {/* Quick Quiz */}
          <View style={[styles.card, { backgroundColor: '#D6E8FF', borderColor: '#CDE0FF' }]}>
            <Text style={styles.cardIcon}>📝</Text>
            <Text style={styles.cardTitle}>Quick Quiz</Text>
            <Text style={styles.cardDesc}>Pick a topic & start immediately</Text>
            <TouchableOpacity style={styles.cardBtn} onPress={() => navigation.navigate('Generator')}>
              <Text style={styles.cardBtnText}>Select & Start</Text>
            </TouchableOpacity>
          </View>

          {/* AI Note CGenrator - Highlight Card */}
          <View style={[styles.card, { backgroundColor: '#E9E2FF', flex: 1.5, borderColor: '#DCD2FF' }]}>
            <Text style={styles.cardIcon}>✨</Text>
            <Text style={[styles.cardTitle, { color: '#6366F1' }]}>AI Note Generatorr</Text>
            <Text style={styles.cardDesc}>Transform your study notes into interactive tests</Text>
            <TouchableOpacity style={[styles.cardBtn, { backgroundColor: '#DCD2FF' }]} onPress={() => navigation.navigate('Generator')}>
              <Text style={[styles.cardBtnText, { color: '#1F2937' }]}>Genrate Notes</Text>
            </TouchableOpacity>
          </View>

          {/* Mock Interview */}
          <TouchableOpacity style={[styles.card, { backgroundColor: '#D6E8FF', borderColor: '#CDE0FF' }]} onPress={() => navigation.navigate('InterviewPractice')}>
            <Text style={styles.cardIcon}>🎤</Text>
            <Text style={styles.cardTitle}>Mock Interview</Text>
            <Text style={styles.cardDesc}>AI voice practice</Text>
          </TouchableOpacity>

          {/* Code Practice */}
          <TouchableOpacity style={[styles.card, { backgroundColor: '#E9E2FF', borderColor: '#DCD2FF' }]} onPress={() => navigation.navigate('CodingPractice')}>
            <Text style={styles.cardIcon}>💻</Text>
            <Text style={styles.cardTitle}>Code Practice</Text>
            <Text style={styles.cardDesc}>DSA Masterclass</Text>
          </TouchableOpacity>

          {/* AI Tutor */}
          <TouchableOpacity style={[styles.card, { backgroundColor: '#E9E2FF', borderColor: '#DCD2FF' }]} onPress={() => navigation.navigate('Chat')}>
            <Text style={styles.cardIcon}>🤖</Text>
            <Text style={styles.cardTitle}>AI Tutor</Text>
            <Text style={styles.cardDesc}>Chat & Learn</Text>
          </TouchableOpacity>

          {/* Compiler */}
          <TouchableOpacity style={[styles.card, { backgroundColor: '#D6E8FF', borderColor: '#CDE0FF' }]} onPress={() => navigation.navigate('Compiler')}>
            <Text style={styles.cardIcon}>⚙️</Text>
            <Text style={styles.cardTitle}>Compiler</Text>
            <Text style={styles.cardDesc}>Run code live</Text>
          </TouchableOpacity>

          {/* Notes Upload */}
          <TouchableOpacity style={[styles.card, { backgroundColor: '#D6E8FF', width: '100%', borderColor: '#CDE0FF' }]} onPress={() => navigation.navigate('NotesUpload')}>
            <Text style={styles.cardIcon}>📂</Text>
            <Text style={styles.cardTitle}>Notes Upload</Text>
            <Text style={styles.cardDesc}>PDF/DOCX/TXT intelligence</Text>
          </TouchableOpacity>

          {/* History Section */}
          <View style={[styles.card, styles.span2, { backgroundColor: '#E9E2FF', marginTop: 10 }]}>
            <Text style={styles.cardTitle}>🕒 Recent History</Text>
            {data.practiceHistory && data.practiceHistory.length > 0 ? (
              data.practiceHistory.slice(0, 5).map((item, index) => (
                <View key={index} style={styles.historyRow}>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historySubject}>{item.subject || 'Practice Test'}</Text>
                    <Text style={styles.historyDate}>{new Date(item.date).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.historyScoreBadge}>
                    <Text style={styles.historyScoreText}>{item.score}%</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyHistoryText}>No recent activities found.</Text>
            )}
          </View>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E6F0FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E6F0FA' },
  
  // Header
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 24, 
    paddingVertical: 16,
    backgroundColor: '#D6E8FF',
    borderBottomWidth: 1,
    borderBottomColor: '#CDE0FF'
  },
  logoText: { fontSize: 22, fontWeight: '800', color: '#1F2937' },
  searchContainer: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#EAF3FF', 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    marginHorizontal: 24,
    height: 40,
    maxWidth: 500,
    borderWidth: 1,
    borderColor: '#CDE0FF'
  },
  searchIcon: { marginRight: 8, fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: '#1F2937' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  streakText: { fontSize: 16, fontWeight: '700', marginRight: 16, color: '#1F2937' },
  profileAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#DFF5EA', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#CDE0FF' },
  avatarText: { color: '#1F2937', fontWeight: 'bold' },

  scrollContent: { padding: 24, backgroundColor: '#E6F0FA' },

  // Hero Card
  heroCard: { 
    flexDirection: 'row', 
    backgroundColor: '#D6E8FF', 
    borderRadius: 24, 
    padding: 32, 
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#CDE0FF'
  },
  heroContent: { flex: 1 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#1F2937', marginBottom: 8 },
  heroSubtitle: { fontSize: 16, color: '#4B5563', marginBottom: 24, lineHeight: 24 },
  heroActions: { flexDirection: 'row', gap: 12 },
  primaryHeroBtn: { backgroundColor: '#CDE0FF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  primaryHeroBtnText: { color: '#1F2937', fontWeight: '700' },
  secondaryHeroBtn: { backgroundColor: '#DFF5EA', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#CDE0FF' },
  secondaryHeroBtnText: { color: '#4B5563', fontWeight: '600' },
  heroIllustration: { fontSize: 64, marginLeft: 20 },

  // Bento Grid
  bentoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  card: { 
    backgroundColor: '#D6E8FF', 
    borderRadius: 24, 
    padding: 24, 
    minWidth: 160, 
    flex: 1,
    borderWidth: 1, 
    borderColor: '#CDE0FF'
  },
  span2: { minWidth: '100%' },
  cardIcon: { fontSize: 28, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#4B5563', marginBottom: 16 },
  cardBtn: { backgroundColor: '#CDE0FF', paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#CDE0FF' },
  cardBtnText: { fontSize: 14, fontWeight: '700', color: '#1F2937' },

  performanceStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 22, fontWeight: '800', color: '#1F2937' },
  statLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: '#E5E7EB' },
  xpBarBg: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, width: 60, marginTop: 8, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: '#DCEBFF' },

  primaryBtn: { backgroundColor: '#D6E8FF', padding: 14, borderRadius: 12 },
  primaryBtnText: { color: '#1F2937', fontWeight: 'bold' },

  // History Row Styles
  historyRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(31, 41, 55, 0.05)' 
  },
  historyInfo: { flex: 1 },
  historySubject: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  historyDate: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  historyScoreBadge: { backgroundColor: '#CDE0FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  historyScoreText: { color: '#1F2937', fontWeight: '800', fontSize: 14 },
  emptyHistoryText: { color: '#6B7280', fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
});

export default DashboardScreen;
