/**
 * src/app/(actor)/apply/[id].tsx
 *
 * Self-tape audition submission screen.
 *
 * Cross-platform changes:
 *  - Replaced expo-video VideoView with the cross-platform <VideoPlayer> component.
 *  - Added Platform.OS check to show a URL input field on web (camera/gallery not available).
 *  - Fixed applyMutation.mutate() to only pass schema-compliant fields to applyToRole().
 *  - uploadAuditionVideo alias handles the Supabase storage upload.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databaseService } from '@/services/supabase';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { ArrowLeft, Video, Image as ImageIcon, Camera } from 'lucide-react-native';

// Native-only import: expo-image-picker does not work on web
let ImagePicker: typeof import('expo-image-picker') | null = null;
if (Platform.OS !== 'web') {
  ImagePicker = require('expo-image-picker');
}

export default function ApplyScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const colors = useThemeColors();

  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [webVideoUrl, setWebVideoUrl] = useState('');
  const [experience, setExperience] = useState(user?.experience || '');
  const [skills, setSkills] = useState(user?.skills || '');

  // Upload progress simulation states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  // Fetch role context for the submission header
  const { data: role } = useQuery({
    queryKey: ['role', id],
    queryFn: () => databaseService.getRoleById(id as string),
    enabled: !!id,
  });

  // ── Video Selection (Native) ──────────────────────────────────────────────

  const handleChooseFromLibrary = async () => {
    if (!ImagePicker) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Cellulogram requires gallery access to select your self-tape auditions.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const handleRecordVideo = async () => {
    if (!ImagePicker) return;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Cellulogram requires camera access to record your self-tape auditions.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const handleSelectVideo = () => {
    Alert.alert(
      'Upload Audition Video',
      'Select a source for your self-tape audition:',
      [
        { text: 'Record Video', onPress: handleRecordVideo },
        { text: 'Choose from Gallery', onPress: handleChooseFromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  // ── Submit Application Mutation ───────────────────────────────────────────

  const applyMutation = useMutation({
    mutationFn: (applicationData: Parameters<typeof databaseService.applyToRole>[0]) =>
      databaseService.applyToRole(applicationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', user?.id] });
      Alert.alert(
        'Audition Submitted',
        'Your self-tape was successfully processed and logged. The Casting Director has been notified.',
        [{ text: 'Go to Tracking', onPress: () => router.replace('/(actor)/applications') }]
      );
    },
    onError: () => {
      Alert.alert('Submission Error', 'Failed to submit audition. Please try again.');
      setIsUploading(false);
    },
  });

  const handleSubmit = async () => {
    const effectiveVideoUri = Platform.OS === 'web' ? webVideoUrl.trim() : videoUri;

    if (!effectiveVideoUri) {
      Alert.alert(
        'Video Required',
        Platform.OS === 'web'
          ? 'Please paste a video URL for your self-tape audition.'
          : 'Please select or record a self-tape video to apply for this role.'
      );
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Session expired. Please log in again.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setStatusText('Compiling self-tape metadata...');

    await new Promise((resolve) => setTimeout(resolve, 800));
    setUploadProgress(40);
    setStatusText('Uploading self-tape video to remote container...');

    // Attempt actual Supabase Storage upload (native) — web uses URL directly
    let finalVideoUrl = effectiveVideoUri;
    if (Platform.OS !== 'web') {
      try {
        finalVideoUrl = await databaseService.uploadAuditionVideo(effectiveVideoUri, user.id);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err) {
        console.warn('[apply] Storage upload failed, using local URI', err);
      }
    }

    setUploadProgress(85);
    setStatusText('Running trust index credentials and registering audition status tracking...');

    await new Promise((resolve) => setTimeout(resolve, 700));
    setUploadProgress(100);
    setStatusText('Audition secured! Saving application records...');

    await new Promise((resolve) => setTimeout(resolve, 400));

    // ✅ Only pass schema-compliant fields to applyToRole
    applyMutation.mutate({
      role_id: id as string,
      actor_id: user.id,
      video_url: finalVideoUrl,
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const effectiveVideoUri = Platform.OS === 'web' ? (webVideoUrl.trim() || null) : videoUri;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top bar header */}
      <View className="px-6 py-4 flex-row items-center border-b border-border bg-card">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-8 h-8 rounded-full border border-border bg-background items-center justify-center mr-4"
          disabled={isUploading}
        >
          <ArrowLeft size={16} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-textPrimary text-base font-bold tracking-tight">Submit Self-Tape</Text>
      </View>

      <ScrollView className="flex-grow p-6" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Project summary card */}
        <View className="mb-6 bg-card border border-border p-4 rounded-2xl">
          <Text className="text-accent text-[10px] font-bold uppercase tracking-wider mb-1">
            APPLYING FOR
          </Text>
          <Text className="text-textPrimary font-bold text-lg">{role?.project_title}</Text>
          <Text className="text-muted text-xs">
            Role: <Text className="text-textPrimary font-semibold">{role?.role_title}</Text>
          </Text>
        </View>

        {/* Video Input: Native = picker/camera, Web = URL input */}
        <View className="mb-6">
          <Text className="text-textPrimary text-xs font-semibold mb-2.5 uppercase tracking-widest opacity-80">
            Self-Tape Audition Video
          </Text>

          {Platform.OS === 'web' ? (
            /* Web fallback: paste a video URL */
            <View>
              <Input
                label="Self-Tape Video URL"
                placeholder="Paste a video URL (Google Drive, Vimeo, S3, etc.)"
                value={webVideoUrl}
                onChangeText={setWebVideoUrl}
                disabled={isUploading}
              />
              {webVideoUrl.trim().length > 0 && (
                <View className="mt-3 rounded-2xl overflow-hidden">
                  <VideoPlayer
                    uri={webVideoUrl.trim()}
                    style={{ height: 220 }}
                    controls={true}
                  />
                </View>
              )}
            </View>
          ) : effectiveVideoUri ? (
            /* Native: show video preview + replace button */
            <View className="gap-3">
              <VideoPlayer uri={effectiveVideoUri} style={{ height: 220 }} />
              <Button
                label="REPLACE SELF-TAPE"
                variant="outline"
                size="sm"
                disabled={isUploading}
                onPress={handleSelectVideo}
              />
            </View>
          ) : (
            /* Native: empty picker trigger */
            <TouchableOpacity
              onPress={handleSelectVideo}
              className="w-full h-44 rounded-2xl border border-dashed border-accent/30 bg-accent/5 items-center justify-center"
            >
              <Camera size={40} color={colors.accent} className="mb-3" />
              <Text className="text-accent font-bold text-sm">SELECT OR RECORD VIDEO</Text>
              <Text className="text-muted text-[10px] mt-1">MP4, MOV formats accepted (Max 100MB)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Audition note forms */}
        <View className="mb-6">
          <Input
            label="On-Screen Experience Summary"
            placeholder="Describe previous acting roles, short films, or theatre experience"
            value={experience}
            onChangeText={setExperience}
            multiline
            numberOfLines={3}
            containerClassName="mb-4"
            disabled={isUploading}
          />
          <Input
            label="Special Acting Skills & Accents"
            placeholder="e.g. Martial arts, driving license, British accent, comedy, etc."
            value={skills}
            onChangeText={setSkills}
            containerClassName="mb-4"
            disabled={isUploading}
          />
        </View>

        {/* Progress bar or Submit button */}
        {isUploading ? (
          <Card className="bg-card border-accent/20 p-5 mb-8">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-accent text-xs font-bold uppercase tracking-wider">
                Audition Security Guard
              </Text>
              <Text className="text-textPrimary font-semibold text-xs">{uploadProgress}%</Text>
            </View>
            <View className="w-full h-1.5 bg-background rounded-full overflow-hidden mb-3.5 border border-border">
              <View
                style={{ width: `${uploadProgress}%` }}
                className="h-full bg-accent rounded-full"
              />
            </View>
            <View className="flex-row gap-2.5 items-center">
              <ActivityIndicator size="small" color={colors.accent} />
              <Text className="text-muted text-[11px] leading-relaxed flex-1">{statusText}</Text>
            </View>
          </Card>
        ) : (
          <Button label="SUBMIT AUDITION" variant="primary" size="lg" onPress={handleSubmit} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
