import React from 'react';
import { StyleSheet, FlatList, View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeedCard from '../components/FeedCard';
import { useMyFeed } from '../hooks/useMyFeed';

const FeedScreen = ({ navigation }) => {
  const { posts, loading, error, refresh } = useMyFeed();

  if (loading && posts.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#1A1D1F" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Feed</Text>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <FeedCard
            businessName={item.business?.business_name}
            location={item.business?.suburb}
            imageUri={item.image_url}
            description={item.description}
            onPress={() => navigation.navigate('PostDetail', { post: item })}
          />
        )}
        onRefresh={refresh}
        refreshing={loading}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Following businesses to see their updates here!</Text>
          </View>
        )}
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
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1D1F',
    letterSpacing: -0.5,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6F767E',
    fontSize: 16,
    lineHeight: 24,
  }
});

export default FeedScreen;
