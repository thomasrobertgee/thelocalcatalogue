import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Linking, 
  Platform,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  BadgeCheck, 
  MapPin, 
  Navigation, 
  ChevronLeft, 
  Share2 
} from 'lucide-react-native';
import FollowButton from '../components/FollowButton';

const { width } = Dimensions.get('window');

/**
 * PostDetail Screen
 * 
 * Displays full post details with a clean, startup aesthetic.
 * Accepts 'post' via navigation params.
 */
const PostDetail = ({ route, navigation }) => {
  const { post } = route.params || {};

  if (!post) return null;

  const { 
    business, 
    image_url, 
    description, 
    product_name, 
    tags = [] 
  } = post;

  const handleGetDirections = () => {
    const address = business?.address || `${business?.business_name}, ${business?.suburb || 'Altona'}`;
    const encodedAddress = encodeURIComponent(address);
    
    const url = Platform.select({
      ios: `maps:0,0?q=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
    });

    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
    });
  };

  const handleTagPress = (tag) => {
    console.log('Tag pressed:', tag);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: image_url || post.imageUri }} 
            style={styles.mainImage} 
            resizeMode="cover"
          />
          {/* Top Navigation Overlay */}
          <SafeAreaView style={styles.navOverlay} edges={['top']}>
            <TouchableOpacity 
              style={styles.iconCircle} 
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle}>
              <Share2 size={20} color="#000" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Content Section */}
        <View style={styles.contentCard}>
          <View style={styles.mainInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.businessName}>{business?.business_name || post.businessName}</Text>
              <BadgeCheck size={20} color="#0095f6" fill="#fff" style={styles.badge} />
            </View>
            
            <Text style={styles.suburbCategory}>
              {business?.suburb || post.location || 'Altona North'} • {business?.category || 'Local Business'}
            </Text>
          </View>

          {/* Caption */}
          <View style={styles.section}>
            {product_name && <Text style={styles.productTitle}>{product_name}</Text>}
            <Text style={styles.descriptionText}>{description}</Text>
          </View>

          {/* Tags Section */}
          {tags && tags.length > 0 && (
            <View style={styles.tagWrapper}>
              {tags.map((tag, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.tagChip}
                  onPress={() => handleTagPress(tag)}
                >
                  <Text style={styles.tagText}>{tag.startsWith('#') ? tag : `#${tag}`}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Interaction Section */}
          <View style={styles.footerActions}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handleGetDirections}
              activeOpacity={0.9}
            >
              <Navigation size={18} color="#fff" style={styles.btnIcon} />
              <Text style={styles.primaryButtonText}>Get Directions</Text>
            </TouchableOpacity>
            
            <View style={styles.followWrapper}>
              <FollowButton businessId={business?.id || post.businessId} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: width,
    height: width,
    backgroundColor: '#E9ECEF',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  navOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentCard: {
    marginTop: -20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    minHeight: 400,
  },
  mainInfo: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  businessName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1D1F',
    letterSpacing: -0.5,
  },
  badge: {
    marginLeft: 6,
  },
  suburbCategory: {
    fontSize: 15,
    color: '#6F767E',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1D1F',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#33383F',
  },
  tagWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 32,
    gap: 8,
  },
  tagChip: {
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  tagText: {
    fontSize: 13,
    color: '#0095f6',
    fontWeight: '600',
  },
  footerActions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#1A1D1F',
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  btnIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  followWrapper: {
    width: '100%',
    height: 56,
  }
});

export default PostDetail;
