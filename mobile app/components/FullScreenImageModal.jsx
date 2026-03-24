// components/FullScreenImageModal.jsx
import React from 'react';
import { Modal, View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import ThemedText from './ThemedText';
import { Colors } from '../constants/Colors';
import { AntDesign } from '@expo/vector-icons';

const FullScreenImageModal = ({ visible, imageUrl, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.fullImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholder}>
            <ThemedText>Image not available</ThemedText>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <AntDesign name="closecircle" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
});

export default FullScreenImageModal;