import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Heart, MessageCircle, Send, MoreVertical } from 'lucide-react-native';

const FeedCard = ({ businessName, location, imageUri, caption, hideFollow }) => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatarPlaceholder, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1D1F' }]}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{businessName?.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.businessName}>{businessName}</Text>
            <View style={styles.locationContainer}>
              <MapPin size={12} color="gray" />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          </View>
        </View>
        {!hideFollow && (
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Image */}
      <Image source={{ uri: imageUri }} style={styles.image} />

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <Heart size={24} color="#000" style={styles.actionIcon} />
          <MessageCircle size={24} color="#000" style={styles.actionIcon} />
          <Send size={24} color="#000" style={styles.actionIcon} />
        </View>
        <MoreVertical size={24} color="#000" />
      </View>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          <Text style={styles.businessNameInline}>{businessName} </Text>
          {caption}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  businessName: {
    fontWeight: '700',
    fontSize: 14,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: 'gray',
    marginLeft: 2,
  },
  followButton: {
    backgroundColor: '#0095f6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  followButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#eee',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  actionsLeft: {
    flexDirection: 'row',
  },
  actionIcon: {
    marginRight: 16,
  },
  descriptionContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  businessNameInline: {
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
  },
});

export default FeedCard;
