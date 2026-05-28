import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseService } from '@/services/supabase';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/store/authStore';

export default function ApplicationsScreen() {
  const { user } = useAuthStore();

  // Fetch submitted applications via React Query
  const { data: applications, isLoading, refetch } = useQuery({
    queryKey: ['applications', user?.id],
    queryFn: () => databaseService.getApplicationsByActor(user?.id || ''),
    enabled: !!user?.id,
  });

  // Simple helper to match status colors
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'Submitted':
        return { label: 'Submitted', color: '#8E8E93', bg: 'bg-[#8E8E93]/10', border: 'border-[#8E8E93]/20', step: 1 };
      case 'Viewed':
        return { label: 'Viewed', color: '#007AFF', bg: 'bg-[#007AFF]/10', border: 'border-[#007AFF]/20', step: 2 };
      case 'Under Review':
        return { label: 'Under Review', color: '#FF9500', bg: 'bg-[#FF9500]/10', border: 'border-[#FF9500]/20', step: 3 };
      case 'Shortlisted':
        return { label: 'Shortlisted 🌟', color: '#D4AF37', bg: 'bg-[#D4AF37]/10', border: 'border-[#D4AF37]/20', step: 4 };
      case 'Meeting Scheduled':
        return { label: 'Meeting Scheduled 📅', color: '#5856D6', bg: 'bg-[#5856D6]/10', border: 'border-[#5856D6]/20', step: 4 };
      case 'Rejected':
        return { label: 'Passed', color: '#FF3B30', bg: 'bg-[#FF3B30]/10', border: 'border-[#FF3B30]/20', step: 4 };
      default:
        return { label: 'Pending', color: '#8E8E93', bg: 'bg-[#8E8E93]/10', border: 'border-[#8E8E93]/20', step: 1 };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header bar */}
      <View className="px-6 py-4 flex-row justify-between items-center border-b border-border bg-[#0B0B0B]">
        <View>
          <Text className="text-muted text-xs font-semibold uppercase tracking-widest">
            TRACK WORKSPACE
          </Text>
          <Text className="text-white text-xl font-bold mt-0.5">
            Your Applications
          </Text>
        </View>
        
        <Text className="text-accent text-xs font-semibold" onPress={() => refetch()}>
          Refresh 🔄
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6 mt-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#D4AF37" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Transparency Alert Box */}
        <Card className="bg-[#171717]/80 border-accent/20 p-4 mb-6">
          <View className="flex-row items-center gap-3">
            <Text className="text-xl">💡</Text>
            <Text className="text-muted text-xs leading-relaxed flex-1">
              Cellulogram guarantees total transparency. You will receive active notifications the micro-second a Casting Director plays or shortlists your self-tape.
            </Text>
          </View>
        </Card>

        {isLoading ? (
          <View className="gap-4">
            <Skeleton height={170} />
            <Skeleton height={170} />
          </View>
        ) : applications && applications.length > 0 ? (
          applications.map((app) => {
            const statusInfo = getStatusDetails(app.status);
            
            return (
              <Card key={app.id} className="mb-5 bg-card border-border">
                {/* Header Section */}
                <View className="flex-row justify-between items-start mb-2.5">
                  <View className="flex-1 pr-4">
                    <Text className="text-white text-base font-bold tracking-tight">
                      {app.project_title}
                    </Text>
                    <Text className="text-muted text-xs mt-0.5">
                      Role: <Text className="text-white font-medium">{app.role_title}</Text>
                    </Text>
                  </View>

                  <View className={`${statusInfo.bg} ${statusInfo.border} border px-2.5 py-1 rounded-md`}>
                    <Text style={{ color: statusInfo.color }} className="text-[10px] font-bold uppercase tracking-wider">
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                {/* Micro-transparency banner */}
                {app.viewed && app.status !== 'Shortlisted' && app.status !== 'Meeting Scheduled' && (
                  <View className="bg-sky-500/5 border border-sky-500/10 px-3 py-2 rounded-xl mb-4 flex-row items-center">
                    <Text className="text-xs mr-2">👀</Text>
                    <Text className="text-sky-400 text-xs font-semibold">
                      Your self-tape audition has been viewed by the casting director!
                    </Text>
                  </View>
                )}

                {app.status === 'Shortlisted' && (
                  <View className="bg-accent/5 border border-accent/15 px-3 py-2 rounded-xl mb-4 flex-row items-center">
                    <Text className="text-xs mr-2">⭐</Text>
                    <Text className="text-accent text-xs font-bold">
                      Congratulations! You have been shortlisted for this role.
                    </Text>
                  </View>
                )}

                {/* Audition Timeline Progression Lines */}
                <View className="border-t border-border/40 pt-4 pb-2">
                  <Text className="text-white text-[10px] font-bold uppercase tracking-widest mb-3 opacity-60">
                    Audition Milestones
                  </Text>

                  {/* Horizontal Track Nodes */}
                  <View className="flex-row justify-between items-center px-2">
                    {/* Step 1: Submitted */}
                    <View className="items-center">
                      <View className={`w-4 h-4 rounded-full items-center justify-center ${statusInfo.step >= 1 ? 'bg-accent' : 'bg-[#333]'}`}>
                        <Text className="text-[8px] text-background font-bold">✓</Text>
                      </View>
                      <Text className="text-[9px] text-white mt-1 font-medium">Submitted</Text>
                    </View>

                    {/* Bridge Line 1 */}
                    <View className={`flex-1 h-0.5 mx-1 ${statusInfo.step >= 2 ? 'bg-accent' : 'bg-[#333]'}`} />

                    {/* Step 2: Viewed */}
                    <View className="items-center">
                      <View className={`w-4 h-4 rounded-full items-center justify-center ${statusInfo.step >= 2 ? 'bg-accent' : 'bg-[#333]'}`}>
                        {statusInfo.step >= 2 && <Text className="text-[8px] text-background font-bold">✓</Text>}
                      </View>
                      <Text className="text-[9px] text-muted mt-1">Viewed</Text>
                    </View>

                    {/* Bridge Line 2 */}
                    <View className={`flex-1 h-0.5 mx-1 ${statusInfo.step >= 3 ? 'bg-accent' : 'bg-[#333]'}`} />

                    {/* Step 3: Review */}
                    <View className="items-center">
                      <View className={`w-4 h-4 rounded-full items-center justify-center ${statusInfo.step >= 3 ? 'bg-accent' : 'bg-[#333]'}`}>
                        {statusInfo.step >= 3 && <Text className="text-[8px] text-background font-bold">✓</Text>}
                      </View>
                      <Text className="text-[9px] text-muted mt-1">Review</Text>
                    </View>

                    {/* Bridge Line 3 */}
                    <View className={`flex-1 h-0.5 mx-1 ${statusInfo.step >= 4 ? 'bg-accent' : 'bg-[#333]'}`} />

                    {/* Step 4: Shortlisted/Decided */}
                    <View className="items-center">
                      <View className={`w-4 h-4 rounded-full items-center justify-center ${
                        statusInfo.step >= 4 
                          ? app.status === 'Rejected' 
                            ? 'bg-red-500' 
                            : 'bg-accent' 
                          : 'bg-[#333]'
                      }`}>
                        {statusInfo.step >= 4 && <Text className="text-[8px] text-background font-bold">✓</Text>}
                      </View>
                      <Text className="text-[9px] text-muted mt-1">
                        {app.status === 'Rejected' ? 'Passed' : 'Decision'}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            );
          })
        ) : (
          /* Empty Applications State */
          <Card className="bg-[#171717]/40 border-dashed border-border py-14 items-center justify-center">
            <Text className="text-4xl mb-4">📋</Text>
            <Text className="text-white font-bold text-base">No Submissions Recorded</Text>
            <Text className="text-muted text-xs mt-1 text-center px-6 leading-relaxed">
              {"You haven't submitted any self-tape auditions yet. Browse active casting calls, upload your recording, and start tracking."}
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
