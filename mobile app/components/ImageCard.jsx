import React, { useState } from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Linking, 
  ActivityIndicator 
} from 'react-native';
import ThemedText from './ThemedText';
// --- REMOVE Colors import ---
// import { Colors } from '../constants/Colors'; 
// --- NEW: Import useTheme hook ---
import { useTheme } from '../contexts/ThemeContext.js'; // Adjust path as necessary

// STATUS_CONFIG should ideally be dynamic based on theme, or its colors should be themed.
// For simplicity, we'll define it inside the component to access 'colors' directly.
// If these status colors need to be different per theme, define them in Colors.js.
const ImageCard = ({ previewUrl, fullSizeUrl, timestamp, address, location, onImagePress, status }) => {
  const [imageError, setImageError] = useState(false);
  const [loadingImage, setLoadingImage] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(previewUrl || fullSizeUrl || '');

  // --- NEW: Get theme colors ---
  const { colors } = useTheme();

  // Define STATUS_CONFIG inside the component to use 'colors'
  const STATUS_CONFIG = {
    pending: {
      label: 'Pending Approval',
      color: '#E1B642', // Use themed warning for pending
      textColor: colors.text // Use themed text color
    },
    in_progress: {
      label: 'In Progress',
      color: '#6CA3CB', // Use themed primary for in_progress
      textColor: 'white' // Keep white for contrast on primary
    },
    resolved: {
      label: 'Resolved',
      color: '#2A8C55',   // Keep a specific green, or add a 'success' color to Colors.js
      textColor: 'white'
    },
    rejected: {
      label: 'Rejected',
      color: '#C23B22',   // Keep a specific red, or add an 'error' color to Colors.js
      textColor: 'white'
    },
    default: {
      label: 'Status Unknown',
      color: colors.uiBackground, // Use a neutral themed background
      textColor: colors.title // Use themed text color
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const openInMaps = () => {
    if (!location) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    Linking.openURL(url);
  };

  const handleImageError = () => {
    console.log('Image load error for:', previewUrl);
    setImageError(true);
    
    // This fallback logic might need review if it's causing issues.
    // The original code had `setPreviewUrl` which is not a state variable here.
    // Assuming `setCurrentUrl` is the intended state to update.
    if (previewUrl && currentUrl === previewUrl && fullSizeUrl) {
      console.log('Trying fallback URL:', fullSizeUrl);
      setImageError(false);
      setCurrentUrl(fullSizeUrl); // Try full-size if preview fails
    } else {
      setImageError(true); // If no fallback or fallback already tried, set error
    }
  };

  return (
    <View style={[styles.card, {backgroundColor: colors.background}]}>
      <TouchableOpacity onPress={() => onImagePress(fullSizeUrl)}>
        {previewUrl ? (
          <View style={styles.imageContainer}>
            <Image 
              source={{ 
                uri: currentUrl,
                cache: 'reload',
                headers: {
                  Pragma: 'no-cache',
                  'Cache-Control': 'no-cache',
                }
              }}
              style={[styles.image, {backgroundColor: colors.background}]} // Themed image background
              resizeMode="cover"
              onLoadStart={() => setLoadingImage(true)}
              onLoadEnd={() => setLoadingImage(false)}
              onError={handleImageError} // Use the defined handler
            />
            {loadingImage && (
              <View style={[styles.loadingOverlay, {backgroundColor: colors.background, opacity: 0.5}]}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.imagePlaceholder, {backgroundColor: colors.uiBackground}]}>
            <ThemedText style={styles.placeholderText}>Image Unavailable</ThemedText>
          </View>
        )}
      </TouchableOpacity>
      
      <View style={styles.details}>
        <ThemedText style={[styles.timestamp, {color: colors.text}]}>
          {formatDate(timestamp)}
        </ThemedText>
        
        {address ? (
          <ThemedText style={styles.address} numberOfLines={2}>
            {address}
          </ThemedText>
        ) : location ? (
          <ThemedText style={[styles.coordinates, {color: colors.text}]}>
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </ThemedText>
        ) : (
          <ThemedText style={[styles.coordinates, {color: colors.text}]}>
            Location data missing
          </ThemedText>
        )}

        {status && (
          <View style={[
            styles.statusBadge, 
            { 
              backgroundColor: STATUS_CONFIG[status]?.color || STATUS_CONFIG.default.color,
              marginTop: 1,
              marginBottom: 10
            }
          ]}>
            <ThemedText style={[
              styles.statusText,
              { color: STATUS_CONFIG[status]?.textColor || STATUS_CONFIG.default.textColor }
            ]}>
              {STATUS_CONFIG[status]?.label || STATUS_CONFIG.default.label}
            </ThemedText>
          </View>
        )}
        
        {location && (
          <TouchableOpacity 
            style={[styles.mapButton, {backgroundColor: colors.primary}]} // --- CHANGE: Themed map button background ---
            onPress={openInMaps}
          >
            <ThemedText style={styles.mapButtonText}>Open in Maps</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    // backgroundColor: Colors.cardBackground, // REMOVED - Themed inline
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000', // Shadow can remain fixed or be themed if desired
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    // backgroundColor: '#f0f0f0', // REMOVED - Themed inline
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    // backgroundColor: '#e0e0e0', // REMOVED - Themed inline
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    // color: '#666', // ThemedText will handle this
    fontSize: 16,
  },
  details: {
    padding: 16,
  },
  timestamp: {
    fontSize: 14,
    // color: Colors.textSecondary, // REMOVED - Themed inline
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  coordinates: {
    fontSize: 14,
    // color: Colors.textSecondary, // REMOVED - Themed inline
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  mapButton: {
    // backgroundColor: Colors.primary, // REMOVED - Themed inline
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  mapButtonText: {
    color: 'white', // Keep white for contrast on primary button
    fontSize: 14,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  loadingOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0,0,0,0.1)', // REMOVED - Themed inline
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ImageCard;