import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  Dimensions,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Users, 
  Store, 
  Heart, 
  Image as ImageIcon, 
  TrendingUp, 
  Clock, 
  ChevronLeft,
  RefreshCcw,
  Database
} from 'lucide-react-native';
import { supabase } from '../supabase';
import { seedDatabase } from '../seedData';

const { width } = Dimensions.get('window');

const FounderDashboard = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [stats, setStats] = useState({
    totalLocals: 0,
    totalShops: 0,
    engagement: 0,
    recentPosts: 0
  });
  const [topBusinesses, setTopBusinesses] = useState([]);
  const [recentSignups, setRecentSignups] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const [
        { count: localsCount },
        { count: shopsCount },
        { count: followCount },
        { count: postsCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_business', false),
        supabase.from('businesses').select('*', { count: 'exact', head: true }),
        supabase.from('followers').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }).gte('created_at', lastWeek.toISOString())
      ]);

      setStats({
        totalLocals: localsCount || 0,
        totalShops: shopsCount || 0,
        engagement: followCount || 0,
        recentPosts: postsCount || 0
      });

      const { data: trendingData, error: trendError } = await supabase
        .from('businesses')
        .select(`
          id,
          business_name,
          followers:followers(count)
        `)
        .limit(10);

      if (!trendError) {
        const sorted = trendingData
          .map(b => ({ ...b, followCount: b.followers[0]?.count || 0 }))
          .sort((a, b) => b.followCount - a.followCount)
          .slice(0, 5);
        setTopBusinesses(sorted);
      }

      const { data: signupData, error: signupError } = await supabase
        .from('profiles')
        .select('email, is_business, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!signupError) setRecentSignups(signupData);

    } catch (err) {
      console.error('Founder Dashboard Error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleSeed = async () => {
    Alert.alert(
      "Seed Database",
      "Add 5 businesses and 15 posts for testing?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Seed", 
          onPress: async () => {
            setSeeding(true);
            const result = await seedDatabase();
            setSeeding(false);
            if (result.success) {
              Alert.alert("Success", "Data created!");
              fetchDashboardData();
            } else {
              Alert.alert("Error", result.error);
            }
          }
        }
      ]
    );
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <View style={styles.statCard}>
      <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  if (loading && !seeding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0095f6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Founder Dashboard</Text>
        <TouchableOpacity onPress={fetchDashboardData}>
          <RefreshCcw size={20} color="#6F767E" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <StatCard title="Total Locals" value={stats.totalLocals} icon={Users} color="#0095f6" />
          <StatCard title="Total Shops" value={stats.totalShops} icon={Store} color="#3ECF8E" />
          <StatCard title="Engagement" value={stats.engagement} icon={Heart} color="#EB5757" />
          <StatCard title="New Posts" value={stats.recentPosts} icon={ImageIcon} color="#F2C94C" />
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.seedButton, seeding && { opacity: 0.7 }]} 
            onPress={handleSeed}
            disabled={seeding}
          >
            {seeding ? <ActivityIndicator color="#fff" /> : 
            <><Database size={18} color="#fff" style={{ marginRight: 10 }} /><Text style={styles.seedButtonText}>Seed Database</Text></>}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={18} color="#0095f6" />
            <Text style={styles.sectionTitle}>Top 5 Most Followed</Text>
          </View>
          <View style={styles.listCard}>
            {topBusinesses.map((biz, index) => (
              <View key={biz.id} style={[styles.listItem, index === 4 && { borderBottomWidth: 0 }]}>
                <View style={[styles.listImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#2A2F33' }]}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>{biz.business_name?.charAt(0)}</Text>
                </View>
                <View style={styles.listInfo}>
                  <Text style={styles.listName}>{biz.business_name}</Text>
                  <Text style={styles.listMeta}>{biz.followCount} followers</Text>
                </View>
                <View style={styles.rankBadge}><Text style={styles.rankText}>#{index + 1}</Text></View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={18} color="#3ECF8E" />
            <Text style={styles.sectionTitle}>Recent Sign-ups</Text>
          </View>
          <View style={styles.listCard}>
            {recentSignups.map((user, index) => (
              <View key={index} style={[styles.listItem, index === 4 && { borderBottomWidth: 0 }]}>
                <View style={styles.listInfo}>
                  <Text style={styles.listName}>{user.email?.split('@')[0] || 'User'}</Text>
                  <Text style={styles.listMeta}>
                    {user.is_business ? 'Business' : 'Regular User'} • {new Date(user.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1113' },
  loadingContainer: { flex: 1, backgroundColor: '#0F1113', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#1A1D1F' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 24 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: (width - 60) / 2, backgroundColor: '#1A1D1F', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#2A2F33' },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  statValue: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  statTitle: { color: '#6F767E', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  listCard: { backgroundColor: '#1A1D1F', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#2A2F33' },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2A2F33' },
  listImage: { width: 40, height: 40, borderRadius: 10 },
  listInfo: { flex: 1, marginLeft: 12 },
  listName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  listMeta: { color: '#6F767E', fontSize: 12, marginTop: 2 },
  rankBadge: { backgroundColor: '#2A2F33', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  rankText: { color: '#0095f6', fontSize: 12, fontWeight: '800' },
  seedButton: { backgroundColor: '#3ECF8E', height: 50, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  seedButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 }
});

export default FounderDashboard;
