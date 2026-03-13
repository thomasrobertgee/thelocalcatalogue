import React, { useState, useEffect, useRef } from 'react';
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
  Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Picker } from '@react-native-picker/picker';
import { Camera, X, Upload, Sparkles, CheckCircle2, Image as ImageIcon, Plus } from 'lucide-react-native';
import { supabase } from '../supabase';
import { analyzeProductImage } from '../gemini';
import { notifyFollowers } from '../notifications';

const { width } = Dimensions.get('window');

const CreatePost = ({ navigation }) => {
  const [images, setImages] = useState([]);
  const [caption, setCaption] = useState('');
  const [price, setPrice] = useState('');
  const [productName, setProductName] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, business_name')
        .order('business_name');
      if (error) throw error;
      setBusinesses(data || []);
      if (data?.length > 0) setSelectedBusiness(data[0].id);
    } catch (err) {
      console.error('Error fetching businesses:', err.message);
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
      const newImages = result.assets.slice(0, 5 - images.length);
      setImages([...images, ...newImages]);
    }
  };

  const takePhoto = async () => {
    if (!permission.granted) {
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

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleAIAnalysis = async () => {
    if (images.length === 0) return;
    setAnalyzing(true);
    try {
      // Analyze the first image
      const result = await analyzeProductImage(images[0].uri);
      
      setProductName(result.product_name || '');
      setPrice(result.price ? result.price.toString() : '');
      setCaption(result.caption || '');
      
      setIsReviewMode(true);
      Alert.alert("AI Analysis Complete", "We've pre-filled the details based on your first photo!");
    } catch (err) {
      Alert.alert("Analysis Failed", "Could not analyze the image.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUpload = async () => {
    if (images.length === 0 || !caption || !selectedBusiness) {
      Alert.alert('Incomplete Form', 'Please provide at least one image, a caption, and select a business.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create the post entry
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert([{
          business_id: selectedBusiness,
          product_name: productName,
          description: caption,
          price: price ? parseFloat(price) : null,
          image_url: '', // Primary image placeholder, we'll update this
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (postError) throw postError;

      // 2. Upload images in parallel
      const uploadPromises = images.map(async (img, index) => {
        const fileExt = img.uri.split('.').pop();
        const fileName = `${postData.id}_${index}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        const response = await fetch(img.uri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, blob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);

        return { post_id: postData.id, image_url: publicUrl, order_index: index };
      });

      const uploadedImages = await Promise.all(uploadPromises);

      // 3. Save multiple images to post_images table
      const { error: imgTableError } = await supabase
        .from('post_images')
        .insert(uploadedImages);

      if (imgTableError) throw imgTableError;

      // 4. Update primary image_url in posts table with the first image
      await supabase
        .from('posts')
        .update({ image_url: uploadedImages[0].image_url })
        .eq('id', postData.id);

      // 5. Trigger Push Notifications
      const currentBiz = businesses.find(b => b.id === selectedBusiness);
      if (currentBiz) {
        notifyFollowers(selectedBusiness, currentBiz.business_name);
      }

      Alert.alert('Success', 'Post shared with the community!');
      navigation.navigate('Explore');
    } catch (err) {
      Alert.alert('Upload Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create New Post</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}><X size={24} color="#000" /></TouchableOpacity>
        </View>

        {/* Multi-Image Review */}
        <View style={styles.mediaSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageScroll}>
            {images.map((img, index) => (
              <View key={index} style={styles.thumbnailContainer}>
                <Image source={{ uri: img.uri }} style={styles.thumbnail} />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(index)}>
                  <X size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <View style={styles.mediaButtons}>
                <TouchableOpacity style={styles.addMediaBtn} onPress={takePhoto}>
                  <Camera size={24} color="#6F767E" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.addMediaBtn, { marginTop: 8 }]} onPress={pickImages}>
                  <ImageIcon size={24} color="#6F767E" />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
          {images.length === 0 && (
            <View style={styles.emptyMedia}>
              <Text style={styles.emptyMediaText}>Capture or select up to 5 photos</Text>
            </View>
          )}
        </View>

        {/* AI Action */}
        {images.length > 0 && !isReviewMode && (
          <TouchableOpacity 
            style={[styles.aiButton, analyzing && styles.disabledBtn]} 
            onPress={handleAIAnalysis}
            disabled={analyzing}
          >
            {analyzing ? <ActivityIndicator color="#fff" /> : 
            <><Sparkles size={18} color="#fff" style={styles.btnIcon} /><Text style={styles.aiButtonText}>Auto-fill with AI (First Photo)</Text></>}
          </TouchableOpacity>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Business</Text>
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={selectedBusiness} onValueChange={(v) => setSelectedBusiness(v)}>
                {businesses.map((biz) => <Picker.Item key={biz.id} label={biz.business_name} value={biz.id} />)}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput style={styles.input} placeholder="e.g. Fresh Sourdough" value={productName} onChangeText={setProductName} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price</Text>
            <TextInput style={styles.input} placeholder="0.00" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Caption</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="What's the update?" multiline value={caption} onChangeText={setCaption} />
          </View>

          <TouchableOpacity style={[styles.submitButton, (loading || images.length === 0) && styles.disabledBtn]} onPress={handleUpload} disabled={loading || images.length === 0}>
            {loading ? <ActivityIndicator color="#fff" /> : 
            <><Upload size={20} color="#fff" style={styles.btnIcon} /><Text style={styles.submitButtonText}>Share Post ({images.length} Photos)</Text></>}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Camera Modal */}
      <Modal visible={cameraVisible} animationType="slide">
        <CameraView style={styles.camera} facing="back" ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            <TouchableOpacity style={styles.closeCamera} onPress={() => setCameraVisible(false)}>
              <X size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
              <View style={styles.captureInternal} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1A1D1F' },
  mediaSection: { height: 140, marginVertical: 10, paddingHorizontal: 24 },
  imageScroll: { gap: 12, alignItems: 'center' },
  thumbnailContainer: { width: 100, height: 100, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F4F4F4' },
  thumbnail: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, padding: 2 },
  mediaButtons: { height: 100, justifyContent: 'center' },
  addMediaBtn: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#F4F4F4', justifyContent: 'center', alignItems: 'center', borderWeight: 1, borderColor: '#EFEFEF' },
  emptyMedia: { width: '100%', height: 100, borderRadius: 16, backgroundColor: '#F4F4F4', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#EFEFEF' },
  emptyMediaText: { color: '#6F767E', fontSize: 14, fontWeight: '500' },
  aiButton: { backgroundColor: '#0095f6', flexDirection: 'row', marginHorizontal: 24, marginTop: 16, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  aiButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  form: { paddingHorizontal: 24, marginTop: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#1A1D1F', marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: '#F4F4F4', borderRadius: 16, paddingHorizontal: 16, height: 56, fontSize: 16, color: '#1A1D1F' },
  textArea: { height: 100, paddingTop: 16, textAlignVertical: 'top' },
  pickerWrapper: { backgroundColor: '#F4F4F4', borderRadius: 16, height: 56, justifyContent: 'center' },
  submitButton: { backgroundColor: '#1A1D1F', flexDirection: 'row', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disabledBtn: { opacity: 0.5 },
  btnIcon: { marginRight: 8 },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 40 },
  closeCamera: { position: 'absolute', top: 60, left: 24 },
  captureBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  captureInternal: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' }
});

export default CreatePost;
