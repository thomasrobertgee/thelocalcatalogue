import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../supabase';

/**
 * FollowButton component for real-time following logic.
 * 
 * @param {string} businessId - The ID of the business to follow/unfollow.
 */
const FollowButton = ({ businessId }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const checkFollowStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('followers')
        .select('*')
        .eq('user_id', user.id)
        .eq('business_id', businessId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking follow status:', error.message);
      }

      setIsFollowing(!!data);
    } catch (err) {
      console.error('Unexpected error checking follow status:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    checkFollowStatus();
  }, [checkFollowStatus]);

  const handleToggleFollow = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to follow businesses.');
      return;
    }

    setActionLoading(true);

    try {
      if (isFollowing) {
        // Unfollow: Delete record
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('user_id', user.id)
          .eq('business_id', businessId);

        if (error) throw error;
        setIsFollowing(false);
      } else {
        // Follow: Insert record
        const { error } = await supabase
          .from('followers')
          .insert([{ user_id: user.id, business_id: businessId }]);

        if (error) throw error;
        setIsFollowing(true);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not update follow status. Please try again.');
      console.error('Toggle follow error:', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#0095f6" />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isFollowing ? styles.followingButton : styles.followButton
      ]}
      onPress={handleToggleFollow}
      disabled={actionLoading}
    >
      {actionLoading ? (
        <ActivityIndicator size="small" color={isFollowing ? "#000" : "#fff"} />
      ) : (
        <Text style={[
          styles.buttonText,
          isFollowing ? styles.followingText : styles.followText
        ]}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButton: {
    backgroundColor: '#0095f6',
    borderColor: '#0095f6',
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderColor: '#dbdbdb',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  followText: {
    color: '#fff',
  },
  followingText: {
    color: '#000',
  },
  loadingContainer: {
    width: 100,
    alignItems: 'center',
  }
});

export default FollowButton;
