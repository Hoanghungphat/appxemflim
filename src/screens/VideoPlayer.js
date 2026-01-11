import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import YoutubePlayer from 'react-native-youtube-iframe';
import { getVideoDetails } from '../api/youtube';
import { Ionicons } from '@expo/vector-icons';
import { TetColors, TetGradients } from '../theme/colors';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = (width * 9) / 16; // 16:9 aspect ratio

const VideoPlayer = ({ route, navigation }) => {
  const { video: initialVideo } = route.params;
  const [video, setVideo] = useState(initialVideo);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadVideoDetails = async () => {
      if (!initialVideo.id) {
        setError('Invalid video ID');
        setLoading(false);
        return;
      }

      // If video already has statistics, don't fetch again
      if (initialVideo.statistics) {
        setLoading(false);
        return;
      }

      try {
        const data = await getVideoDetails(initialVideo.id);
        if (data.items && data.items.length > 0) {
          setVideo({
            ...initialVideo,
            snippet: data.items[0].snippet,
            statistics: data.items[0].statistics,
          });
        }
      } catch (err) {
        console.error('Error loading video details:', err);
        setError('Failed to load video details');
      } finally {
        setLoading(false);
      }
    };

    loadVideoDetails();
  }, [initialVideo]);

  const onStateChange = useCallback((state) => {
    if (state === 'playing') {
      setPlaying(true);
    } else if (state === 'paused') {
      setPlaying(false);
    }
  }, []);

  const togglePlaying = useCallback(() => {
    setPlaying((prev) => !prev);
  }, []);

  const formatNumber = (num) => {
    if (!num) return '0';
    const number = parseInt(num);
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    }
    if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number.toLocaleString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={TetColors.gold} />
          <Text style={styles.loadingText}>Đang tải video...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={TetColors.red} />
          </View>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const videoId = video.id;
  const title = video.snippet?.title || 'No title';
  const channelTitle = video.snippet?.channelTitle || 'Unknown channel';
  const description = video.snippet?.description || 'No description available';
  const viewCount = formatNumber(video.statistics?.viewCount);
  const likeCount = formatNumber(video.statistics?.likeCount);
  const publishedAt = formatDate(video.snippet?.publishedAt);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.playerContainer}>
          <YoutubePlayer
            height={VIDEO_HEIGHT}
            play={playing}
            videoId={videoId}
            onChangeState={onStateChange}
            webViewStyle={styles.webView}
          />
        </View>

        <LinearGradient
          colors={TetGradients.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.detailsGradient}
        >
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{title}</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="eye-outline" size={18} color={TetColors.textTertiary} />
                <Text style={styles.statText}>{viewCount} lượt xem</Text>
              </View>
              {likeCount !== '0' && (
                <View style={styles.statItem}>
                  <Ionicons name="thumbs-up-outline" size={18} color={TetColors.textTertiary} />
                  <Text style={styles.statText}>{likeCount} thích</Text>
                </View>
              )}
              {publishedAt && (
                <View style={styles.statItem}>
                  <Ionicons name="calendar-outline" size={16} color={TetColors.textTertiary} />
                  <Text style={styles.publishedDate}>{publishedAt}</Text>
                </View>
              )}
            </View>

            <View style={styles.channelContainer}>
              <View style={styles.channelInfo}>
                <LinearGradient
                  colors={[TetColors.gold, TetColors.red]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.channelAvatar}
                >
                  <Text style={styles.channelInitial}>
                    {channelTitle.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
                <View style={styles.channelDetails}>
                  <Text style={styles.channelName}>{channelTitle}</Text>
                  <Text style={styles.channelSubtext}>Kênh YouTube</Text>
                </View>
              </View>
            </View>

            <View style={styles.descriptionContainer}>
              <View style={styles.descriptionTitleContainer}>
                <Ionicons name="document-text-outline" size={18} color={TetColors.gold} />
                <Text style={styles.descriptionTitle}>Mô tả</Text>
              </View>
              <Text style={styles.description}>{description}</Text>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TetColors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: TetColors.background,
  },
  loadingText: {
    color: TetColors.textPrimary,
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: TetColors.background,
  },
  errorIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${TetColors.red}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorText: {
    color: TetColors.textPrimary,
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  playerContainer: {
    width: '100%',
    backgroundColor: '#000000',
  },
  webView: {
    opacity: 0.99,
  },
  detailsGradient: {
    borderTopWidth: 1,
    borderTopColor: TetColors.border,
  },
  detailsContainer: {
    padding: 20,
  },
  title: {
    color: TetColors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    lineHeight: 30,
    letterSpacing: 0.3,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: TetColors.backgroundCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TetColors.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    color: TetColors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  publishedDate: {
    color: TetColors.textTertiary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  channelContainer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: TetColors.border,
    marginBottom: 20,
    backgroundColor: TetColors.backgroundCard,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: TetColors.gold,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  channelInitial: {
    color: TetColors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  channelDetails: {
    flex: 1,
  },
  channelName: {
    color: TetColors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  channelSubtext: {
    color: TetColors.textTertiary,
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: 24,
    backgroundColor: TetColors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: TetColors.border,
  },
  descriptionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  descriptionTitle: {
    color: TetColors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  description: {
    color: TetColors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
});

export default VideoPlayer;
