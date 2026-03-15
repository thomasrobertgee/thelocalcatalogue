import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Modal,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { 
  Camera, 
  X, 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  Search, 
  ChevronRight, 
  Plus 
} from 'lucide-react-native';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthProvider';
import { analyzeProductImage } from '../gemini';
import { notifyFollowers } from '../notifications';

const { width } = Dimensions.get('window');

const CreatePost = ({ navigation }) => {
  const { user, profile } = useAuth();
  const [images, setImages] = useState([]);
  const [caption, setCaption] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [searching, setSearching] = useState(false);

  const [cameraVisible, setCameraVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const delayDebounce = setTimeout(() => searchBusinesses(), 300);
      return () => clearTimeout(delayDebounce);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchBusinesses = async () => {
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, business_name, suburb')
        .ilike('business_name', `%${searchQuery}%`)
        .limit(10);
      if (error) throw error;
      setSearchResults(data || []);
    } catch (err) {
      console.log('Search error:', err.message);
    } finally {
      setSearching(false);
    }
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages([...images, ...result.assets.slice(0, 5 - images.length)]);
    }
  };

  const takePhoto = async () => {
    if (!permission?.granted) {
      const status = await requestPermission();
      if (!status.granted) return;
    }
    setCameraVisible(true);
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      setImages([...images, photo]);
      setCameraVisible(false);
    }
  };

  const handleUpload = async () => {
    if (images.length === 0 || !caption) {
      Alert.alert('Incomplete', 'Add photos and a caption.');
      return;
    }
    if (!profile?.is_business && !selectedBusiness) {
      Alert.alert('Tag a Business', 'Tag the local business you are visiting.');
      return;
    }

    setLoading(true);
    try {
      const targetId = profile?.is_business ? user.id : selectedBusiness.id;
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert([{
          business_id: targetId,
          caption: caption,
          price: profile?.is_business && price ? parseFloat(price) : null,
          image_url: '', 
          created_at: new Date().toISOString()
        }])
        .select().single();

      if (postError) throw postError;

      const uploadPromises = images.map(async (img, index) => {
        const fileExt = img.uri.split('.').pop();
        const filePath = `posts/${postData.id}_${index}.${fileExt}`;
        const response = await fetch(img.uri);
        const blob = await response.blob();
        await supabase.storage.from('post-images').upload(filePath, blob);
        const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(filePath);
        return { post_id: postData.id, image_url: publicUrl, order_index: index };
      });

      const uploaded = await Promise.all(uploadPromises);
      await supabase.from('post_images').insert(uploaded);
      await supabase.from('posts').update({ image_url: uploaded[0].image_url }).eq('id', postData.id);

      if (profile?.is_business) notifyFollowers(user.id, profile.business_name);

      Alert.alert('Success', 'Post shared!');
      setImages([]); setCaption(''); setPrice(''); setSelectedBusiness(null);
      navigation.navigate('Explore');
    } catch (err) {
      Alert.alert('Upload Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Update</Text>
          <Text style={styles.headerSubtitle}>Posting as {profile?.is_business ? profile.business_name : 'Local User'}</Text>
        </View>

        <View style={styles.mediaSection}>
          {images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageScroll}>
              {images.map((img, index) => (
                <View key={index} style={styles.thumbnailContainer}>
                  <Image source={{ uri: img.uri }} style={styles.thumbnail} />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => setImages(images.filter((_, i) => i !== index))}><X size={14} color="#fff" /></TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && <TouchableOpacity style={styles.addMoreBtn} onPress={takePhoto}><Plus size={24} color="#6F767E" /></TouchableOpacity>}
            </ScrollView>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.largeMediaBtn} onPress={takePhoto}><Camera size={28} color="#1A1D1F" /><Text style={styles.mediaBtnText}>Take a Photo</Text></TouchableOpacity>
              <TouchableOpacity style={styles.largeMediaBtn} onPress={pickImages}><ImageIcon size={28} color="#1A1D1F" /><Text style={styles.mediaBtnText}>Choose Gallery</Text></TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.form}>
          {profile?.is_business ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price (Optional)</Text>
              <TextInput style={styles.input} placeholder="0.00" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
            </View>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tag Business</Text>
              <TouchableOpacity style={styles.searchSelector} onPress={() => setTagModalVisible(true)}>
                <Search size={20} color={selectedBusiness ? '#1A1D1F' : '#6F767E'} />
                <Text style={[styles.selectorText, selectedBusiness && { color: '#1A1D1F', fontWeight: '500' }]}>{selectedBusiness ? selectedBusiness.business_name : 'Search local business...'}</Text>
                <ChevronRight size={20} color="#6F767E" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputGroup}><Text style={styles.label}>Caption</Text><TextInput style={[styles.input, styles.textArea]} placeholder="What's happening?" multiline value={caption} onChangeText={setCaption} /></View>
          <TouchableOpacity style={[styles.submitButton, (loading || images.length === 0) && { opacity: 0.5 }]} onPress={handleUpload} disabled={loading || images.length === 0}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Share Update</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={tagModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}><Text style={styles.modalTitle}>Tag Business</Text><TouchableOpacity onPress={() => setTagModalVisible(false)}><X size={24} color="#000" /></TouchableOpacity></View>
          <View style={styles.modalSearchBox}><Search size={20} color="#6F767E" style={{ marginRight: 10 }} /><TextInput style={styles.modalSearchInput} placeholder="Search by name..." autoFocus value={searchQuery} onChangeText={setSearchQuery} /></View>
          <FlatList data={searchResults} keyExtractor={(item) => item.id} renderItem={({ item }) => (
            <TouchableOpacity style={styles.searchResultItem} onPress={() => { setSelectedBusiness(item); setTagModalVisible(false); setSearchQuery(''); }}>
              <View style={styles.resultIcon}><Text style={styles.resultLetter}>{item.business_name.charAt(0)}</Text></View>
              <View><Text style={styles.resultName}>{item.business_name}</Text><Text style={styles.resultSuburb}>{item.suburb}</Text></View>
            </TouchableOpacity>
          )} />
        </SafeAreaView>
      </Modal>

      <Modal visible={cameraVisible} animationType="slide">
        <CameraView style={styles.camera} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            <TouchableOpacity style={styles.closeCamera} onPress={() => setCameraVisible(false)}><X size={30} color="#fff" /></TouchableOpacity>
            <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}><View style={styles.captureInternal} /></TouchableOpacity>
          </View>
        </CameraView>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 40 },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1A1D1F' },
  headerSubtitle: { fontSize: 14, color: '#6F767E' },
  mediaSection: { height: 140, marginVertical: 10, paddingHorizontal: 24 },
  imageScroll: { gap: 12, alignItems: 'center' },
  thumbnailContainer: { width: 100, height: 100, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F4F4F4' },
  thumbnail: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, padding: 2 },
  buttonRow: { flexDirection: 'row', gap: 12, height: 100 },
  largeMediaBtn: { flex: 1, height: 100, backgroundColor: '#F4F4F4', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  mediaBtnText: { marginTop: 8, fontSize: 12, fontWeight: '700', color: '#1A1D1F' },
  addMoreBtn: { width: 100, height: 100, borderRadius: 12, backgroundColor: '#F4F4F4', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#EFEFEF' },
  form: { paddingHorizontal: 24, marginTop: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '700', color: '#1A1D1F', marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: '#F4F4F4', borderRadius: 16, paddingHorizontal: 16, height: 56, fontSize: 16, color: '#1A1D1F' },
  searchSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F4F4', borderRadius: 16, paddingHorizontal: 16, height: 56 },
  selectorText: { flex: 1, marginLeft: 12, fontSize: 15, color: '#6F767E' },
  textArea: { height: 100, paddingTop: 16, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#1A1D1F', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalSearchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F4F4', marginHorizontal: 24, paddingHorizontal: 16, borderRadius: 12, height: 50 },
  modalSearchInput: { flex: 1, fontSize: 16 },
  searchResultItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F4F4F4' },
  resultIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1D1F', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  resultLetter: { color: '#fff', fontWeight: 'bold' },
  resultName: { fontSize: 16, fontWeight: '700' },
  resultSuburb: { fontSize: 13, color: '#6F767E' },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 40 },
  closeCamera: { position: 'absolute', top: 60, left: 24 },
  captureBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  captureInternal: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' }
});

export default CreatePost;
