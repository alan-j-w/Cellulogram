import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { User, Clapperboard } from 'lucide-react-native';

function GoogleIcon() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  return (
    <View style={styles.googleIconWrapper}>
      <Text style={styles.googleIconText}>G</Text>
    </View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithGoogle, signIn, isLoading } = useAuthStore();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [roleSelection, setRoleSelection] = useState<'actor' | 'director'>('actor');
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle(roleSelection);
      if (roleSelection === 'actor') {
        router.replace('/(actor)/dashboard');
      } else {
        router.replace('/(director)/dashboard');
      }
    } catch (error: any) {
      Alert.alert('Google Sign-In Failed', error?.message || 'Unable to authenticate with Google. Please try again.');
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    try {
      await signIn(email.trim(), roleSelection, password);
      if (roleSelection === 'actor') {
        router.replace('/(actor)/dashboard');
      } else {
        router.replace('/(director)/dashboard');
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error?.message || 'Invalid email or password.');
    }
  };

  const handleInstantLogin = async (selectedRole: 'actor' | 'director') => {
    const mockEmail = selectedRole === 'director' ? 'director@cellulogram.com' : 'actor@cellulogram.com';
    try {
      await signIn(mockEmail, selectedRole, 'password123');
      if (selectedRole === 'actor') {
        router.replace('/(actor)/dashboard');
      } else {
        router.replace('/(director)/dashboard');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to authenticate');
    }
  };

  const isActor = roleSelection === 'actor';
  const isDirector = roleSelection === 'director';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centeredContainer}>
          <View style={styles.card}>
            <View pointerEvents="none" style={styles.glowTopRight} />
            <View pointerEvents="none" style={styles.glowBottomLeft} />

            <View style={styles.header}>
              <TouchableOpacity 
                onPress={() => router.push('/')}
                activeOpacity={0.7}
                style={styles.backButton}
              >
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Cellulogram ID</Text>
              </View>
            </View>

            <View style={styles.titleSection}>
              <Text style={styles.sectionLabel}>Authentication</Text>
              <Text style={styles.headline}>{'Welcome to\nThe Cinema Studio.'}</Text>
              <Text style={styles.subtitle}>
                Choose your craft to launch your casting portal or scout verified talents.
              </Text>
            </View>

            <View style={styles.roleSection}>
              <Text style={styles.roleSectionLabel}>Select Your Access Role</Text>

              <View style={styles.roleOptions}>
                {/* Actor Option */}
                <TouchableOpacity
                  onPress={() => setRoleSelection('actor')}
                  activeOpacity={0.8}
                  style={[styles.roleButton, isActor ? styles.roleButtonActive : styles.roleButtonInactive]}
                >
                  <View style={styles.roleIconWrapper}>
                    <User size={24} color={isActor ? colors.accent : colors.textPrimary} />
                  </View>
                  <View style={styles.roleTextWrapper}>
                    <Text style={[styles.roleTitle, { color: isActor ? colors.accent : colors.textPrimary }]}>
                      Actor
                    </Text>
                    <Text style={styles.roleDesc}>Showcase tapes, apply to calls & track review status.</Text>
                  </View>
                  <View style={[styles.radioOuter, { borderColor: isActor ? colors.accent : colors.border }]}>
                    {isActor && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>

                {/* Director Option */}
                <TouchableOpacity
                  onPress={() => setRoleSelection('director')}
                  activeOpacity={0.8}
                  style={[styles.roleButton, isDirector ? styles.roleButtonActive : styles.roleButtonInactive]}
                >
                  <View style={styles.roleIconWrapper}>
                    <Clapperboard size={24} color={isDirector ? colors.accent : colors.textPrimary} />
                  </View>
                  <View style={styles.roleTextWrapper}>
                    <Text style={[styles.roleTitle, { color: isDirector ? colors.accent : colors.textPrimary }]}>
                      Director
                    </Text>
                    <Text style={styles.roleDesc}>Post projects, evaluate reels & shortlist candidates.</Text>
                  </View>
                  <View style={[styles.radioOuter, { borderColor: isDirector ? colors.accent : colors.border }]}>
                    {isDirector && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.googleSection}>
              <TouchableOpacity
                onPress={handleGoogleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
                style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
              >
                <GoogleIcon />
                <Text style={styles.googleButtonText}>
                  {isLoading ? 'Connecting Google...' : `Continue as ${isActor ? 'Actor' : 'Director'}`}
                </Text>
              </TouchableOpacity>
              <Text style={styles.termsText}>
                Instant secure access via Google OAuth 2.0
              </Text>
            </View>

            <View style={styles.emailToggleWrapper}>
              <TouchableOpacity
                onPress={() => setShowEmailAuth(!showEmailAuth)}
                style={styles.emailToggle}
              >
                <Text style={styles.emailToggleText}>
                  {showEmailAuth ? '▲ Hide Email & Password' : '▼ Or sign in with Email & Password'}
                </Text>
              </TouchableOpacity>
            </View>

            {showEmailAuth && (
              <View style={styles.emailForm}>
                <Input
                  label="Account Email"
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <Input
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <Button
                  label={isLoading ? 'SIGNING IN...' : `SIGN IN AS ${roleSelection.toUpperCase()}`}
                  variant="primary"
                  size="md"
                  disabled={isLoading}
                  onPress={handleEmailLogin}
                  containerClassName="mt-2"
                />
              </View>
            )}

            {process.env.EXPO_PUBLIC_ENABLE_MOCK_LOGIN === 'true' && (
              <Card style={styles.devCard}>
                <View style={styles.devCardHeader}>
                  <Text style={styles.devCardTitle}>⚡ TEST HARNESS</Text>
                  <Text style={styles.devCardSubtitle}>Dev Only</Text>
                </View>
                <Text style={styles.devCardDesc}>
                  One-click simulation bypass for local environment evaluation:
                </Text>
                <View style={styles.devCardActions}>
                  <TouchableOpacity style={styles.devButton} onPress={() => handleInstantLogin('actor')}>
                    <Text style={styles.devButtonText}>DEMO ACTOR</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.devButton} onPress={() => handleInstantLogin('director')}>
                    <Text style={styles.devButtonText}>DEMO DIRECTOR</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>New to Cellulogram? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')} style={styles.footerLink}>
                <Text style={styles.footerLinkText}>Create an account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ReturnType<typeof useThemeColors>) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1 },
  centeredContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 32 },
  card: { maxWidth: 400, width: '100%', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 32, padding: 32, overflow: 'hidden', position: 'relative' },
  glowTopRight: { position: 'absolute', top: -128, right: -128, width: 256, height: 256, borderRadius: 128, backgroundColor: 'rgba(212,175,55,0.05)' },
  glowBottomLeft: { position: 'absolute', bottom: -128, left: -128, width: 256, height: 256, borderRadius: 128, backgroundColor: 'rgba(212,175,55,0.05)' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  backArrow: { color: colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  badge: { marginLeft: 'auto', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', backgroundColor: 'rgba(212,175,55,0.1)' },
  badgeText: { color: colors.accent, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2 },
  titleSection: { marginBottom: 40, alignItems: 'center' },
  sectionLabel: { color: colors.accent, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 5, marginBottom: 12, textAlign: 'center' },
  headline: { color: colors.textPrimary, fontSize: 30, fontWeight: '900', letterSpacing: -0.5, lineHeight: 36, textAlign: 'center', marginBottom: 16 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', paddingHorizontal: 8 },
  roleSection: { marginBottom: 32 },
  roleSectionLabel: { color: colors.muted, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 16, textAlign: 'center' },
  roleOptions: { gap: 16 },
  roleButton: { width: '100%', padding: 20, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  roleButtonActive: { borderColor: colors.accent, backgroundColor: 'rgba(212,175,55,0.1)' },
  roleButtonInactive: { borderColor: colors.border, backgroundColor: colors.background },
  roleIconWrapper: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 1, borderColor: colors.border },
  roleTextWrapper: { flex: 1 },
  roleTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 4 },
  roleDesc: { color: colors.muted, fontSize: 11, lineHeight: 15, paddingRight: 16 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  googleSection: { marginBottom: 16 },
  googleButton: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5' },
  googleButtonDisabled: { opacity: 0.6 },
  googleButtonText: { color: '#121212', fontWeight: '800', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' },
  googleIconWrapper: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  googleIconText: { fontSize: 13, fontWeight: '900', color: '#4285F4', lineHeight: 15 },
  termsText: { textAlign: 'center', color: colors.muted, fontSize: 10, marginTop: 12, paddingHorizontal: 16, lineHeight: 14 },
  emailToggleWrapper: { alignItems: 'center', marginBottom: 24 },
  emailToggle: { paddingVertical: 6, paddingHorizontal: 12 },
  emailToggleText: { color: colors.muted, fontSize: 12, textDecorationLine: 'underline' },
  emailForm: { marginBottom: 24, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, padding: 16, borderRadius: 16 },
  devCard: { backgroundColor: colors.card, borderColor: 'rgba(212,175,55,0.25)', padding: 16, borderRadius: 16, marginBottom: 32, borderWidth: 1 },
  devCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  devCardTitle: { color: colors.accent, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  devCardSubtitle: { fontSize: 10, color: colors.muted },
  devCardDesc: { color: colors.muted, fontSize: 11, marginBottom: 16, lineHeight: 14 },
  devCardActions: { flexDirection: 'row', gap: 12 },
  devButton: { flex: 1, paddingVertical: 12, borderColor: 'rgba(212,175,55,0.2)', backgroundColor: colors.background, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  devButtonText: { color: colors.textPrimary, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 24 },
  footerText: { color: colors.muted, fontSize: 13 },
  footerLink: { paddingHorizontal: 8, paddingVertical: 4 },
  footerLinkText: { color: colors.accent, fontSize: 13, fontWeight: 'bold' },
});
