import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  OptometristSearchService,
  type Optometrist,
} from '../services/optometristSearch';

const { width } = Dimensions.get('window');

export default function FindOptometristScreen() {
  const router = useRouter();
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Optometrist[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState({
    newPatients: false,
    insurance: false,
    contacts: false,
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const lastZip = await OptometristSearchService.getLastZipCode();
    if (lastZip) {
      setZipCode(lastZip);
    }

    const history = await OptometristSearchService.getSearchHistory();
    setSearchHistory(history);
  };

  const handleSearch = async () => {
    if (!zipCode || zipCode.length !== 5) {
      Alert.alert('Invalid Zip Code', 'Please enter a valid 5-digit zip code');
      return;
    }

    setLoading(true);
    try {
      const searchResults = await OptometristSearchService.searchOptometrists({
        zipCode,
        newPatientsOnly: filters.newPatients,
        insuranceOnly: filters.insurance,
        contactsOnly: filters.contacts,
      });
      setResults(searchResults);
    } catch (error) {
      Alert.alert('Search Error', 'Failed to search for optometrists');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryPress = async (zip: string) => {
    setZipCode(zip);
    setLoading(true);
    try {
      const searchResults = await OptometristSearchService.searchOptometrists({
        zipCode: zip,
      });
      setResults(searchResults);
    } catch (error) {
      Alert.alert('Search Error', 'Failed to search for optometrists');
    } finally {
      setLoading(false);
    }
  };

  const handleOptometristPress = (optometrist: Optometrist) => {
    if (optometrist.affiliateUrl) {
      // Open affiliate link
      Alert.alert('Book Appointment', 'Would you like to book an appointment?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Book Now', onPress: () => console.log('Opening:', optometrist.affiliateUrl) }
      ]);
    }
  };

  const popularZipCodes = OptometristSearchService.getPopularZipCodes();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Eye Care Near You</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Search Box */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="location" size={20} color="#8899a6" />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter Zip Code"
              placeholderTextColor="#8899a6"
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={[styles.filterChip, filters.newPatients && styles.filterChipActive]}
            onPress={() => setFilters({ ...filters, newPatients: !filters.newPatients })}
          >
            <Text style={[styles.filterText, filters.newPatients && styles.filterTextActive]}>
              New Patients
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filters.insurance && styles.filterChipActive]}
            onPress={() => setFilters({ ...filters, insurance: !filters.insurance })}
          >
            <Text style={[styles.filterText, filters.insurance && styles.filterTextActive]}>
              Insurance
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filters.contacts && styles.filterChipActive]}
            onPress={() => setFilters({ ...filters, contacts: !filters.contacts })}
          >
            <Text style={[styles.filterText, filters.contacts && styles.filterTextActive]}>
              Contacts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search History */}
        {searchHistory.length > 0 && results.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {searchHistory.map((zip, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.historyChip}
                  onPress={() => handleHistoryPress(zip)}
                >
                  <Text style={styles.historyText}>{zip}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Popular Zip Codes */}
        {results.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Areas</Text>
            <View style={styles.zipCodeGrid}>
              {popularZipCodes.map((zip, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.zipCodeItem}
                  onPress={() => handleHistoryPress(zip)}
                >
                  <Text style={styles.zipCodeText}>{zip}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4a9eff" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}

        {/* Results */}
        {results.length > 0 && (
          <View style={styles.section}>
            <View style={styles.resultsHeader}>
              <Text style={styles.sectionTitle}>
                {results.length} Eye Care Providers Found
              </Text>
              <TouchableOpacity
                style={styles.mapToggle}
                onPress={() => setShowMap(!showMap)}
              >
                <Ionicons
                  name={showMap ? 'list' : 'map'}
                  size={20}
                  color="#4a9eff"
                />
                <Text style={styles.mapToggleText}>
                  {showMap ? 'List' : 'Map'}
                </Text>
              </TouchableOpacity>
            </View>

            {showMap ? (
              <View style={styles.mapPlaceholder}>
                <Ionicons name="map" size={60} color="#4a9eff20" />
                <Text style={styles.mapPlaceholderText}>
                  Map View (Google Maps Integration Coming Soon)
                </Text>
              </View>
            ) : (
              results.map((optometrist) => (
                <View key={optometrist.id} style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{optometrist.name}</Text>
                      <View style={styles.resultMeta}>
                        <Ionicons name="star" size={14} color="#FFA500" />
                        <Text style={styles.ratingText}>{optometrist.rating}</Text>
                        <Ionicons name="location" size={14} color="#8899a6" />
                        <Text style={styles.distanceText}>{optometrist.distance} mi</Text>
                      </View>
                    </View>
                    {optometrist.isSponsored && (
                      <View style={styles.sponsoredBadge}>
                        <Text style={styles.sponsoredText}>Sponsored</Text>
                      </View>
                    )}
                  </View>

                  {optometrist.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
                      <Text style={styles.verifiedText}>Verified Partner</Text>
                    </View>
                  )}

                  {optometrist.specialOffer && (
                    <View style={styles.offerBanner}>
                      <Text style={styles.offerText}>{optometrist.specialOffer}</Text>
                    </View>
                  )}

                  <Text style={styles.resultAddress}>{optometrist.address}</Text>
                  <Text style={styles.resultPhone}>{optometrist.phone}</Text>
                  <Text style={styles.resultHours}>{optometrist.hours}</Text>

                  <View style={styles.resultServices}>
                    {optometrist.services.map((service, index) => (
                      <View key={index} style={styles.serviceTag}>
                        <Text style={styles.serviceText}>{service}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.resultActions}>
                    {optometrist.affiliateUrl && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleOptometristPress(optometrist)}
                      >
                        <Ionicons name="calendar" size={18} color="#fff" />
                        <Text style={styles.actionButtonText}>Book Now</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.actionButton, styles.secondaryButton]}
                      onPress={() => Alert.alert('Directions', 'Opening maps...')}
                    >
                      <Ionicons name="navigate" size={18} color="#4a9eff" />
                      <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                        Directions
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.secondaryButton]}
                      onPress={() => Alert.alert('Call', `Calling ${optometrist.phone}`)}
                    >
                      <Ionicons name="call" size={18} color="#4a9eff" />
                      <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                        Call
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2d45',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2d45',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2a4d6f',
  },
  searchInput: {
    flex: 1,
    height: 50,
    marginLeft: 12,
    color: '#fff',
    fontSize: 16,
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: '#4a9eff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a2d45',
    borderWidth: 1,
    borderColor: '#2a4d6f',
  },
  filterChipActive: {
    backgroundColor: '#4a9eff20',
    borderColor: '#4a9eff',
  },
  filterText: {
    fontSize: 14,
    color: '#8899a6',
  },
  filterTextActive: {
    color: '#4a9eff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  historyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a2d45',
    marginRight: 8,
  },
  historyText: {
    fontSize: 14,
    color: '#4a9eff',
  },
  zipCodeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  zipCodeItem: {
    width: (width - 48) / 5,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a2d45',
    borderRadius: 8,
  },
  zipCodeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8899a6',
    marginTop: 12,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mapToggleText: {
    fontSize: 14,
    color: '#4a9eff',
  },
  mapPlaceholder: {
    height: 300,
    backgroundColor: '#1a2d45',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: '#8899a6',
    marginTop: 12,
  },
  resultCard: {
    backgroundColor: '#1a2d45',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#FFA500',
    fontWeight: 'bold',
  },
  distanceText: {
    fontSize: 14,
    color: '#8899a6',
  },
  sponsoredBadge: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sponsoredText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  offerBanner: {
    backgroundColor: '#4CAF5020',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  offerText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  resultAddress: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
  },
  resultPhone: {
    fontSize: 14,
    color: '#4a9eff',
    marginBottom: 4,
  },
  resultHours: {
    fontSize: 13,
    color: '#8899a6',
    marginBottom: 12,
  },
  resultServices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  serviceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#2a4d6f',
    borderRadius: 4,
  },
  serviceText: {
    fontSize: 12,
    color: '#fff',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#4a9eff',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4a9eff',
  },
  secondaryButtonText: {
    color: '#4a9eff',
  },
});