import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';

/**
 * Configures how notifications are handled when the app is foregrounded.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Requests permissions and retrieves the Expo Push Token.
 */
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    // projectId is required for Expo SDK 49+
    const projectId = 
      Constants?.expoConfig?.extra?.eas?.projectId ?? 
      Constants?.easConfig?.projectId;

    try {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Push Token:', token);
    } catch (e) {
      console.error('Error getting push token:', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Saves the push token to the user's profile in Supabase.
 */
export async function savePushToken(userId, token) {
  if (!userId || !token) return;

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ push_token: token })
      .eq('id', userId);

    if (error) throw error;
  } catch (err) {
    console.error('Error saving push token to Supabase:', err.message);
  }
}

/**
 * Logic to notify followers when a new post is created.
 * In a production environment, this should ideally be handled 
 * by a Supabase Edge Function (Webhook).
 * 
 * @param {string} businessId - The ID of the business that posted.
 * @param {string} businessName - The display name of the business.
 */
export async function notifyFollowers(businessId, businessName) {
  try {
    // 1. Find all followers of this business
    const { data: followers, error: followerError } = await supabase
      .from('followers')
      .select('user_id')
      .eq('business_id', businessId);

    if (followerError) throw followerError;
    if (!followers || followers.length === 0) return;

    const userIds = followers.map(f => f.user_id);

    // 2. Get push tokens for those users from profiles table
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('push_token')
      .in('id', userIds)
      .not('push_token', 'is', null);

    if (profileError) throw profileError;
    
    const tokens = profiles.map(p => p.push_token);

    if (tokens.length === 0) return;

    // 3. Send notifications via Expo's push service
    const messages = tokens.map(token => ({
      to: token,
      sound: 'default',
      title: 'New Update!',
      body: `${businessName} just posted a new update!`,
      data: { businessId },
    }));

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

  } catch (err) {
    console.error('Error in notifyFollowers:', err.message);
  }
}
