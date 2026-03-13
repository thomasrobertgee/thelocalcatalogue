import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Image, 
  TouchableOpacity, 
  Modal, 
  Text, 
  Dimensions, 
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const EXPLORE_DATA = [
  { id: '1', businessName: 'The Local Coffee', productName: 'Cappuccino Art', imageUri: 'https://picsum.photos/id/102/400/600' },
  { id: '2', businessName: 'Artisan Bakery', productName: 'Sourdough Loaf', imageUri: 'https://picsum.photos/id/101/400/400' },
  { id: '3', businessName: 'Greenery Florals', productName: 'Rose Bouquet', imageUri: 'https://picsum.photos/id/100/400/500' },
  { id: '4', businessName: 'Vintage Treasures', productName: 'Classic Camera', imageUri: 'https://picsum.photos/id/111/400/450' },
  { id: '5', businessName: 'The Local Coffee', productName: 'Iced Latte', imageUri: 'https://picsum.photos/id/112/400/550' },
  { id: '6', businessName: 'Artisan Bakery', productName: 'Blueberry Muffin', imageUri: 'https://picsum.photos/id/113/400/400' },
  { id: '7', businessName: 'Greenery Florals', productName: 'Succulent Pot', imageUri: 'https://picsum.photos/id/114/400/500' },
  { id: '8', businessName: 'Vintage Treasures', productName: 'Vinyl Record', imageUri: 'https://picsum.photos/id/115/400/450' },
  { id: '9', businessName: 'The Local Coffee', productName: 'Espresso', imageUri: 'https://picsum.photos/id/116/400/550' },
  { id: '10', businessName: 'Artisan Bakery', productName: 'Crossant', imageUri: 'https://picsum.photos/id/118/400/400' },
];

const ExploreScreen = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.itemContainer} 
      onPress={() => handlePress(item)}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: item.imageUri }} 
        style={styles.image} 
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={EXPLORE_DATA}
        numColumns={2}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setModalVisible(false)}
            >
              <X size={24} color="#000" />
            </TouchableOpacity>
            
            {selectedItem && (
              <View>
                <Image 
                  source={{ uri: selectedItem.imageUri }} 
                  style={styles.modalImage} 
                  resizeMode="cover"
                />
                <View style={styles.modalTextContainer}>
                  <Text style={styles.productName}>{selectedItem.productName}</Text>
                  <Text style={styles.businessName}>{selectedItem.businessName}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 8,
  },
  itemContainer: {
    flex: 0.5,
    padding: 4,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 4,
  },
  modalImage: {
    width: '100%',
    height: 300,
  },
  modalTextContainer: {
    padding: 20,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 16,
    color: '#666',
  },
});

export default ExploreScreen;
