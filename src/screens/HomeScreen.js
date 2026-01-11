import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getPopularVideos } from '../api/youtube';
import VideoCard from '../components/VideoCard';
import { TetColors } from '../theme/colors';

const FILTER_OPTIONS = {
  ALL: 'all',
  VIEWS: 'views',
  DATE: 'date',
  LIKES: 'likes',
};

const DATE_FILTERS = {
  TODAY: 'today',
  THIS_WEEK: 'thisWeek',
  THIS_MONTH: 'thisMonth',
  ALL_TIME: 'allTime',
};

const HomeScreen = ({ navigation }) => {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState(FILTER_OPTIONS.ALL);
  const [dateFilter, setDateFilter] = useState(DATE_FILTERS.ALL_TIME);

  const loadVideos = useCallback(async (isRefresh = false) => {
    try {
      setError(null);
      const pageToken = isRefresh ? null : nextPageToken;
      const data = await getPopularVideos(pageToken, 20);
      const videoItems = data.items || [];
      
      // Get statistics for each video
      const videosWithStats = videoItems.map(item => ({
        id: item.id,
        snippet: item.snippet,
        statistics: item.statistics,
      }));
      
      if (isRefresh) {
        setVideos(videosWithStats);
      } else {
        // Filter out duplicates when appending
        setVideos(prev => {
          const existingIds = new Set(prev.map(v => v.id));
          const newVideos = videosWithStats.filter(v => !existingIds.has(v.id));
          return [...prev, ...newVideos];
        });
      }
      
      setNextPageToken(data.nextPageToken || null);
      setHasMore(!!data.nextPageToken);
    } catch (err) {
      console.error('Error loading videos:', err);
      setError('Failed to load videos. Please check your API key.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [nextPageToken]);

  // Apply filters when videos or filter options change
  useEffect(() => {
    let filtered = [...videos];

    // Apply date filter
    if (dateFilter !== DATE_FILTERS.ALL_TIME) {
      const now = new Date();
      let cutoffDate = new Date();

      switch (dateFilter) {
        case DATE_FILTERS.TODAY:
          cutoffDate.setDate(now.getDate() - 1);
          break;
        case DATE_FILTERS.THIS_WEEK:
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case DATE_FILTERS.THIS_MONTH:
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }

      filtered = filtered.filter(video => {
        if (!video.snippet?.publishedAt) return false;
        const publishedDate = new Date(video.snippet.publishedAt);
        return publishedDate >= cutoffDate;
      });
    }

    // Apply sort filter
    switch (activeFilter) {
      case FILTER_OPTIONS.VIEWS:
        filtered.sort((a, b) => {
          const viewsA = parseInt(a.statistics?.viewCount || 0);
          const viewsB = parseInt(b.statistics?.viewCount || 0);
          return viewsB - viewsA;
        });
        break;
      case FILTER_OPTIONS.LIKES:
        filtered.sort((a, b) => {
          const likesA = parseInt(a.statistics?.likeCount || 0);
          const likesB = parseInt(b.statistics?.likeCount || 0);
          return likesB - likesA;
        });
        break;
      case FILTER_OPTIONS.DATE:
        filtered.sort((a, b) => {
          const dateA = new Date(a.snippet?.publishedAt || 0);
          const dateB = new Date(b.snippet?.publishedAt || 0);
          return dateB - dateA;
        });
        break;
      default:
        // Keep original order
        break;
    }

    setFilteredVideos(filtered);
  }, [videos, activeFilter, dateFilter]);

  useEffect(() => {
    loadVideos(true);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setNextPageToken(null);
    setHasMore(true);
    loadVideos(true);
  }, [loadVideos]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      loadVideos(false);
    }
  }, [loadingMore, hasMore, loading, loadVideos]);

  const handleVideoPress = useCallback(
    (video) => {
      navigation.navigate('VideoPlayer', { video });
    },
    [navigation]
  );

  const renderVideoCard = useCallback(
    ({ item }) => (
      <VideoCard video={item} onPress={() => handleVideoPress(item)} />
    ),
    [handleVideoPress]
  );

  const renderFilterBar = () => (
    <View style={styles.filterContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContent}
      >
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === FILTER_OPTIONS.ALL && styles.filterButtonActive
          ]}
          onPress={() => setActiveFilter(FILTER_OPTIONS.ALL)}
        >
          <Text style={[
            styles.filterText,
            activeFilter === FILTER_OPTIONS.ALL && styles.filterTextActive
          ]}>
            Tất cả
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === FILTER_OPTIONS.VIEWS && styles.filterButtonActive
          ]}
          onPress={() => setActiveFilter(FILTER_OPTIONS.VIEWS)}
        >
          <Text style={[
            styles.filterText,
            activeFilter === FILTER_OPTIONS.VIEWS && styles.filterTextActive
          ]}>
            Trò chơi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === FILTER_OPTIONS.LIKES && styles.filterButtonActive
          ]}
          onPress={() => setActiveFilter(FILTER_OPTIONS.LIKES)}
        >
          <Text style={[
            styles.filterText,
            activeFilter === FILTER_OPTIONS.LIKES && styles.filterTextActive
          ]}>
            Âm nhạc
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === FILTER_OPTIONS.DATE && styles.filterButtonActive
          ]}
          onPress={() => setActiveFilter(FILTER_OPTIONS.DATE)}
        >
          <Text style={[
            styles.filterText,
            activeFilter === FILTER_OPTIONS.DATE && styles.filterTextActive
          ]}>
            Danh sách kết
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );


  const renderHeader = () => (
    <View>
      {/* <View style={styles.header}>
        <Text style={styles.appTitle}>GoldTurf</Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={24} color={TetColors.gold} />
        </TouchableOpacity>
      </View> */}
      {renderFilterBar()}
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#d4af37" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {error || 'Không có video nào'}
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={TetColors.gold} />
          <Text style={styles.loadingText}>Đang tải video...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredVideos}
        renderItem={renderVideoCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={TetColors.gold}
            colors={[TetColors.gold]}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TetColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: TetColors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  appTitle: {
    color: TetColors.gold,
    fontSize: 24,
    fontWeight: '700',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${TetColors.gold}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: TetColors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: TetColors.border,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#303030',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  filterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  listContent: {
    paddingTop: 8,
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
  footerLoader: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    color: TetColors.textTertiary,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default HomeScreen;
