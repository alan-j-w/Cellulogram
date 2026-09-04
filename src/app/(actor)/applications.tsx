import React from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databaseService } from '@/services/supabase';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { RefreshCw, Lightbulb, Eye, Star, ClipboardList, Check } from 'lucide-react-native';

export default function ApplicationsScreen() {
  const { user } = useAuthStore();
  const colors = useThemeColors();

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
        return { label: 'Submitted', color: colors.muted, bg: 'bg-muted/10', border: 'border-muted/20', step: 1 };
      case 'Viewed':
        return { label: 'Viewed', color: '#0ea5e9', bg: 'bg-sky-500/10', border: 'border-sky-500/20', step: 2 };
      case 'Under Review':
        return { label: 'Under Review', color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/20', step: 3 };
      case 'Shortlisted':
        return { label: 'Shortlisted', color: colors.accent, bg: 'bg-accent/10', border: 'border-accent/20', step: 4, icon: Star };
      case 'Meeting Scheduled':
        return { label: 'Meeting Scheduled', color: '#8b5cf6', bg: 'bg-violet-500/10', border: 'border-violet-500/20', step: 4 };
      case 'Rejected':
        return { label: 'Passed', color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/20', step: 4 };
      default:
        return { label: 'Pending', color: colors.muted, bg: 'bg-muted/10', border: 'border-muted/20', step: 1 };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header bar */}
      <View className="px-6 py-4 flex-row justify-between items-center border-b border-border bg-card">
        <View>
          <Text className="text-muted text-xs font-semibold uppercase tracking-widest">
            TRACK WORKSPACE
          </Text>
          <Text className="text-textPrimary text-xl font-bold mt-0.5">
            Your Applications
          </Text>
        </View>
        
        <TouchableOpacity onPress={() => refetch()} className="flex-row items-center gap-1">
          <Text className="text-accent text-xs font-semibold">Refresh</Text>
          <RefreshCw size={12} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-6 mt-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.accent} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Transparency Alert Box */}
        <Card className="bg-card border-accent/20 p-4 mb-6">
          <View className="flex-row items-center gap-3">
            <Lightbulb size={20} color={colors.accent} />
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
                    <Text className="text-textPrimary text-base font-bold tracking-tight">
                      {app.project_title}
                    </Text>
                    <Text className="text-muted text-xs mt-0.5">
                      Role: <Text className="text-textPrimary font-medium">{app.role_title}</Text>
                    </Text>
                  </View>

                  <View className={`${statusInfo.bg} ${statusInfo.border} border px-2.5 py-1 rounded-md flex-row items-center gap-1`}>
                    {statusInfo.icon && <statusInfo.icon size={10} color={statusInfo.color} />}
                    <Text style={{ color: statusInfo.color }} className="text-[10px] font-bold uppercase tracking-wider">
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                {/* Micro-transparency banner */}
                {app.viewed && app.status !== 'Shortlisted' && app.status !== 'Meeting Scheduled' && (
                  <View className="bg-sky-500/5 border border-sky-500/10 px-3 py-2 rounded-xl mb-4 flex-row items-center">
                    <Eye size={14} color="#38bdf8" className="mr-2" />
                    <Text className="text-sky-400 text-xs font-semibold">
                      Your self-tape audition has been viewed by the casting director!
                    </Text>
                  </View>
                )}

                {app.status === 'Shortlisted' && (
                  <View className="bg-accent/5 border border-accent/15 px-3 py-2 rounded-xl mb-4 flex-row items-center">
                    <Star size={14} color={colors.accent} className="mr-2" />
                    <Text className="text-accent text-xs font-bold">
                      Congratulations! You have been shortlisted for this role.
                    </Text>
                  </View>
                )}

                {/* Audition Timeline Progression Lines */}
                <View className="border-t border-border/40 pt-4 pb-2">
                  <Text className="text-textPrimary text-[10px] font-bold uppercase tracking-widest mb-3 opacity-60">
                    Audition Milestones
                  </Text>

                  <View className="flex-row justify-between items-center px-2">
                    <View className="items-center">
                      <View className={`w-4 h-4 rounded-full items-center justify-center ${statusInfo.step >= 1 ? 'bg-accent' : 'bg-muted'}`}>
                        <Check size={10} color={colors.background} />
                      </View>
                      <Text className="text-[9px] text-textPrimary mt-1 font-medium">Submitted</Text>
                    </View>

                    <View className={`flex-1 h-0.5 mx-1 ${statusInfo.step >= 2 ? 'bg-accent' : 'bg-muted'}`} />

                    <View className="items-center">
                      <View className={`w-4 h-4 rounded-full items-center justify-center ${statusInfo.step >= 2 ? 'bg-accent' : 'bg-muted'}`}>
                        {statusInfo.step >= 2 && <Check size={10} color={colors.background} />}
                      </View>
                      <Text className="text-[9px] text-muted mt-1">Viewed</Text>
                    </View>

                    <View className={`flex-1 h-0.5 mx-1 ${statusInfo.step >= 3 ? 'bg-accent' : 'bg-muted'}`} />

                    <View className="items-center">
                      <View className={`w-4 h-4 rounded-full items-center justify-center ${statusInfo.step >= 3 ? 'bg-accent' : 'bg-muted'}`}>
                        {statusInfo.step >= 3 && <Check size={10} color={colors.background} />}
                      </View>
                      <Text className="text-[9px] text-muted mt-1">Review</Text>
                    </View>

                    <View className={`flex-1 h-0.5 mx-1 ${statusInfo.step >= 4 ? 'bg-accent' : 'bg-muted'}`} />

                    <View className="items-center">
                      <View className={`w-4 h-4 rounded-full items-center justify-center ${
                        statusInfo.step >= 4 
                          ? app.status === 'Rejected' 
                            ? 'bg-red-500' 
                            : 'bg-accent' 
                          : 'bg-muted'
                      }`}>
                        {statusInfo.step >= 4 && <Check size={10} color={colors.background} />}
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
          <Card className="bg-background border-dashed border-border py-14 items-center justify-center">
            <ClipboardList size={40} color={colors.muted} className="mb-4" />
            <Text className="text-textPrimary font-bold text-base">No Submissions Recorded</Text>
            <Text className="text-muted text-xs mt-1 text-center px-6 leading-relaxed">
              {"You haven't submitted any self-tape auditions yet. Browse active casting calls, upload your recording, and start tracking."}
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
