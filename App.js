import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Alert, FlatList } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  LayoutGrid, 
  Compass, 
  Search, 
  Plus, 
  User,
  Shield,
  LogOut,
  Trash2,
  Building
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from './supabase';
import { registerForPushNotificationsAsync, savePushToken } from './notifications';
import Constants from 'expo-constants';

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
function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExploreMain" component={ExploreScreen} />
      <Stack.Screen name="PostDetail" component={PostDetail} />
      <Stack.Screen name="BusinessProfile" component={BusinessProfile} />
    </Stack.Navigator>
  );
}

function FeedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FeedMain" component={FeedScreen} />
      <Stack.Screen name="PostDetail" component={PostDetail} />
      <Stack.Screen name="BusinessProfile" component={BusinessProfile} />
    </Stack.Navigator>
  );
}

function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen name="PostDetail" component={PostDetail} />
      <Stack.Screen name="BusinessProfile" component={BusinessProfile} />
    </Stack.Navigator>
  );
}

// Profile Tab Component
function ProfileScreen({ navigation }) {
  const { signOut, user, profile } = useAuth();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFollowing();
  }, []);

  const fetchFollowing = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('followers')
        .select(`
          business_id,
          business:businesses (
            id,
            business_name,
            suburb,
            category
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setFollowing(data || []);
    } catch (err) {
      console.log('Error fetching following:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Remove your profile data?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase.from('profiles').delete().eq('id', user.id);
              if (error) throw error;
              await signOut();
            } catch (err) {
              Alert.alert("Error", err.message);
            }
          }
        }
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.profileHeader}>
        <View style={styles.userIcon}><User size={40} color="#fff" /></View>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <Text style={styles.profileBadge}>{profile?.is_business ? 'Business' : 'User'}</Text>
      </View>

      <View style={styles.followingSection}>
        <View style={styles.sectionHeader}>
          <Building size={18} color="#1A1D1F" />
          <Text style={styles.sectionTitle}>Following ({following.length})</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#1A1D1F" />
        ) : (
          <FlatList
            data={following}
            keyExtractor={(item) => item.business_id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.followingItem}
                onPress={() => navigation.navigate('BusinessProfile', { businessId: item.business_id })}
              >
                <View style={styles.itemLogo}><Text style={styles.itemLogoText}>{item.business?.business_name?.charAt(0)}</Text></View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.business?.business_name}</Text>
                  <Text style={styles.itemMeta}>{item.business?.suburb} • {item.business?.category}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => <Text style={styles.emptyText}>Not following any businesses.</Text>}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <View style={styles.footer}>
        {user?.email === ADMIN_EMAIL && (
          <TouchableOpacity style={styles.adminButton} onPress={() => navigation.navigate('FounderDashboard')}>
            <Shield size={20} color="#fff" /><Text style={styles.adminButtonText}>Founder Dashboard</Text>
          </TouchableOpacity>
        )}
        <View style={styles.footerRow}>
          <TouchableOpacity onPress={signOut} style={styles.footerBtn}><LogOut size={18} color="#6F767E" /><Text style={styles.footerBtnText}>Sign Out</Text></TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteAccount} style={styles.footerBtn}><Trash2 size={18} color="#EB5757" /><Text style={[styles.footerBtnText, { color: '#EB5757' }]}>Delete Data</Text></TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Main Tab Navigator
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let Icon;
          if (route.name === 'My Feed') Icon = LayoutGrid;
          else if (route.name === 'Explore') Icon = Compass;
          else if (route.name === 'Search') Icon = Search;
          else if (route.name === 'Create') Icon = Plus;
          else if (route.name === 'Profile') Icon = User;
          if (!Icon) return null;
          return <Icon color={color} size={size} />;
        },
        tabBarActiveTintColor: '#1A1D1F',
        tabBarInactiveTintColor: '#6F767E',
        tabBarStyle: { paddingBottom: 30, paddingTop: 12, height: 90, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F4F4F4' },
      })}
    >
      <Tab.Screen name="My Feed" component={FeedStack} />
      <Tab.Screen name="Explore" component={ExploreStack} />
      <Tab.Screen name="Search" component={SearchStack} />
      <Tab.Screen name="Create" component={CreatePost} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Root Navigator
function RootNavigator() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (session?.user) {
      const registerAndSaveToken = async (userId) => {
        try {
          const token = await registerForPushNotificationsAsync();
          if (token) await savePushToken(userId, token);
        } catch (e) {
          // Silently fail in Expo Go
        }
      };
      registerAndSaveToken(session.user.id);
    }
  }, [session]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1A1D1F" /></View>;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        <Stack.Screen name="Auth" component={Auth} />
      ) : (
        <Stack.Group>
          <Stack.Screen name="AppTabs" component={AppTabs} />
          <Stack.Screen name="PostDetail" component={PostDetail} />
          <Stack.Screen name="BusinessProfile" component={BusinessProfile} />
          <Stack.Screen name="FounderDashboard" component={FounderDashboard} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}

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
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  profileHeader: { alignItems: 'center', paddingVertical: 32, borderBottomWidth: 1, borderBottomColor: '#F4F4F4' },
  userIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1A1D1F', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  profileEmail: { fontSize: 18, fontWeight: '700', color: '#1A1D1F' },
  profileBadge: { fontSize: 12, fontWeight: '600', color: '#6F767E', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  followingSection: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1D1F' },
  followingItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: '#F8F9FA', padding: 12, borderRadius: 16 },
  itemLogo: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1D1F', justifyContent: 'center', alignItems: 'center' },
  itemLogoText: { color: '#fff', fontWeight: 'bold' },
  itemInfo: { marginLeft: 12 },
  itemName: { fontSize: 15, fontWeight: '700', color: '#1A1D1F' },
  itemMeta: { fontSize: 12, color: '#6F767E', marginTop: 2 },
  emptyText: { color: '#6F767E', textAlign: 'center', marginTop: 20 },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#F4F4F4' },
  adminButton: { flexDirection: 'row', backgroundColor: '#1A1D1F', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 20, justifyContent: 'center', gap: 10 },
  adminButtonText: { color: '#fff', fontWeight: '700' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-around' },
  footerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerBtnText: { fontSize: 14, fontWeight: '600', color: '#6F767E' }
});
