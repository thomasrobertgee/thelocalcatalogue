import React from 'react';
import { StyleSheet, FlatList, View, SafeAreaView } from 'react-native';
import FeedCard from '../components/FeedCard';

const DUMMY_DATA = [
  {
    id: '1',
    businessName: 'The Local Coffee',
    location: 'Downtown, London',
    imageUri: 'https://picsum.photos/id/1060/600/600',
    description: 'Freshly roasted beans every morning. Come try our new seasonal blend! ☕️ #localcoffee #londonlife',
  },
  {
    id: '2',
    businessName: 'Artisan Bakery',
    location: 'Shoreditch, London',
    imageUri: 'https://picsum.photos/id/429/600/600',
    description: 'Our sourdough is finally back in stock! Limited quantities available daily. 🥐 #bakery #shoreditch',
  },
  {
    id: '3',
    businessName: 'Greenery Florals',
    location: 'Richmond, London',
    imageUri: 'https://picsum.photos/id/117/600/600',
    description: 'New arrivals from the flower market this morning. Bring some color to your home! 🌸 #flowers #londonflorist',
  },
  {
    id: '4',
    businessName: 'Vintage Treasures',
    location: 'Notting Hill, London',
    imageUri: 'https://picsum.photos/id/445/600/600',
    description: 'Curated vintage finds for your unique style. Open until 6 PM today! ✨ #vintage #nottinghill',
  },
];

const FeedScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={DUMMY_DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FeedCard
            businessName={item.businessName}
            location={item.location}
            imageUri={item.imageUri}
            description={item.description}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default FeedScreen;
