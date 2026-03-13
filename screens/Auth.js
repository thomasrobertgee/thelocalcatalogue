import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Checkbox from 'expo-checkbox';
import { supabase } from '../supabase';
import { Mail, Lock, User, LayoutGrid } from 'lucide-react-native';

const Auth = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBusiness, setIsBusiness] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // 1. Sign Up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          // 2. Create Profile row
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: signUpData.user.id, 
                is_business: isBusiness,
                created_at: new Date().toISOString()
              }
            ]);

          if (profileError) throw profileError;
          Alert.alert('Success', 'Account created! Please check your email for verification.');
        }
      } else {
        // 1. Login
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        // Navigation will be handled by the onAuthStateChange listener in App.js
      }
    } catch (error) {
      Alert.alert('Authentication Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo/Branding */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <LayoutGrid size={40} color="#fff" />
            </View>
            <Text style={styles.title}>The Local Catalogue</Text>
            <Text style={styles.subtitle}>Discover what's around you.</Text>
          </View>

          {/* Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleBtn, !isSignUp && styles.activeToggle]} 
              onPress={() => setIsSignUp(false)}
            >
              <Text style={[styles.toggleText, !isSignUp && styles.activeToggleText]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, isSignUp && styles.activeToggle]} 
              onPress={() => setIsSignUp(true)}
            >
              <Text style={[styles.toggleText, isSignUp && styles.activeToggleText]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#6F767E" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="name@example.com"
                  placeholderTextColor="#6F767E"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#6F767E" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="••••••••"
                  placeholderTextColor="#6F767E"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {isSignUp && (
              <View style={styles.checkboxContainer}>
                <Checkbox
                  style={styles.checkbox}
                  value={isBusiness}
                  onValueChange={setIsBusiness}
                  color={isBusiness ? '#1A1D1F' : undefined}
                />
                <Text style={styles.checkboxLabel}>Are you a local business?</Text>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.primaryButton, loading && styles.disabledBtn]} 
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#1A1D1F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1D1F',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6F767E',
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F4F4F4',
    borderRadius: 16,
    padding: 4,
    marginBottom: 32,
  },
  toggleBtn: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  activeToggle: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6F767E',
  },
  activeToggleText: {
    color: '#1A1D1F',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1D1F',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1D1F',
    fontWeight: '500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  checkbox: {
    marginRight: 12,
    borderRadius: 4,
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#33383F',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#1A1D1F',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.7,
  }
});

export default Auth;
