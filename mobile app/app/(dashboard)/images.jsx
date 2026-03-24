import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, Text, RefreshControl, TouchableOpacity, Alert, Linking } from 'react-native';
import { databases, storage, getFullImageUrl, getFileUrl } from '../../lib/appwrite';
import { useUser } from '../../hooks/useUser';
import { Query } from 'react-native-appwrite';
import ImageCard from '../../components/ImageCard'; // Assuming ImageCard uses ThemedView/Text or will be updated
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
// --- REMOVE Colors import ---
// import { Colors } from '../../constants/Colors'; 
import * as Location from 'expo-location';
import FullScreenImageModal from '../../components/FullScreenImageModal'; // Assuming this uses ThemedView/Text or will be updated

// --- NEW: Import useTheme hook ---
import { useTheme } from '../../contexts/ThemeContext.js'; // Adjust path as necessary

// TODO: Replace these with your own Appwrite project credentials
const DATABASE_ID = 'YOUR_DATABASE_ID_HERE';
const COLLECTION_ID = 'YOUR_COLLECTION_ID_HERE';
const BUCKET_ID = 'YOUR_BUCKET_ID_HERE';
const PROJECT_ID = 'YOUR_PROJECT_ID_HERE';
const ENDPOINT = 'https://fra.cloud.appwrite.io/v1';

const ImagesScreen = () => {
  const { user, authChecked } = useUser();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [addresses, setAddresses] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);

  // --- NEW: Get theme colors ---
  const { colors } = useTheme();

  const getSignedUrl = async (bucketId, fileId) => {
    try {
      let url;
      try {
        url = await storage.getFilePreview(
          bucketId,
          fileId,
          300,
          300,
          'top',
          80,
          undefined,
          undefined,
          8,
          0,
          undefined,
          '#F0F0F0', // This background color is for the preview itself, not the app UI
          'jpg'
        );
      } catch (previewError) {
        console.log('Preview failed, falling back to view');
        url = await storage.getFileView(bucketId, fileId);
      }

      return url.toString() + `?cache=${Date.now()}`;
    } catch (error) {
      console.error('URL generation error:', error);
      return null;
    }
  };

  const verifyLocationPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'We need location access to show addresses of your reports',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => Linking.openSettings()
          }
        ]
      );
      return false;
    }
    return true;
  };

  const fetchUploads = useCallback(async () => {
    try {
      if (!(await verifyLocationPermissions())) {
        setError('Location permission required to load addresses');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const hasLocationPermission = await verifyLocationPermissions();

      if (!hasLocationPermission) {
        return;
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal('userId', user.$id),
          Query.orderDesc('timestamp'),
          Query.select(['$id', 'imageId', 'timestamp', 'latitude', 'longitude', 'Status'])
        ]
      );

      const uploadsWithPreview = await Promise.all(
        response.documents.map(async (upload) => {
          try {
            const previewUrl = await getSignedUrl(BUCKET_ID, upload.imageId);
            const fullSizeUrl = (await storage.getFileView(BUCKET_ID, upload.imageId)).toString();

            return {
              ...upload,
              previewUrl: previewUrl,
              fullSizeUrl: fullSizeUrl
            };
          } catch (error) {
            console.error('Error generating URLs for upload:', upload.$id, error);
            return {
              ...upload,
              previewUrl: '',
              fullSizeUrl: ''
            };
          }
        })
      );

      setUploads(uploadsWithPreview);
      setError(null);

      const newAddresses = {};
      for (const upload of uploadsWithPreview) {
        try {
          if (!upload.latitude || !upload.longitude) {
            newAddresses[upload.$id] = 'Location data missing';
            continue;
          }

          const addresses = await Location.reverseGeocodeAsync({
            latitude: upload.latitude,
            longitude: upload.longitude
          });

          if (addresses.length > 0) {
            const addr = addresses[0];
            newAddresses[upload.$id] = [
              addr.street,
              addr.city,
              addr.region,
              addr.country
            ].filter(part => part && part.trim() !== '').join(', ');
          } else {
            newAddresses[upload.$id] = 'Address not available';
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          newAddresses[upload.$id] = 'Error getting address';
        }
      }
      setAddresses(newAddresses);
    } catch (err) {
      console.error('Failed to fetch uploads:', err);
      setError('Failed to load your uploads. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }

    // Removed the console.log for previewUrl and fullSizeUrl as they are not directly available here
    // console.log('Generated URLs:', {
    //   preview: previewUrl,
    //   full: fullSizeUrl,
    //   valid: !!previewUrl 
    // });
  }, [user]);

  useEffect(() => {
    if (!authChecked || !user) return;

    const loadData = async () => {
      setLoading(true);
      await fetchUploads();
    };

    loadData();
  }, [authChecked, user, fetchUploads]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUploads();
  }, [fetchUploads]);

  const handleImagePress = (imageUrl) => {
    setSelectedImage(imageUrl);
    setFullScreenVisible(true);
  };

  if (!authChecked) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.container} safe={true}>
        <ThemedText style={styles.title}>Authentication Required</ThemedText>
        <ThemedText>Please sign in to view your dashboard</ThemedText>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={styles.container} safe={true}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading your uploads...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center' }]} safe={true}>
        <ThemedText style={[styles.errorText, { color: colors.warning }]}>{error}</ThemedText> {/* Use themed warning color */}
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]} // Use themed primary color
          onPress={async () => {
            if (await verifyLocationPermissions()) {
              onRefresh();
            }
          }}
        >
          <ThemedText style={styles.retryButtonText}>
            {error.includes('permission') ? 'Grant Permission & Retry' : 'Try Again'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (uploads.length === 0) {
    return (
      <ThemedView style={styles.container} safe={true}>
        <ThemedText style={styles.title}>No Uploads Yet</ThemedText>
        <ThemedText>Upload your first image to see it here!</ThemedText>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: colors.primary }]} // Use themed primary color
          onPress={onRefresh}
        >
          <ThemedText style={styles.refreshButtonText}>Refresh</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container} safe={true}>
      <ThemedText title={true} style={styles.title}>Your Uploads</ThemedText>

      <FlatList
        data={uploads}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <ImageCard
            previewUrl={item.previewUrl}
            fullSizeUrl={item.fullSizeUrl}
            timestamp={item.timestamp}
            address={addresses[item.$id]}
            location={item.latitude && item.longitude ? {
              latitude: item.latitude,
              longitude: item.longitude
            } : null}
            onImagePress={handleImagePress}
            status={item.Status.toLowerCase()}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]} // Use themed primary color
            tintColor={colors.primary} // Use themed primary color
          />
        }
      />

      <FullScreenImageModal
        visible={fullScreenVisible}
        imageUrl={selectedImage}
        onClose={() => setFullScreenVisible(false)}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: '#FEFAE0', // REMOVED - ThemedView handles this
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  errorText: {
    // color: Colors.error, // REMOVED - Set inline below
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    // backgroundColor: Colors.primary, // REMOVED - Set inline below
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white', // Can remain white or be themed
    fontWeight: 'bold',
  },
  refreshButton: {
    // backgroundColor: Colors.primary, // REMOVED - Set inline below
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white', // Can remain white or be themed
    fontWeight: 'bold',
  },
});

export default ImagesScreen;