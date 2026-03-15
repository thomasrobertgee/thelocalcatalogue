import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { supabase } from './supabase';

const isExpoGo = Constants.appOwnership === 'expo';

/**
 * All notification logic is wrapped in an async loader 
 * to prevent top-level 'expo-notifications' imports from
 * crashing Expo Go (SDK 53+).
 */

export async function registerForPushNotificationsAsync() {
  if (isExpoGo || !Device.isDevice) return null;

  // Dynamic import to hide from Expo Go
  const Notifications = await import('expo-notifications');

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  if (!projectId) return null;

  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    return token;
  } catch (e) {
    return null;
  }
}

export async function savePushToken(userId, token) {
  if (!userId || !token) return;
  try {
    await supabase.from('profiles').update({ push_token: token }).eq('id', userId);
  } catch (err) {
    console.log('Error saving push token:', err.message);
  }
}

export async function notifyFollowers(businessId, businessName) {
  try {
    const { data: followers } = await supabase.from('followers').select('user_id').eq('business_id', businessId);
    if (!followers || followers.length === 0) return;

    const userIds = followers.map(f => f.user_id);
    const { data: profiles } = await supabase.from('profiles').select('push_token').in('id', userIds).not('push_token', 'is', null);
    if (!profiles || profiles.length === 0) return;

    const tokens = profiles.map(p => p.push_token);
    const messages = tokens.map(token => ({
      to: token,
      sound: 'default',
      title: 'New Update!',
      body: `${businessName} just posted a new update!`,
      data: { businessId },
    }));

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Accept-encoding': 'gzip, deflate', 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });
  } catch (err) {
    console.log('Error in notifyFollowers:', err.message);
  }
}
