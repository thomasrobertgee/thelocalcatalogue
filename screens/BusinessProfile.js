import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Linking, 
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MasonryFlashList } from "@shopify/flash-list";
import { 
  MapPin, 
  MessageCircle, 
  ChevronLeft, 
  MoreHorizontal,
  Award
} from 'lucide-react-native';
import { supabase } from '../supabase';
import FollowButton from '../components/FollowButton';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 3;

/**
 * BusinessProfile Screen
 * 
 * Displays full business details, stats, and a 3-column grid of their posts.
 */
const BusinessProfile = ({ route, navigation }) => {
  const { businessId } = route.params || {};
  
  const [business, setBusiness] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ posts: 0, followers: 0, rank: '#1' });
  const [loading, setLoading] = useState(true);

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch Business Details
      const { data: bizData, error: bizError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (bizError) throw bizError;
      setBusiness(bizData);

      // 2. Fetch Business Posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);

      // 3. Fetch Follower Count
      const { count: followerCount, error: countError } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId);

      if (countError) throw countError;

      setStats({
        posts: postsData?.length || 0,
        followers: followerCount || 0,
        rank: '#1 Local' // Dummy stat
      });

    } catch (err) {
      console.error('Error fetching profile:', err.message);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleOpenMaps = () => {
    const address = business?.address || `${business?.business_name}, ${business?.suburb}`;
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`
    });
    Linking.openURL(url);
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Profile Top */}
      <View style={styles.profileTop}>
        <Image 
          source={{ uri: business?.logo_url || 'https://via.placeholder.com/100' }} 
          style={styles.logo} 
        />
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.rank}</Text>
            <Text style={styles.statLabel}>Rank</Text>
          </View>
        </View>
      </View>

      {/* Business Identity */}
      <View style={styles.identitySection}>
        <Text style={styles.businessName}>{business?.business_name}</Text>
        <Text style={styles.categoryText}>{business?.category || 'Local Business'}</Text>
        <Text style={styles.bioText}>{business?.bio || 'Serving the local community with quality products and friendly service.'}</Text>
        
        <TouchableOpacity onPress={handleOpenMaps} style={styles.addressRow}>
          <MapPin size={14} color="#0095f6" />
          <Text style={styles.addressText}>{business?.suburb || 'Altona North'}</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <View style={styles.followBtnWrapper}>
          <FollowButton businessId={businessId} />
        </View>
        <TouchableOpacity style={styles.messageButton}>
          <MessageCircle size={20} color="#1A1D1F" />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPostItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.postItem}
      onPress={() => navigation.navigate('PostDetail', { post: { ...item, business } })}
    >
      <Image 
        source={{ uri: item.image_url }} 
        style={styles.postThumbnail} 
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#1A1D1F" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={28} color="#1A1D1F" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{business?.business_name}</Text>
        <TouchableOpacity>
          <MoreHorizontal size={24} color="#1A1D1F" />
        </TouchableOpacity>
      </View>

      <MasonryFlashList
        data={posts}
        numColumns={3}
        renderItem={renderPostItem}
        estimatedItemSize={150}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id.toString()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F4',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D1F',
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#F4F4F4',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1D1F',
  },
  statLabel: {
    fontSize: 12,
    color: '#6F767E',
    marginTop: 2,
  },
  identitySection: {
    marginBottom: 20,
  },
  businessName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1D1F',
    letterSpacing: -0.5,
  },
  categoryText: {
    fontSize: 14,
    color: '#6F767E',
    fontWeight: '600',
    marginTop: 2,
  },
  bioText: {
    fontSize: 15,
    color: '#33383F',
    lineHeight: 22,
    marginTop: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#0095f6',
    fontWeight: '600',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  followBtnWrapper: {
    flex: 1,
    height: 44,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    height: 44,
  },
  messageButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1D1F',
  },
  listContent: {
    paddingBottom: 40,
  },
  postItem: {
    padding: 1,
  },
  postThumbnail: {
    width: width / 3 - 2,
    height: width / 3 - 2,
    backgroundColor: '#F4F4F4',
  },
});

export default BusinessProfile;
