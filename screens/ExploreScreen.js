import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Image, 
  Pressable, 
  Text, 
  Dimensions, 
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from "@shopify/flash-list";
import { getExplorePosts } from '../supabase';

const { width } = Dimensions.get('window');

const ExploreScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const data = await getExplorePosts();
      setPosts(data || []);
    } catch (err) {
      console.error('Explore fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const renderItem = ({ item }) => (
    <Pressable 
      style={styles.itemContainer} 
      onPress={() => navigation.navigate('PostDetail', { post: item })}
    >
      <View style={styles.card}>
        <Image 
          source={{ uri: item.image_url }} 
          style={styles.image} 
          resizeMode="cover"
        />
        <View style={styles.infoOverlay}>
          <Text style={styles.businessName} numberOfLines={1}>
            {item.caption?.substring(0, 20) || 'Local update'}
          </Text>
          <Text style={styles.suburbText} numberOfLines={1}>
            {item.business?.business_name} • {item.business?.suburb}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1A1D1F" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>
      <FlashList
        data={posts}
        numColumns={2}
        renderItem={renderItem}
        estimatedItemSize={200}
        onRefresh={onRefresh}
        refreshing={refreshing}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        keyExtractor={(item) => item.id.toString()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1A1D1F' },
  listContainer: { paddingHorizontal: 8, paddingBottom: 20 },
  itemContainer: { flex: 1, padding: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#F4F4F4' },
  image: { width: '100%', aspectRatio: 1, backgroundColor: '#F4F4F4' },
  infoOverlay: { padding: 10, backgroundColor: 'rgba(255, 255, 255, 0.95)' },
  businessName: { fontSize: 13, fontWeight: '700', color: '#1A1D1F' },
  suburbText: { fontSize: 11, color: '#6F767E', fontWeight: '500', marginTop: 2 },
});

export default ExploreScreen;
