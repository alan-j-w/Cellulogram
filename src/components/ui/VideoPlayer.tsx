/**
 * src/components/ui/VideoPlayer.tsx
 *
 * Cross-platform video player component.
 *
 * Platform strategy:
 *  - Web:    Renders a native HTML5 <video> element via react-native-web.
 *            expo-video does not have a working web implementation in SDK 55.
 *  - Native: Uses expo-video's VideoView + useVideoPlayer hook (SDK 55 API).
 *
 * Usage:
 *   <VideoPlayer uri="https://..." style={{ height: 240 }} />
 */

import React from 'react';
import { Platform, View, StyleSheet, ViewStyle } from 'react-native';

// ─── Conditional Imports ──────────────────────────────────────────────────────
// We use require() inside the component render instead of top-level imports to
// prevent Metro from trying to bundle expo-video's native code on web.

interface VideoPlayerProps {
  uri: string;
  style?: ViewStyle;
  /** Whether to autoplay and loop (default: true) */
  autoPlay?: boolean;
  loop?: boolean;
  /** Show native controls on web */
  controls?: boolean;
}

// ─── Web Implementation ───────────────────────────────────────────────────────
function VideoPlayerWeb({ uri, style, autoPlay = true, loop = true, controls = true }: VideoPlayerProps) {
  return (
    <View style={[styles.container, style]}>
      {/* 
        react-native-web passes unknown HTML attributes through to the DOM element.
        We cast to 'any' to satisfy TypeScript since 'playsInline' is a valid HTML attribute.
      */}
      {React.createElement('video', {
        src: uri,
        autoPlay,
        loop,
        controls,
        playsInline: true,
        style: {
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          backgroundColor: '#000',
          borderRadius: 12,
        },
      })}
    </View>
  );
}

// ─── Native Implementation ────────────────────────────────────────────────────
function VideoPlayerNative({ uri, style, autoPlay = true, loop = true }: VideoPlayerProps) {
  // Dynamic require to prevent web bundling issues
  const { useVideoPlayer, VideoView } = require('expo-video');

  const player = useVideoPlayer(uri, (p: any) => {
    p.loop = loop;
    if (autoPlay) p.play();
  });

  return (
    <View style={[styles.container, style]}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        fullscreenOptions={{ enable: true }}
        allowsPictureInPicture={Platform.OS === 'ios'}
      />
    </View>
  );
}

// ─── Exported Component ───────────────────────────────────────────────────────
export function VideoPlayer(props: VideoPlayerProps) {
  if (Platform.OS === 'web') {
    return <VideoPlayerWeb {...props} />;
  }
  return <VideoPlayerNative {...props} />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 220,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
