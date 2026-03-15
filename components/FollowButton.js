import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert, View } from 'react-native';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthProvider';

/**
 * FollowButton component for real-time following logic.
 */
const FollowButton = ({ businessId }) => {
  const { user, profile } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const checkFollowStatus = useCallback(async () => {
    if (!businessId || !user) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('followers')
        .select('*')
        .eq('user_id', user.id)
        .eq('business_id', businessId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking follow status:', error.message);
      }

      setIsFollowing(!!data);
    } catch (err) {
      console.error('Unexpected error checking follow status:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId, user]);

  useEffect(() => {
    checkFollowStatus();
  }, [checkFollowStatus]);

  const handleToggleFollow = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to follow businesses.');
      return;
    }

    if (!profile) {
      Alert.alert('Profile Missing', 'Your user profile was not found. Try signing out and back in to sync your account.');
      console.error('Follow error: User has session but no row in profiles table. ID:', user.id);
      return;
    }

    setActionLoading(true);

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('user_id', user.id)
          .eq('business_id', businessId);

        if (error) throw error;
        setIsFollowing(false);
      } else {
        console.log(`Attempting follow: User ${user.id} -> Business ${businessId}`);
        const { error } = await supabase
          .from('followers')
          .insert([{ user_id: user.id, business_id: businessId }]);

        if (error) {
          if (error.code === '23503') {
            throw new Error('Database Error: Your profile is not correctly synced. Please contact support.');
          }
          throw error;
        }
        setIsFollowing(true);
      }
    } catch (err) {
      Alert.alert('Action Failed', err.message);
      console.error('Toggle follow error details:', err);
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
