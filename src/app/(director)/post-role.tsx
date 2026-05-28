import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { databaseService } from '@/services/supabase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';

export default function PostRoleScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [projectTitle, setProjectTitle] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [category, setCategory] = useState('Malayalam Feature Film');
  const [ageRange, setAgeRange] = useState('20 - 30');
  const [gender, setGender] = useState('Male');
  const [language, setLanguage] = useState('Malayalam');
  const [location, setLocation] = useState('Kochi, Kerala');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [deadline, setDeadline] = useState('2026-06-15');

  const categories = ['Malayalam Feature Film', 'Tamil Indie Short Film', 'YouTube Comedy Series', 'Ad Film Project'];

  // Query Mutation for posting the role
  const postMutation = useMutation({
    mutationFn: (roleData: Parameters<typeof databaseService.postRole>[0]) => 
      databaseService.postRole(roleData),
    onSuccess: () => {
      // Invalidate query to refresh dashboard immediately
      queryClient.invalidateQueries({ queryKey: ['director_roles'] });
      queryClient.invalidateQueries({ queryKey: ['casting_calls'] });
      
      Alert.alert('Casting Call Published', 'Your new role listing has been published to the Actor Board successfully!', [
        {
          text: 'Go to Dashboard',
          onPress: () => {
            // Reset fields
            setProjectTitle('');
            setRoleTitle('');
            setDescription('');
            setRequirements('');
            router.replace('/(director)/dashboard');
          }
        }
      ]);
    },
    onError: () => {
      Alert.alert('Publish Failed', 'Unable to record casting call. Please check input parameters.');
    }
  });

  const handlePublish = () => {
    if (!projectTitle || !roleTitle || !description || !requirements) {
      Alert.alert('Error', 'Please fill in all primary casting call fields (Project, Role, Description, Requirements).');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Session expired. Please log in again.');
      return;
    }

    postMutation.mutate({
      director_id: user.id,
      project_title: projectTitle,
      role_title: roleTitle,
      category,
      age_range: ageRange,
      gender,
      language,
      location,
      description,
      requirements,
      deadline,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top Header bar */}
      <View className="px-6 py-4 flex-row items-center border-b border-border bg-[#0B0B0B]">
        <Text className="text-white text-base font-bold tracking-tight">Create Casting Call</Text>
      </View>

      <ScrollView 
        className="flex-1 p-6" 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <Text className="text-accent text-xs font-bold uppercase tracking-[0.2em] mb-2">
            POST CALL SHEET
          </Text>
          <Text className="text-white text-3xl font-extrabold tracking-tight">
            Publish New{"\n"}Audition Role.
          </Text>
        </View>

        {/* Primary details card */}
        <Card className="bg-card border-border p-5 mb-6">
          <Text className="text-accent text-xs font-bold uppercase tracking-widest mb-4">
            Casting Identifiers
          </Text>

          <Input
            label="Project Title"
            placeholder="e.g. Kathanar: The Wild Hunter"
            value={projectTitle}
            onChangeText={setProjectTitle}
            disabled={postMutation.isPending}
          />

          <Input
            label="Role Specification"
            placeholder="e.g. Lead Antagonist (Siddha)"
            value={roleTitle}
            onChangeText={setRoleTitle}
            disabled={postMutation.isPending}
          />

          {/* Category selection */}
          <Text className="text-white text-xs font-semibold mb-2 uppercase tracking-widest opacity-80">
            Project Category
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                className={`px-3 py-2 rounded-xl border ${
                  category === cat 
                    ? 'border-accent bg-accent/5' 
                    : 'border-border bg-[#0B0B0B]'
                }`}
                disabled={postMutation.isPending}
              >
                <Text className={`text-xs font-semibold ${category === cat ? 'text-accent' : 'text-muted'}`}>
                  {cat.split(' ')[0]} {cat.includes('Feature') ? 'Film' : cat.includes('Indie') ? 'Indie' : 'Short'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Filter / Specifications card */}
        <Card className="bg-card border-border p-5 mb-6">
          <Text className="text-accent text-xs font-bold uppercase tracking-widest mb-4">
            Target Casting Demographics
          </Text>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-grow flex-1">
              <Input
                label="Age Range"
                placeholder="e.g. 20 - 30"
                value={ageRange}
                onChangeText={setAgeRange}
                disabled={postMutation.isPending}
              />
            </View>

            <View className="flex-grow flex-1">
              <Input
                label="Primary Language"
                placeholder="e.g. Malayalam"
                value={language}
                onChangeText={setLanguage}
                disabled={postMutation.isPending}
              />
            </View>
          </View>

          {/* Gender toggle */}
          <Text className="text-white text-xs font-semibold mb-2 uppercase tracking-widest opacity-80">
            Gender Constraints
          </Text>
          
          <View className="flex-row gap-2.5 mb-5">
            {['All', 'Male', 'Female'].map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => setGender(g)}
                className={`flex-1 py-3.5 rounded-xl border items-center ${
                  gender === g 
                    ? 'border-accent bg-accent/5' 
                    : 'border-border bg-[#0B0B0B]'
                }`}
                disabled={postMutation.isPending}
              >
                <Text className={`text-xs font-semibold ${gender === g ? 'text-accent' : 'text-muted'}`}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Shoot Location / City"
            placeholder="e.g. Kochi, Kerala"
            value={location}
            onChangeText={setLocation}
            disabled={postMutation.isPending}
          />

          <Input
            label="Application Deadline"
            placeholder="YYYY-MM-DD"
            value={deadline}
            onChangeText={setDeadline}
            disabled={postMutation.isPending}
          />
        </Card>

        {/* Descriptions and Requirements */}
        <Card className="bg-card border-border p-5 mb-8">
          <Text className="text-accent text-xs font-bold uppercase tracking-widest mb-4">
            Detailed Audition Guidelines
          </Text>

          <Input
            label="Project Description"
            placeholder="Outline project themes, character background story, and shoot timeline..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            disabled={postMutation.isPending}
          />

          <Input
            label="Actor Requirements"
            placeholder="List specific self-tape actions, dialogues, accents, or physical requirements..."
            value={requirements}
            onChangeText={setRequirements}
            multiline
            numberOfLines={4}
            disabled={postMutation.isPending}
          />
        </Card>

        {/* Publish Action Button */}
        <Button
          label="PUBLISH CASTING OPPORTUNITY"
          variant="primary"
          size="lg"
          loading={postMutation.isPending}
          onPress={handlePublish}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
