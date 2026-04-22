import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

const BUCKET = 'profile-photos';
const SIGNED_URL_TTL_SECONDS = 3600;

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

  const path = `${userId}/${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, decode(base64), {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ photo_url: path })
    .eq('id', userId);

  if (updateError) throw updateError;

  return await resolvePhotoUrl(path);
};

// Converts a stored photo_url value into something <Image> can render.
// - Full http(s) URLs (legacy uploads, seed data, placeholders): pass through
// - Anything else: treat as a path in the profile-photos bucket and sign it
export const resolvePhotoUrl = async (value) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(value, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
};

// Resolve photo_url on a profile object (or any object with photo_url).
// Returns a new object — does not mutate.
export const resolveProfilePhoto = async (profile) => {
  if (!profile) return profile;
  const photo_url = await resolvePhotoUrl(profile.photo_url);
  return { ...profile, photo_url };
};

// Resolve an array of profiles in parallel.
export const resolveProfilePhotos = async (profiles) => {
  if (!profiles?.length) return profiles || [];
  return Promise.all(profiles.map(resolveProfilePhoto));
};

export const deletePhoto = async (pathOrUrl) => {
  if (!pathOrUrl) return;

  let path = pathOrUrl;
  if (/^https?:\/\//i.test(pathOrUrl)) {
    const parts = pathOrUrl.split(`/${BUCKET}/`);
    if (parts.length < 2) return;
    path = parts[1].split('?')[0];
  }

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
};
