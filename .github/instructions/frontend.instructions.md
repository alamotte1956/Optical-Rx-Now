---
applyTo:
  - "frontend/**/*.ts"
  - "frontend/**/*.tsx"
  - "frontend/**/*.js"
  - "frontend/**/*.jsx"
---

# Frontend Instructions (React Native/Expo)

## Technology Stack
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React hooks (useState, useEffect, useContext)
- **Local Storage**: AsyncStorage for persistent data
- **Styling**: React Native StyleSheet

## Code Style

### TypeScript Guidelines
- Use TypeScript for all new components and files
- Define proper interfaces for props and state
- Avoid `any` type - use specific types or `unknown`
- Use type inference when obvious

### Component Structure
- Use functional components with hooks
- Keep components small and focused (< 200 lines)
- Extract complex logic into custom hooks
- Separate business logic from UI components

### Example Component:
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PrescriptionCardProps {
  prescriptionId: string;
  onPress?: () => void;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  prescriptionId,
  onPress
}) => {
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  
  useEffect(() => {
    loadPrescription();
  }, [prescriptionId]);
  
  const loadPrescription = async () => {
    const data = await AsyncStorage.getItem(`prescription_${prescriptionId}`);
    if (data) {
      setPrescription(JSON.parse(data));
    }
  };
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.text}>{prescription?.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
});
```

## Local Storage (Privacy-First)

### Critical Privacy Rule
- **ALL prescription data MUST be stored locally using AsyncStorage**
- **NEVER send prescription data to the backend**
- **ONLY send anonymous analytics to backend**

### AsyncStorage Patterns

#### Storing Prescription Data
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Prescription {
  id: string;
  date: string;
  // ... other fields
}

// Save prescription locally
const savePrescription = async (prescription: Prescription) => {
  try {
    await AsyncStorage.setItem(
      `prescription_${prescription.id}`,
      JSON.stringify(prescription)
    );
  } catch (error) {
    console.error('Error saving prescription:', error);
  }
};

// Load prescription from local storage
const loadPrescription = async (id: string): Promise<Prescription | null> => {
  try {
    const data = await AsyncStorage.getItem(`prescription_${id}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading prescription:', error);
    return null;
  }
};

// Delete prescription locally
const deletePrescription = async (id: string) => {
  try {
    await AsyncStorage.removeItem(`prescription_${id}`);
  } catch (error) {
    console.error('Error deleting prescription:', error);
  }
};
```

#### Storing Family Members Data
```typescript
interface FamilyMember {
  id: string;
  name: string;
  // ... other fields
}

const saveFamilyMember = async (member: FamilyMember) => {
  await AsyncStorage.setItem(
    `family_member_${member.id}`,
    JSON.stringify(member)
  );
};
```

## Analytics Integration

### Environment Configuration
- Use `expo-constants` to access environment-specific configuration
- Configure API URL via `app.json` or `app.config.js` in the `extra` field
- Never hardcode API URLs in components

### Anonymous Analytics Only
- Only send anonymous device IDs and event types
- Never include personal information in analytics
- Use device identifiers (not user names/emails)

### Example Analytics:
```typescript
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Use environment variable for API URL
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

