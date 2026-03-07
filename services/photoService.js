import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export const pickAndUploadPhoto = async (userId) => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Permission to access photos is required');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) {
    return null;
  }

  return await uploadPhoto(result.assets[0].uri, userId);
};

export const takeAndUploadPhoto = async (userId) => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Permission to access camera is required');
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) {
    return null;
  }

  return await uploadPhoto(result.assets[0].uri, userId);
};

export const uploadPhoto = async (uri, userId) => {
  const compressedImage = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 800, height: 800 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );

  const base64 = await readAsStringAsync(compressedImage.uri, {
    encoding: EncodingType.Base64,
  });

  const filename = `${userId}/${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from('profile-photos')
    .upload(filename, decode(base64), {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(filename);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ photo_url: data.publicUrl })
    .eq('id', userId);

  if (updateError) throw updateError;

  return data.publicUrl;
};

export const deletePhoto = async (url) => {
  if (!url) return;

  const parts = url.split('/profile-photos/');
  if (parts.length < 2) return;

  const filename = parts[1];

  const { error } = await supabase.storage
    .from('profile-photos')
    .remove([filename]);

  if (error) throw error;
};

export const getPhotoUrl = (userId, filename) => {
  const { data } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(`${userId}/${filename}`);

  return data.publicUrl;
};
