import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ActivityIndicator, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, XCircle, RefreshCw, Database, Sparkles } from 'lucide-react-native';
import { supabase } from '../supabase';
import { pingGemini } from '../gemini';

/**
 * ConnectionTest Screen
 * 
 * Diagnostic dashboard to verify Supabase and Gemini setup.
 */
const ConnectionTest = () => {
  const [supabaseStatus, setSupabaseStatus] = useState('testing'); // 'testing', 'success', 'error'
  const [supabaseError, setSupabaseError] = useState(null);
  
  const [geminiStatus, setGeminiStatus] = useState('testing'); // 'testing', 'success', 'error'
  const [geminiError, setGeminiError] = useState(null);

  const testSupabase = async () => {
    setSupabaseStatus('testing');
    setSupabaseError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (error) throw error;
      setSupabaseStatus('success');
    } catch (error) {
      setSupabaseStatus('error');
      setSupabaseError(error.message || 'Unknown Supabase error');
    }
  };

  const testGemini = async () => {
    setGeminiStatus('testing');
    setGeminiError(null);
    
    // 1. Check if API Key exists
    if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
      setGeminiStatus('error');
      setGeminiError('EXPO_PUBLIC_GEMINI_API_KEY is missing from .env');
      return;
    }

    try {
      // 2. Perform tiny ping request
      await pingGemini();
      setGeminiStatus('success');
    } catch (error) {
      setGeminiStatus('error');
      setGeminiError(error.message || 'Gemini API call failed');
    }
  };

  const runAllTests = () => {
    testSupabase();
    testGemini();
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const StatusCard = ({ title, status, error, icon: Icon, color }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconWrapper, { backgroundColor: color + '20' }]}>
          <Icon size={24} color={color} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>

      <View style={styles.statusContent}>
        {status === 'testing' ? (
          <View style={styles.statusRow}>
            <ActivityIndicator size="small" color={color} />
            <Text style={[styles.statusText, { color: '#6F767E' }]}>Verifying connection...</Text>
          </View>
        ) : status === 'success' ? (
          <View style={styles.statusRow}>
            <CheckCircle2 size={20} color="#27AE60" />
            <Text style={[styles.statusText, { color: '#27AE60' }]}>
              {title} Connected
            </Text>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <View style={styles.statusRow}>
              <XCircle size={20} color="#EB5757" />
              <Text style={[styles.statusText, { color: '#EB5757' }]}>Connection Failed</Text>
            </View>
            <Text style={styles.errorDetails}>{error}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>System Diagnostics</Text>
          <Text style={styles.headerSubtitle}>Verifying your .env configuration</Text>
        </View>

        <StatusCard 
          title="Supabase" 
          status={supabaseStatus} 
          error={supabaseError}
          icon={Database}
          color="#3ECF8E"
        />

        <StatusCard 
          title="Gemini AI" 
          status={geminiStatus} 
          error={geminiError}
          icon={Sparkles}
          color="#0095f6"
        />

        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={runAllTests}
          activeOpacity={0.8}
        >
          <RefreshCw size={20} color="#fff" style={styles.btnIcon} />
          <Text style={styles.refreshButtonText}>Run Diagnostic Again</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1D1F',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6F767E',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1D1F',
  },
  statusContent: {
    paddingLeft: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
  },
  errorContainer: {
    marginTop: 4,
  },
  errorDetails: {
    fontSize: 13,
    color: '#6F767E',
    marginTop: 12,
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFDADA',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  refreshButton: {
    backgroundColor: '#1A1D1F',
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  btnIcon: {
    marginRight: 10,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ConnectionTest;
