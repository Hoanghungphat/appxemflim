import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TetColors } from '../theme/colors';

const VideoCard = memo(({ video, onPress }) => {
  const thumbnail = video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.medium?.url;
  const title = video.snippet?.title || 'No title';
  const channelTitle = video.snippet?.channelTitle || 'Unknown channel';
  const viewCount = video.statistics?.viewCount 
    ? parseInt(video.statistics.viewCount).toLocaleString() 
    : 'N/A';
  const publishedAt = video.snippet?.publishedAt 
    ? new Date(video.snippet.publishedAt).toLocaleDateString()
    : '';

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {channelTitle.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.channelName} numberOfLines={1}>
              {channelTitle}
            </Text>
            <Text style={styles.metaText}>
              {viewCount} lượt xem • {publishedAt || 'Mới đây'}
            </Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={18} color={TetColors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    backgroundColor: TetColors.background,
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: TetColors.backgroundElevated,
    marginBottom: 12,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  avatarContainer: {
    flexDirection: 'row',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#909090',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  infoContent: {
    flex: 1,
  },
  title: {
    color: TetColors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
    lineHeight: 20,
  },
  channelName: {
    color: TetColors.textTertiary,
    fontSize: 13,
    marginBottom: 2,
  },
  metaText: {
    color: TetColors.textTertiary,
    fontSize: 13,
  },
  menuButton: {
    padding: 4,
  },
});

VideoCard.displayName = 'VideoCard';

export default VideoCard;
