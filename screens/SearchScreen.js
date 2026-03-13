import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from "@shopify/flash-list";
import { Search as SearchIcon, MapPin, Tag, X } from 'lucide-react-native';
import { supabase } from '../supabase';

const { width } = Dimensions.get('window');

const CATEGORIES = ['Cafe', 'Fitness', 'Retail', 'Services'];
const SUBURBS = ['Altona North', 'Williamstown', 'Newport', 'Yarraville'];

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSuburb, setSelectedSuburb] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      // Query posts and inner join businesses to allow filtering on business fields
      let supabaseQuery = supabase
        .from('posts')
        .select(`
          id,
          description,
          image_url,
          created_at,
          business:businesses!inner (
            id,
            business_name,
            logo_url,
            suburb,
            category
          )
        `);

      // 1. Multi-field Text Search
      if (query) {
        supabaseQuery = supabaseQuery.or(`description.ilike.%${query}%,business_name.ilike.%${query}%`, { foreignTable: 'businesses' });
      }

      // 2. Category Filter
      if (selectedCategory) {
        supabaseQuery = supabaseQuery.eq('business.category', selectedCategory);
      }

      // 3. Suburb Filter
      if (selectedSuburb) {
        supabaseQuery = supabaseQuery.eq('business.suburb', selectedSuburb);
      }

      const { data, error } = await supabaseQuery
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error('Search error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategory, selectedSuburb]);

  // Update results immediately when any filter changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchResults();
    }, 300); // 300ms debounce for text input

    return () => clearTimeout(delayDebounceFn);
  }, [query, selectedCategory, selectedSuburb]);

  const toggleFilter = (item, current, setter) => {
    setter(current === item ? null : item);
  };

  const renderResultItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.resultCard}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
    >
      <View style={styles.businessHeader}>
        <Image 
          source={{ uri: item.business?.logo_url || 'https://via.placeholder.com/40' }} 
          style={styles.businessLogo} 
        />
        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>{item.business?.business_name}</Text>
          <Text style={styles.businessMeta}>
            {item.business?.suburb} • {item.business?.category}
          </Text>
        </View>
      </View>
      <Image 
        source={{ uri: item.image_url }} 
        style={styles.postImage} 
        resizeMode="cover"
      />
      <Text style={styles.postCaption} numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  const FilterChip = ({ label, isSelected, onPress, icon: Icon }) => (
    <TouchableOpacity 
      style={[styles.chip, isSelected && styles.chipSelected]} 
      onPress={onPress}
    >
      {Icon && <Icon size={14} color={isSelected ? '#fff' : '#6F767E'} style={styles.chipIcon} />}
      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color="#6F767E" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search shops or products..."
            placeholderTextColor="#6F767E"
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={20} color="#6F767E" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {CATEGORIES.map(cat => (
            <FilterChip 
              key={cat} 
              label={cat} 
              isSelected={selectedCategory === cat} 
              onPress={() => toggleFilter(cat, selectedCategory, setSelectedCategory)}
              icon={Tag}
            />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {SUBURBS.map(sub => (
            <FilterChip 
              key={sub} 
              label={sub} 
              isSelected={selectedSuburb === sub} 
              onPress={() => toggleFilter(sub, selectedSuburb, setSelectedSuburb)}
              icon={MapPin}
            />
          ))}
        </ScrollView>
      </View>

      {/* Results List */}
      <View style={styles.listWrapper}>
        {loading && results.length === 0 ? (
          <ActivityIndicator size="large" color="#1A1D1F" style={styles.loader} />
        ) : (
          <FlashList
            data={results}
            renderItem={renderResultItem}
            estimatedItemSize={350}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No results found matching your filters.</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1D1F',
    fontWeight: '500',
  },
  filterSection: {
    marginBottom: 8,
  },
  chipScroll: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
  },
  chipSelected: {
    backgroundColor: '#1A1D1F',
    borderColor: '#1A1D1F',
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6F767E',
  },
  chipTextSelected: {
    color: '#fff',
  },
  listWrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultCard: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F4F4F4',
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  businessLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4F4F4',
  },
  businessInfo: {
    marginLeft: 12,
  },
  businessName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1D1F',
  },
  businessMeta: {
    fontSize: 12,
    color: '#6F767E',
    marginTop: 2,
  },
  postImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F4F4F4',
  },
  postCaption: {
    padding: 16,
    fontSize: 14,
    lineHeight: 20,
    color: '#33383F',
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#6F767E',
  },
});

export default SearchScreen;
