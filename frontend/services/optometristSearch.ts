import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

interface Optometrist {
  id: string;
  name: string;
  rating: number;
  distance: number;
  address: string;
  phone: string;
  hours: string;
  services: string[];
  isNewPatients: boolean;
  acceptsInsurance: boolean;
  contactsAvailable: boolean;
  isSponsored: boolean;
  isVerified: boolean;
  affiliateUrl?: string;
  specialOffer?: string;
}

interface SearchOptions {
  zipCode?: string;
  radius?: number;
  newPatientsOnly?: boolean;
  insuranceOnly?: boolean;
  contactsOnly?: boolean;
}

// Mock data for optometrists
const MOCK_OPTOMETRISTS: Optometrist[] = [
  {
    id: '1',
    name: "LensCrafters",
    rating: 4.5,
    distance: 2.3,
    address: "123 Main St, Anytown, USA",
    phone: "(555) 123-4567",
    hours: "Mon-Fri: 9am-7pm, Sat: 10am-5pm",
    services: ["Eye Exams", "Glasses", "Contacts", "Lasik Consultation"],
    isNewPatients: true,
    acceptsInsurance: true,
    contactsAvailable: true,
    isSponsored: true,
    isVerified: true,
    affiliateUrl: "https://www.lenscrafters.com",
    specialOffer: "25% OFF First Eye Exam"
  },
  {
    id: '2',
    name: "VisionWorks",
    rating: 4.3,
    distance: 3.1,
    address: "456 Oak Ave, Anytown, USA",
    phone: "(555) 234-5678",
    hours: "Mon-Sat: 9am-6pm",
    services: ["Eye Exams", "Glasses", "Contacts"],
    isNewPatients: true,
    acceptsInsurance: true,
    contactsAvailable: true,
    isSponsored: true,
    isVerified: true,
    affiliateUrl: "https://www.visionworks.com",
    specialOffer: "Free Eye Exam with Purchase"
  },
  {
    id: '3',
    name: "Dr. Sarah Johnson Eye Care",
    rating: 4.8,
    distance: 1.5,
    address: "789 Elm Blvd, Anytown, USA",
    phone: "(555) 345-6789",
    hours: "Mon-Fri: 8am-5pm",
    services: ["Eye Exams", "Glasses", "Contacts"],
    isNewPatients: false,
    acceptsInsurance: true,
    contactsAvailable: false,
    isSponsored: false,
    isVerified: true
  },
  {
    id: '4',
    name: "America's Best Contacts & Eyeglasses",
    rating: 4.2,
    distance: 4.2,
    address: "321 Pine Rd, Anytown, USA",
    phone: "(555) 456-7890",
    hours: "Mon-Sun: 10am-7pm",
    services: ["Eye Exams", "Glasses", "Contacts"],
    isNewPatients: true,
    acceptsInsurance: true,
    contactsAvailable: true,
    isSponsored: false,
    isVerified: true,
    affiliateUrl: "https://www.twopair.com",
    specialOffer: "2 Pairs for $69.95 + Free Exam"
  }
];

export class OptometristSearchService {
  private static readonly STORAGE_KEY = '@optical_rx_now:optometrist_search_history';
  private static readonly ZIP_CODE_KEY = '@optical_rx_now:last_zip_code';

  /**
   * Search for optometrists by zip code
   */
  static async searchOptometrists(options: SearchOptions): Promise<Optometrist[]> {
    const { zipCode, radius = 10, newPatientsOnly, insuranceOnly, contactsOnly } = options;

    // Save zip code for future use
    if (zipCode) {
      await this.saveLastZipCode(zipCode);
      await this.addToSearchHistory(zipCode);
    }

    // Filter results based on options
    let results = [...MOCK_OPTOMETRISTS];

    if (newPatientsOnly) {
      results = results.filter(opt => opt.isNewPatients);
    }

    if (insuranceOnly) {
      results = results.filter(opt => opt.acceptsInsurance);
    }

    if (contactsOnly) {
      results = results.filter(opt => opt.contactsAvailable);
    }

    // Sort by distance
    results.sort((a, b) => a.distance - b.distance);

    return results;
  }

  /**
   * Get search history
   */
  static async getSearchHistory(): Promise<string[]> {
    try {
      const history = await AsyncStorage.getItem(this.STORAGE_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  /**
   * Add zip code to search history
   */
  static async addToSearchHistory(zipCode: string): Promise<void> {
    try {
      const history = await this.getSearchHistory();
      
      // Remove if already exists
      const filtered = history.filter(zip => zip !== zipCode);
      
      // Add to beginning
      filtered.unshift(zipCode);
      
      // Keep only last 10
      const limited = filtered.slice(0, 10);
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(limited));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  /**
   * Get last used zip code
   */
  static async getLastZipCode(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.ZIP_CODE_KEY);
    } catch (error) {
      console.error('Error getting last zip code:', error);
      return null;
    }
  }

  /**
   * Save zip code as last used
   */
  static async saveLastZipCode(zipCode: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.ZIP_CODE_KEY, zipCode);
    } catch (error) {
      console.error('Error saving last zip code:', error);
    }
  }

  /**
   * Get popular zip codes (for quick access)
   */
  static getPopularZipCodes(): string[] {
    return [
      '90210', '10001', '60601', '33101', '94102',
      '77001', '85001', '98101', '02101', '92101'
    ];
  }

  /**
   * Get user's current location
   */
  static async getCurrentLocation(): Promise<string | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // For now, return a mock zip code
      // In production, use a geocoding service
      return '12345';
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }
}