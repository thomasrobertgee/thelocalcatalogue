import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  Dimensions,
  Image
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
  RefreshCcw
} from 'lucide-react-native';
import { supabase } from '../supabase';

const { width } = Dimensions.get('window');

/**
 * FounderDashboard Screen
 * 
 * Internal admin dashboard with dark mode aesthetic.
 */
const FounderDashboard = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
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

      // 1. Fetch Counts in Parallel
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

      // 2. Fetch Top 5 Most Followed Businesses
      // Note: In a production app, this would be a specialized RPC or view.
      // For now, we'll fetch businesses and join count manually or via a clever query.
      const { data: trendingData, error: trendError } = await supabase
        .from('businesses')
        .select(`
          id,
          business_name,
          logo_url,
          followers:followers(count)
        `)
        .limit(10); // Fetch some to sort manually since Supabase doesn't sort by aggregated count easily in basic select

      if (!trendError) {
        const sorted = trendingData
          .map(b => ({ ...b, followCount: b.followers[0]?.count || 0 }))
          .sort((a, b) => b.followCount - a.followCount)
          .slice(0, 5);
        setTopBusinesses(sorted);
      }

      // 3. Recent Activity (Sign-ups)
      const { data: signupData, error: signupError } = await supabase
        .from('profiles')
        .select('email, is_business, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!signupError) setRecentSignups(signupData);

    } catch (err) {
      console.error('Founder Dashboard Fetch Error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <View style={styles.statCard}>
      <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0095f6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard title="Total Locals" value={stats.totalLocals} icon={Users} color="#0095f6" />
          <StatCard title="Total Shops" value={stats.totalShops} icon={Store} color="#3ECF8E" />
          <StatCard title="Engagement" value={stats.engagement} icon={Heart} color="#EB5757" />
          <StatCard title="New Posts (7d)" value={stats.recentPosts} icon={ImageIcon} color="#F2C94C" />
        </View>

        {/* Trending Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={18} color="#0095f6" />
            <Text style={styles.sectionTitle}>Top 5 Most Followed</Text>
          </View>
          <View style={styles.listCard}>
            {topBusinesses.map((biz, index) => (
              <View key={biz.id} style={[styles.listItem, index === 4 && { borderBottomWidth: 0 }]}>
                <Image source={{ uri: biz.logo_url }} style={styles.listImage} />
                <View style={styles.listInfo}>
                  <Text style={styles.listName}>{biz.business_name}</Text>
                  <Text style={styles.listMeta}>{biz.followCount} followers</Text>
                </View>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={18} color="#3ECF8E" />
            <Text style={styles.sectionTitle}>Recent Sign-ups</Text>
          </View>
          <View style={styles.listCard}>
            {recentSignups.map((user, index) => (
              <View key={index} style={[styles.listItem, index === 4 && { borderBottomWidth: 0 }]}>
                <View style={styles.listInfo}>
                  <Text style={styles.listName}>{user.email.split('@')[0]}</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#0F1113', // Deep obsidian
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F1113',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1D1F',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrollContent: {
    padding: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#1A1D1F',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2F33',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statTitle: {
    color: '#6F767E',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  listCard: {
    backgroundColor: '#1A1D1F',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2F33',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2F33',
  },
  listImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2A2F33',
  },
  listInfo: {
    flex: 1,
    marginLeft: 12,
  },
  listName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  listMeta: {
    color: '#6F767E',
    fontSize: 12,
    marginTop: 2,
  },
  rankBadge: {
    backgroundColor: '#2A2F33',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rankText: {
    color: '#0095f6',
    fontSize: 12,
    fontWeight: '800',
  },
});

export default FounderDashboard;