const trackAnalytics = async (eventType: string, metadata?: string) => {
  const deviceId = await getDeviceId(); // Anonymous device identifier
  
  try {
    await fetch(`${API_URL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        device_id: deviceId,
        event_type: eventType,
        metadata: metadata || '',
        platform: Platform.OS, // 'ios', 'android', or 'web'
      }),
    });
  } catch (error) {
    console.error('Analytics tracking failed:', error);
    // Fail silently - analytics should not break app functionality
  }
};

// Track app open
await trackAnalytics('app_open');

// Track ad click
await trackAnalytics('ad_click', 'banner_home_screen');

// Track affiliate click
await trackAnalytics('affiliate_click', 'partner_id_123');
```

## Navigation (Expo Router)

### File-Based Routing
- Use Expo Router for navigation
- Files in `app/` directory define routes
- Use TypeScript for type-safe navigation

### Example Route Structure:
```
app/
  index.tsx           → /
  prescriptions/
    index.tsx         → /prescriptions
    [id].tsx          → /prescriptions/:id
  settings.tsx        → /settings
```

### Navigation Example:
```typescript
import { useRouter } from 'expo-router';

export default function PrescriptionsScreen() {
  const router = useRouter();
  
  const viewPrescription = (id: string) => {
    router.push(`/prescriptions/${id}`);
  };
  
  return (
    // Component JSX
  );
}
```

## Styling

### StyleSheet Best Practices
- Use React Native StyleSheet.create()
- Define styles at bottom of component file
- Use consistent spacing and sizing
- Support dark mode when applicable

### Example Styles:
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
});
```

## Affiliate Links Integration

### Fetching Affiliates from Backend
```typescript
interface Affiliate {
  id: string;
  name: string;
  url: string;
  logo_url: string;
  category: 'eyeglasses' | 'contacts' | 'both';
  is_active: boolean;
  is_featured: boolean;
}

const fetchAffiliates = async (): Promise<Affiliate[]> => {
  try {
    const response = await fetch(`${API_URL}/api/affiliates`);
    const data = await response.json();
    return data.affiliates || [];
  } catch (error) {
    console.error('Error fetching affiliates:', error);
    return [];
  }
};

// Track when user clicks affiliate link
const openAffiliateLink = async (affiliate: Affiliate) => {
  await trackAnalytics('affiliate_click', affiliate.id);
  Linking.openURL(affiliate.url);
};
```

## Error Handling

### User-Friendly Errors
- Display friendly error messages to users
- Log technical errors for debugging
- Handle network failures gracefully
- Provide fallbacks for offline mode

### Example:
```typescript
import { Alert } from 'react-native';

const handleError = (error: Error, userMessage: string) => {
  console.error('Error:', error);
  Alert.alert('Error', userMessage);
};

try {
  await savePrescription(prescription);
} catch (error) {
  handleError(
    error as Error,
    'Failed to save prescription. Please try again.'
  );
}
```

## Testing

### Component Testing
- Test components in isolation
- Mock AsyncStorage operations
- Test user interactions
- Verify no PHI is sent to backend

### Example Test:
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

describe('PrescriptionCard', () => {
  it('loads and displays prescription', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ id: '1', name: 'My Prescription' })
    );
    
    const { findByText } = render(
      <PrescriptionCard prescriptionId="1" />
    );
    
    expect(await findByText('My Prescription')).toBeTruthy();
  });
});
```

## Common Patterns

### Loading States
```typescript
const [isLoading, setIsLoading] = useState(true);
const [data, setData] = useState<Data | null>(null);

useEffect(() => {
  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await fetchData();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  loadData();
}, []);

if (isLoading) {
  return <ActivityIndicator />;
}
```

### Forms
```typescript
const [formData, setFormData] = useState({
  field1: '',
  field2: '',
});

const handleChange = (field: string, value: string) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};

const handleSubmit = async () => {
  // Validate and save locally
  await AsyncStorage.setItem('form_data', JSON.stringify(formData));
};
```

## Offline-First Architecture

### Core Features Work Offline
- All prescription management works without internet
- Analytics should fail gracefully if offline
- Affiliate links require internet (expected behavior)
- Display appropriate messages for network-dependent features

### Example:
```typescript
import NetInfo from '@react-native-community/netinfo';

const [isOnline, setIsOnline] = useState(true);

useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    setIsOnline(state.isConnected ?? false);
  });
  return () => unsubscribe();
}, []);

// Show message when offline and trying to access network features
{!isOnline && <Text>You are offline. Some features may be limited.</Text>}
```

## Privacy & Security Checklist

Before adding any new feature:
- [ ] Does this feature store data locally (not on backend)?
- [ ] Is the analytics data anonymous?
- [ ] Are we validating user inputs?
- [ ] Do error messages avoid exposing sensitive info?
- [ ] Is offline functionality preserved?
