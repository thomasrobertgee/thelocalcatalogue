import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  LayoutGrid, 
  Compass, 
  Search as SearchIcon, 
  PlusSquare, 
  User,
  ShieldCheck
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from './supabase';
import { registerForPushNotificationsAsync, savePushToken } from './notifications';
import * as Notifications from 'expo-notifications';

// Auth
import { AuthProvider, useAuth } from './context/AuthProvider';

// Import screens
import Auth from './screens/Auth';
import FeedScreen from './screens/FeedScreen';
import ExploreScreen from './screens/ExploreScreen';
import SearchScreen from './screens/SearchScreen';
import CreatePost from './screens/CreatePost';
import PostDetail from './screens/PostDetail';
import BusinessProfile from './screens/BusinessProfile';
import FounderDashboard from './screens/FounderDashboard';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ADMIN_EMAIL = 'thomasrobertgee@gmail.com';

// Sub-stacks
const ExploreStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ExploreMain" component={ExploreScreen} />
    <Stack.Screen name="PostDetail" component={PostDetail} />
    <Stack.Screen name="BusinessProfile" component={BusinessProfile} />
  </Stack.Navigator>
);

const FeedStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FeedMain" component={FeedScreen} />
    <Stack.Screen name="PostDetail" component={PostDetail} />
    <Stack.Screen name="BusinessProfile" component={BusinessProfile} />
  </Stack.Navigator>
);

const SearchStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SearchMain" component={SearchScreen} />
    <Stack.Screen name="PostDetail" component={PostDetail} />
    <Stack.Screen name="BusinessProfile" component={BusinessProfile} />
  </Stack.Navigator>
);

const AppTabs = ({ navigation }) => {
  const { signOut, user } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let IconComponent;
          switch (route.name) {
            case 'My Feed': IconComponent = LayoutGrid; break;
            case 'Explore': IconComponent = Compass; break;
            case 'Search': IconComponent = SearchIcon; break;
            case 'Create': IconComponent = PlusSquare; break;
            case 'Profile': IconComponent = User; break;
            default: IconComponent = LayoutGrid;
          }
          return <IconComponent color={color} size={size} />;
        },
        tabBarActiveTintColor: '#1A1D1F',
        tabBarInactiveTintColor: '#6F767E',
        tabBarStyle: {
          paddingBottom: 30,
          paddingTop: 12,
          height: 90,
          borderTopWidth: 1,
          borderTopColor: '#F4F4F4',
          backgroundColor: '#fff',
        },
      })}
    >
      <Tab.Screen name="My Feed" component={FeedStack} />
      <Tab.Screen name="Explore" component={ExploreStack} />
      <Tab.Screen name="Search" component={SearchStack} />
      <Tab.Screen name="Create" component={CreatePost} />
      <Tab.Screen 
        name="Profile" 
        component={() => (
          <View style={styles.center}>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            {user?.email === ADMIN_EMAIL && (
              <TouchableOpacity 
                style={styles.adminButton}
                onPress={() => navigation.navigate('FounderDashboard')}
              >
                <ShieldCheck size={20} color="#fff" />
                <Text style={styles.adminButtonText}>Founder Dashboard</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )} 
      />
    </Tab.Navigator>
  );
};

const RootNavigator = () => {
  const { session, loading, user } = useAuth();

  useEffect(() => {
    if (session?.user) {
      registerAndSaveToken(session.user.id);
    }

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification Tapped:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, [session]);

  const registerAndSaveToken = async (userId) => {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      await savePushToken(userId, token);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1A1D1F" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <>
          <Stack.Screen name="AppTabs" component={AppTabs} />
          <Stack.Screen name="FounderDashboard" component={FounderDashboard} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={Auth} />
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 24 },
  profileEmail: { fontSize: 16, color: '#6F767E', marginBottom: 32, fontWeight: '500' },
  adminButton: { flexDirection: 'row', backgroundColor: '#1A1D1F', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16, alignItems: 'center', marginBottom: 16, width: '100%', justifyContent: 'center', gap: 10 },
  adminButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  signOutButton: { paddingVertical: 16, width: '100%', alignItems: 'center' },
  signOutText: { color: '#EB5757', fontWeight: '700', fontSize: 16 }
});
