import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useVideoPlayer, VideoView } from 'expo-video';
import { databaseService, Application } from '@/services/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

// Optimized Video Component wrapping the SDK 55 expo-video player
function AuditionPlayer({ videoUrl, onPlayerReady }: { videoUrl: string; onPlayerReady?: () => void }) {
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
    p.play();
    if (onPlayerReady) onPlayerReady();
  });

  return (
    <View className="w-full h-72 bg-black border-b border-border relative">
      <VideoView 
        player={player} 
        style={{ width: '100%', height: '100%' }} 
        fullscreenOptions={{ enable: true }}
        allowsPictureInPicture
      />
    </View>
  );
}

export default function ApplicantsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { roleId } = useLocalSearchParams<{ roleId: string }>();

  // Tracks the index of the applicant currently being viewed
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch role context details
  const { data: role } = useQuery({
    queryKey: ['role', roleId],
    queryFn: () => databaseService.getRoleById(roleId as string),
    enabled: !!roleId,
  });

  // Fetch applications for this role via React Query
  const { data: applicants, isLoading, refetch } = useQuery({
    queryKey: ['applicants', roleId],
    queryFn: () => databaseService.getApplicationsForRole(roleId as string),
    enabled: !!roleId,
  });

  const currentApp: Application | undefined = applicants?.[currentIndex];

  // Mutation to update audition statuses
  const statusMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: string; status: Application['status'] }) =>
      databaseService.updateApplicationStatus(appId, status),
    onSuccess: (data) => {
      // Invalidate queries so dashboards keep correct shortlist tallies
      queryClient.invalidateQueries({ queryKey: ['applicants', roleId] });
      queryClient.invalidateQueries({ queryKey: ['director_applications'] });
      
      // Auto-advance to the next candidate if there are more
      if (applicants && currentIndex < applicants.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    },
    onError: () => {
      Alert.alert('Error', 'Unable to record evaluation state.');
    }
  });

  // Mark applicant as Viewed the first time the video loads
  useEffect(() => {
    if (currentApp && currentApp.status === 'Submitted') {
      statusMutation.mutate({ appId: currentApp.id, status: 'Viewed' });
    }
  }, [currentApp]);

  const handleAction = (status: 'Shortlisted' | 'Rejected') => {
    if (!currentApp) return;
    statusMutation.mutate({ appId: currentApp.id, status });
  };

  const handleNext = () => {
    if (applicants && currentIndex < applicants.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background p-6">
        <Skeleton height={50} className="mb-6" />
        <Skeleton height={280} className="mb-6" />
        <Skeleton height={150} className="mb-6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top Header bar */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-border bg-[#0B0B0B]">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-8 h-8 rounded-full border border-border items-center justify-center mr-4"
          >
            <Text className="text-white text-sm font-bold">←</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-white text-base font-bold tracking-tight">Review Auditions</Text>
            <Text className="text-muted text-[10px] mt-0.5">{role?.project_title} • {role?.role_title}</Text>
          </View>
        </View>

        {applicants && applicants.length > 0 && (
          <Text className="text-accent text-xs font-bold bg-accent/5 px-2.5 py-1 border border-accent/15 rounded-md">
            {currentIndex + 1} / {applicants.length}
          </Text>
        )}
      </View>

      {!currentApp ? (
        /* Empty Applicants State */
        <View className="flex-grow items-center justify-center p-6">
          <Text className="text-5xl mb-4">📭</Text>
          <Text className="text-white font-bold text-lg">No Applications Received Yet</Text>
          <Text className="text-muted text-xs mt-1.5 text-center px-10 leading-relaxed">
            As soon as actors submit their self-tape video auditions, they will appear in this high-speed review player immediately.
          </Text>
          <Button 
            label="BACK TO DASHBOARD" 
            variant="secondary"
            size="sm"
            containerClassName="mt-6"
            onPress={() => router.back()} 
          />
        </View>
      ) : (
        <View className="flex-1 justify-between">
          {/* Top Video Player */}
          <AuditionPlayer 
            videoUrl={currentApp.video_url} 
            key={currentApp.id} // Forces re-render of player when candidate index shifts
          />

          {/* Actor Profile Info scroll sheet */}
          <ScrollView 
            className="flex-1 px-6 mt-4" 
            contentContainerStyle={{ paddingBottom: 25 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Actor Profile Row */}
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-white text-2xl font-extrabold tracking-tight">
                  {currentApp.actor_name}
                </Text>
                
                <View className="flex-row items-center gap-2 mt-1">
                  <Text className="text-[10px] text-accent font-bold uppercase tracking-wider bg-accent/5 px-2 py-0.5 border border-accent/15 rounded-md">
                    ★ Trust Score 92%
                  </Text>
                  
                  <Text className="text-muted text-xs">
                    {currentApp.actor_gender} • {currentApp.actor_age} Years
                  </Text>
                </View>
              </View>

              <Text className="text-muted text-xs">📍 {currentApp.actor_location}</Text>
            </View>

            {/* Application current status chip */}
            <View className="flex-row items-center gap-2 mb-4 bg-card border border-border p-3.5 rounded-2xl">
              <Text className="text-xs">🏷️</Text>
              <Text className="text-muted text-xs flex-grow">
                Current evaluation state: <Text className="text-accent font-bold">{currentApp.status}</Text>
              </Text>
            </View>

            {/* Experience and Skills Card */}
            <Card className="bg-card border-border p-5 mb-4">
              <Text className="text-white text-xs font-bold uppercase tracking-widest mb-2 border-b border-border/40 pb-1.5">
                On-Screen Experience
              </Text>
              <Text className="text-muted text-xs leading-relaxed mb-4">
                {currentApp.actor_experience || 'No experience summary inputted.'}
              </Text>

              <Text className="text-white text-xs font-bold uppercase tracking-widest mb-2 border-b border-border/40 pb-1.5">
                Key Acting Skills & Dialects
              </Text>
              <Text className="text-muted text-xs leading-relaxed">
                {currentApp.actor_skills || 'No specific acting skills highlighted.'}
              </Text>
            </Card>

            {/* Navigation buttons to manually skip candidates */}
            <View className="flex-row justify-between gap-3 mt-2">
              <Button
                label="← PREV CANDIDATE"
                variant="text"
                size="sm"
                disabled={currentIndex === 0}
                onPress={handlePrev}
              />
              <Button
                label="NEXT CANDIDATE →"
                variant="text"
                size="sm"
                disabled={currentIndex === (applicants?.length || 1) - 1}
                onPress={handleNext}
              />
            </View>
          </ScrollView>

          {/* Sticky Quick-Action Bar */}
          <View className="px-6 py-4 border-t border-border bg-[#0B0B0B] flex-row gap-3">
            {/* REJECT BUTTON */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleAction('Rejected')}
              className="flex-1 bg-red-950 border border-red-500/35 py-4.5 rounded-2xl items-center justify-center"
            >
              <Text className="text-red-400 font-extrabold text-xs uppercase tracking-widest">
                ❌ PASS
              </Text>
            </TouchableOpacity>

            {/* SHORTLIST BUTTON */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleAction('Shortlisted')}
              className="flex-2 bg-accent py-4.5 rounded-2xl items-center justify-center"
            >
              <Text className="text-background font-black text-xs uppercase tracking-wider">
                ⭐ SHORTLIST TALENT
              </Text>
            </TouchableOpacity>

            {/* QUICK MESSAGE BUTTON */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => Alert.alert('Chat Workspace', `Initial message sent to ${currentApp.actor_name}. WhatsApp backup synced.`)}
              className="w-14 bg-card border border-border rounded-2xl items-center justify-center"
            >
              <Text className="text-white text-base">💬</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
