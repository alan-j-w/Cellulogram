import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
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

export default function SignupScreen() {
  const router = useRouter();
  const { signInWithGoogle, signUp, isLoading } = useAuthStore();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [role, setRole] = useState<'actor' | 'director'>('actor');
  const [showEmailSignup, setShowEmailSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle(role);
      Alert.alert('Success', `Registered as ${role === 'actor' ? 'Actor' : 'Director'}!`, [
        {
          text: 'Enter Studio',
          onPress: () => {
            if (role === 'actor') {
              router.replace('/(actor)/dashboard');
            } else {
              router.replace('/(director)/dashboard');
            }
          },
        },
      ]);
    } catch (e: any) {
      Alert.alert('Registration Failed', e?.message || 'Could not complete registration with Google. Please try again.');
    }
  };

  const handleEmailSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your name, email, and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password should be at least 6 characters long.');
      return;
    }
    try {
      await signUp(email.trim(), role, name.trim(), {}, password);
      Alert.alert('Account Created', `Welcome to Cellulogram as ${role === 'actor' ? 'Actor' : 'Director'}!`, [
        {
          text: 'Enter Studio',
          onPress: () => {
            if (role === 'actor') {
              router.replace('/(actor)/dashboard');
            } else {
              router.replace('/(director)/dashboard');
            }
          },
        },
      ]);
    } catch (e: any) {
      Alert.alert('Registration Failed', e?.message || 'Unable to create account. Please try again.');
    }
  };

  const isActor = role === 'actor';
  const isDirector = role === 'director';

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
                <Text style={styles.badgeText}>New Creator</Text>
              </View>
            </View>

            <View style={styles.titleSection}>
              <Text style={styles.sectionLabel}>Join The Industry</Text>
              <Text style={styles.headline}>{'Claim Your\nSpot on Stage.'}</Text>
              <Text style={styles.subtitle}>
                Connect your Google account and step straight into Malayalam & Tamil casting opportunities.
              </Text>
            </View>

            <View style={styles.roleSection}>
              <Text style={styles.roleSectionLabel}>Select Your Role</Text>

              <View style={styles.roleOptions}>
                {/* Actor Option */}
                <TouchableOpacity
                  onPress={() => setRole('actor')}
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
                    <Text style={styles.roleDesc}>Submit self-tapes & audition for major roles.</Text>
                  </View>
                  <View style={[styles.radioOuter, { borderColor: isActor ? colors.accent : colors.border }]}>
                    {isActor && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>

                {/* Director Option */}
                <TouchableOpacity
                  onPress={() => setRole('director')}
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
                    <Text style={styles.roleDesc}>Launch casting calls & discover talent.</Text>
                  </View>
                  <View style={[styles.radioOuter, { borderColor: isDirector ? colors.accent : colors.border }]}>
                    {isDirector && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.googleSection}>
              <TouchableOpacity
                onPress={handleGoogleSignup}
                disabled={isLoading}
                activeOpacity={0.85}
                style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
              >
                <GoogleIcon />
                <Text style={styles.googleButtonText}>
                  {isLoading ? 'Creating Account...' : `Register as ${isActor ? 'Actor' : 'Director'}`}
                </Text>
              </TouchableOpacity>
              <Text style={styles.termsText}>
                By continuing, you accept Cellulogram&apos;s Cast &amp; Crew Terms
              </Text>
            </View>

            <View style={styles.emailToggleWrapper}>
              <TouchableOpacity
                onPress={() => setShowEmailSignup(!showEmailSignup)}
                style={styles.emailToggle}
              >
                <Text style={styles.emailToggleText}>
                  {showEmailSignup ? '▲ Hide Email & Password' : '▼ Or sign up with Email & Password'}
                </Text>
              </TouchableOpacity>
            </View>

            {showEmailSignup && (
              <View style={styles.emailForm}>
                <Input
                  label="Full Name"
                  placeholder="e.g. Amal Dev"
                  value={name}
                  onChangeText={setName}
                />
                <Input
                  label="Email Address"
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <Input
                  label="Password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <Button
                  label={isLoading ? 'CREATING ACCOUNT...' : `REGISTER AS ${role.toUpperCase()}`}
                  variant="primary"
                  size="md"
                  disabled={isLoading}
                  onPress={handleEmailSignup}
                  containerClassName="mt-2"
                />
              </View>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.footerLink}>
                <Text style={styles.footerLinkText}>Sign In</Text>
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
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 24 },
  footerText: { color: colors.muted, fontSize: 13 },
  footerLink: { paddingHorizontal: 8, paddingVertical: 4 },
  footerLinkText: { color: colors.accent, fontSize: 13, fontWeight: 'bold' },
});
