import React, { useState, useCallback, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Image, 
  Dimensions, 
  Pressable 
} from 'react-native';
import { FlashList } from "@shopify/flash-list";
import { Heart } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay, 
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import { 
  GestureHandlerRootView, 
  TapGestureHandler, 
  State 
} from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');
const ALBUM_HEIGHT = width; // Square aspect ratio

/**
 * PostAlbum Component
 * 
 * Handles multi-photo swiping with pagination dots and double-tap-to-like.
 */
const PostAlbum = ({ images = [], onLike, onPress }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scale = useSharedValue(0);

  const doubleTapRef = useRef(null);

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: Math.max(scale.value, 0) }],
    opacity: scale.value > 0 ? 1 : 0,
  }));

  const handleDoubleTap = () => {
    scale.value = withSequence(
      withSpring(1.2),
      withDelay(500, withSpring(0))
    );
    if (onLike) runOnJS(onLike)();
  };

  const onScroll = useCallback((event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== currentIndex) {
      setCurrentIndex(roundIndex);
    }
  }, [currentIndex]);

  const renderItem = ({ item }) => (
    <TapGestureHandler
      waitFor={doubleTapRef}
      onHandlerStateChange={({ nativeEvent }) => {
        if (nativeEvent.state === State.ACTIVE && onPress) {
          onPress();
        }
      }}
    >
      <View>
        <TapGestureHandler
          ref={doubleTapRef}
          numberOfTaps={2}
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.ACTIVE) {
              handleDoubleTap();
            }
          }}
        >
          <Animated.View style={styles.imageContainer}>
            <Image 
              source={{ uri: typeof item === 'string' ? item : item.image_url }} 
              style={styles.image} 
              resizeMode="cover"
            />
            {/* Overlay Heart Animation */}
            <View style={StyleSheet.absoluteFill}>
              <View style={styles.centeredHeart}>
                <Animated.View style={animatedHeartStyle}>
                  <Heart size={80} color="#fff" fill="#fff" />
                </Animated.View>
              </View>
            </View>
          </Animated.View>
        </TapGestureHandler>
      </View>
    </TapGestureHandler>
  );

  if (!images || images.length === 0) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
      <FlashList
        data={images}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        estimatedItemSize={width}
        keyExtractor={(item, index) => index.toString()}
      />

      {/* Pagination Dots */}
      {images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                currentIndex === index ? styles.activeDot : styles.inactiveDot
              ]} 
            />
          ))}
        </View>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: ALBUM_HEIGHT,
    backgroundColor: '#F4F4F4',
  },
  imageContainer: {
    width: width,
    height: ALBUM_HEIGHT,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  centeredHeart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    backgroundColor: '#0095f6',
    width: 12, // Slightly elongated for active state
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  }
});

export default PostAlbum;
