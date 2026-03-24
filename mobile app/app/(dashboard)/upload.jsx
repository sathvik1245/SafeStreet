import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet, Alert, Modal, ActivityIndicator, Platform } from 'react-native';
import { databases, storage, AppwriteID } from '../../lib/appwrite';
import { useUser } from '../../hooks/useUser';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import { Linking } from 'react-native';

import { useTheme } from '../../contexts/ThemeContext.js'; // Adjust path as necessary

// TODO: Replace these with your own Appwrite project credentials
const DATABASE_ID = 'YOUR_DATABASE_ID_HERE';
const COLLECTION_ID = 'YOUR_COLLECTION_ID_HERE';
const BUCKET_ID = 'YOUR_BUCKET_ID_HERE';
const PROJECT_ID = 'YOUR_PROJECT_ID_HERE';
const ENDPOINT = 'https://fra.cloud.appwrite.io/v1';

const HF_API_URL = "https://professionalhuggies-safestreet.hf.space/classify_image/";
// IMPORTANT: Replace this with the actual URL where your FastAPI model is deployed
const YOLO_MODEL_API_URL = "https://roadrobo-roadrobo-backend.hf.space/process-image/";

const Upload = () => {
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState(null);
  const [manualAddress, setManualAddress] = useState('');
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false); // Overall upload to Appwrite Storage/DB
  const [checkingImage, setCheckingImage] = useState(false); // HF API check
  const [processingYolo, setProcessingYolo] = useState(false); // YOLO API processing

  const { user, authChecked } = useUser();
  const { colors } = useTheme();

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
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Authentication Required</ThemedText>
        <ThemedText>Please sign in to upload photos</ThemedText>
      </ThemedView>
    );
  }

  const verifyMediaPermissions = async () => {
    if (Platform.OS !== 'web') {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!cameraPermission.granted || !galleryPermission.granted) {
        Alert.alert(
          'Permission required',
          'Please allow camera and gallery access in settings',
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
    }
    return true;
  };

  const verifyLocationPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Location permission required',
        'Enable location access in settings',
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

  const checkIfRoadImage = async (uri) => {
    setCheckingImage(true);
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('Image file not found for classification');
      }

      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        name: 'image.jpg',
        type: 'image/jpeg',
      });

      const response = await fetch(HF_API_URL, {
        method: 'POST',
        headers: {},
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('Road classification API response (Hugging Face):', data);

      if (data && typeof data.is_road_image === 'boolean') {
        return data.is_road_image;
      } else {
        throw new Error("Invalid response from classification API.");
      }

    } catch (error) {
      console.error("Error checking if image is road:", error);
      Alert.alert('Image Check Failed', `Could not verify image content. Please try again. Error: ${error.message}`);
      return false;
    } finally {
      setCheckingImage(false);
    }
  };


  const handleTakePhoto = async () => {
    try {
      const hasMediaPermission = await verifyMediaPermissions();
      const hasLocationPermission = await verifyLocationPermissions();

      if (!hasMediaPermission || !hasLocationPermission) {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled) {
        const selectedImageUri = result.assets[0].uri;
        setImageUri(selectedImageUri);

        const isRoad = await checkIfRoadImage(selectedImageUri);
        if (!isRoad) {
          Alert.alert(
            'Not a Road Image',
            'The uploaded image does not appear to be a road. Please upload an image of a road.'
          );
          setImageUri(null);
          setLocation(null);
        }
      }
    } catch (error) {
      Alert.alert('Error taking photo', error.message);
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      const hasMediaPermission = await verifyMediaPermissions();
      if (!hasMediaPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled) {
        const selectedImageUri = result.assets[0].uri;
        setImageUri(selectedImageUri);

        const isRoad = await checkIfRoadImage(selectedImageUri);
        if (isRoad) {
          setAddressModalVisible(true);
        } else {
          Alert.alert(
            'Not a Road Image',
            'The selected image does not appear to be a road. Please select an image of a road.'
          );
          setImageUri(null);
        }
      }
    } catch (error) {
      Alert.alert('Gallery Error', error.message);
    }
  };

  const handleAddressSubmit = async () => {
    if (!manualAddress.trim()) {
      Alert.alert('Please enter an address');
      return;
    }

    try {
      const hasLocationPermission = await verifyLocationPermissions();
      if (!hasLocationPermission) return;

      const geocoded = await Location.geocodeAsync(manualAddress);
      if (geocoded.length > 0) {
        setLocation({
          latitude: geocoded[0].latitude,
          longitude: geocoded[0].longitude
        });
        setAddressModalVisible(false);
      } else {
        Alert.alert('Address not found', 'Please enter a valid address');
      }
    } catch (error) {
      Alert.alert('Geocoding Error', 'Could not find location for this address');
    }
  };

  const getAndroidSafeUri = async (uri) => {
    if (Platform.OS === 'android' && uri.startsWith('content://')) {
      const result = await FileSystem.getContentUriAsync(uri);
      return result.uri;
    }
    return uri;
  };

  const handleUpload = async () => {
    if (!imageUri || !location || uploading || checkingImage || processingYolo) return;

    setUploading(true); // Start overall upload process

    let appwriteFileId = null; // To store the ID from Appwrite Storage

    try {
      const safeUri = await getAndroidSafeUri(imageUri);

      const fileInfo = await FileSystem.getInfoAsync(safeUri);
      if (!fileInfo.exists) {
        throw new Error('Image file not found');
      }

      // --- 1. Upload to Appwrite Storage ---
      const appwriteStorageFormData = new FormData();
      const fileName = `photo_${Date.now()}.jpg`;
      appwriteFileId = AppwriteID.unique(); // Generate a unique ID for Appwrite Storage

      appwriteStorageFormData.append('fileId', appwriteFileId);
      appwriteStorageFormData.append('file', {
        uri: safeUri,
        name: fileName,
        type: 'image/jpeg',
      });

      console.log('Starting Appwrite Storage upload...');
      const appwriteStorageResponse = await fetch(
        `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files`,
        {
          method: 'POST',
          headers: {
            'X-Appwrite-Project': PROJECT_ID,
          },
          body: appwriteStorageFormData,
        }
      );

      const appwriteStorageData = await appwriteStorageResponse.json();

      if (!appwriteStorageResponse.ok || !appwriteStorageData.$id) {
        const errorMsg = appwriteStorageData.message || 'Appwrite storage upload failed';
        throw new Error(`Appwrite storage error: ${errorMsg}`);
      }

      appwriteFileId = appwriteStorageData.$id;
      console.log('Image uploaded to Appwrite Storage with ID:', appwriteFileId);

      // --- 2. Create initial document in Appwrite Database ---
      console.log('Creating initial document in Appwrite Database...');
      const dbDocumentResult = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        AppwriteID.unique(), // Use a new unique ID for the document itself
        {
          userId: user.$id,
          imageId: appwriteFileId, // Link to the image in Appwrite Storage
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: new Date().toISOString(),
          Status: 'pending' // Set initial status
        }
      );
      console.log('Appwrite DB document created successfully with ID:', dbDocumentResult.$id);

      // --- 3. Send to YOLO Model API (after Appwrite DB creation) ---
      setProcessingYolo(true); // Indicate YOLO processing has started
      console.log('Sending image to YOLO API...');

      const yoloApiFormData = new FormData();
      yoloApiFormData.append('file', {
        uri: safeUri,
        name: fileName,
        type: 'image/jpeg',
      });
      yoloApiFormData.append('original_image_id', appwriteFileId); // Send the Appwrite image ID

      const yoloApiResponse = await fetch(YOLO_MODEL_API_URL, {
        method: 'POST',
        headers: {},
        body: yoloApiFormData,
      });

      const yoloApiData = await yoloApiResponse.json();

      if (!yoloApiResponse.ok) {
        console.error('YOLO API response error:', yoloApiData);
        Alert.alert('Upload Warning', `Image uploaded but AI model processing failed: ${yoloApiData.detail || 'Unknown error'}`);
      } else {
        console.log('YOLO API processing successful:', yoloApiData);
        Alert.alert('Upload Successful!', 'Your road image has been uploaded and sent for AI processing.');
      }

      // Reset form fields regardless of YOLO API success/failure
      setImageUri(null);
      setLocation(null);
      setManualAddress('');

    } catch (error) {
      console.error('Overall Upload Error:', error);
      Alert.alert('Upload Failed', error.message);
    } finally {
      setUploading(false); // Overall upload process finished
      setProcessingYolo(false); // YOLO processing finished
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText title={true} style={styles.title}>Upload Image</ThemedText>

      {/* Show combined loading indicator for all processes */}
      {(checkingImage || uploading || processingYolo) && (
        <View style={[styles.checkingOverlay, { backgroundColor: colors.background, opacity: 0.8 }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          {checkingImage && <ThemedText style={styles.checkingText}>Verifying image...</ThemedText>}
          {uploading && !checkingImage && !processingYolo && <ThemedText style={styles.checkingText}>Uploading to Appwrite...</ThemedText>}
          {processingYolo && !checkingImage && <ThemedText style={styles.checkingText}>Sending to AI model...</ThemedText>}
        </View>
      )}

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
      )}

      <ThemedView style={styles.locationContainer}>
        {location ? (
          <ThemedText style={styles.locationText}>
            Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </ThemedText>
        ) : (
          <ThemedText style={styles.locationText}>No location selected</ThemedText>
        )}
      </ThemedView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleTakePhoto}
          disabled={checkingImage || uploading || processingYolo}
        >
          <ThemedText style={styles.buttonText}>Take Photo</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleChooseFromGallery}
          disabled={checkingImage || uploading || processingYolo}
        >
          <ThemedText style={styles.buttonText}>Choose from Gallery</ThemedText>
        </TouchableOpacity>
      </View>

      <Modal visible={addressModalVisible} animationType="slide">
        <ThemedView style={styles.modalContainer}>
          <ThemedText style={styles.modalTitle}>Enter Image Location</ThemedText>

          <TextInput
            style={[styles.addressInput, { backgroundColor: '#fff', color: '#000', borderColor: colors.iconColor }]}
            placeholder="Enter full address (e.g., 123 Main St, City, Country)"
            placeholderTextColor={'#000'}
            value={manualAddress}
            onChangeText={setManualAddress}
            multiline
            numberOfLines={3}
            autoFocus
          />

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.warning }]}
              onPress={() => setAddressModalVisible(false)}
            >
              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleAddressSubmit}
            >
              <ThemedText style={styles.buttonText}>Submit Location</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </Modal>

      <TouchableOpacity
        style={[
          styles.uploadButton,
          { backgroundColor: colors.uploadEnabled },
          (!imageUri || !location || uploading || checkingImage || processingYolo) && { backgroundColor: colors.uiBackground }
        ]}
        onPress={handleUpload}
        disabled={!imageUri || !location || uploading || checkingImage || processingYolo}
      >
        {(uploading || checkingImage || processingYolo) ? (
          <ActivityIndicator color="white" />
        ) : (
          <ThemedText style={styles.uploadButtonText}>Upload Image</ThemedText>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  previewImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  locationContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
  },
  uploadButton: {
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  addressInput: {
    height: 100,
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  checkingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  checkingText: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default Upload;
