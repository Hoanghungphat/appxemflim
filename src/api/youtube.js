import axios from 'axios';
// Note: react-native-dotenv may not work with Expo SDK 54
// Using direct import from .env as fallback
// TODO: Fix environment variable loading
let YOUTUBE_API_KEY;
try {
  const envModule = require('@env');
  YOUTUBE_API_KEY = envModule.YOUTUBE_API_KEY;
} catch (e) {
  // Fallback: hardcode API key if env loading fails
  YOUTUBE_API_KEY = 'AIzaSyDn1QVeFQ9qkJbF1Wd3ipIyVfLLtyDqc6s';
}

const API_KEY = YOUTUBE_API_KEY || 'AIzaSyDn1QVeFQ9qkJbF1Wd3ipIyVfLLtyDqc6s';

// Debug: Log API key status (first 10 chars only for security)
console.log('API Key loaded:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT FOUND');
console.log('API Key length:', API_KEY ? API_KEY.length : 0);

const apiClient = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3',
});

/**
 * Fetches popular videos with pagination and filters
 * @param {string} pageToken - Optional page token for pagination
 * @param {number} maxResults - Number of results (default 20)
 * @param {string} regionCode - Region code (default 'VN')
 * @param {string} categoryId - Optional category ID
 * @returns {Promise} Response containing list of popular videos
 */
export const getPopularVideos = async (pageToken = null, maxResults = 20, regionCode = 'VN', categoryId = null) => {
  try {
    const params = {
      key: API_KEY,
      chart: 'mostPopular',
      part: 'snippet,statistics',
      regionCode,
      maxResults,
    };
    
    if (pageToken) {
      params.pageToken = pageToken;
    }
    
    if (categoryId) {
      params.videoCategoryId = categoryId;
    }
    
    const response = await apiClient.get('/videos', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular videos:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Gets video categories for a region
 * @param {string} regionCode - Region code (default 'VN')
 * @returns {Promise} Response containing video categories
 */
export const getVideoCategories = async (regionCode = 'VN') => {
  try {
    const response = await apiClient.get('/videoCategories', {
      params: {
        key: API_KEY,
        part: 'snippet',
        regionCode,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching video categories:', error);
    return { items: [] };
  }
};

/**
 * Searches for videos by query with pagination
 * @param {string} query - Search keyword
 * @param {string} pageToken - Optional page token for pagination
 * @param {number} maxResults - Number of results (default 20)
 * @returns {Promise} Response containing list of videos matching the query
 */
export const searchVideos = async (query, pageToken = null, maxResults = 20) => {
  try {
    const params = {
      key: API_KEY,
      q: query,
      type: 'video',
      part: 'snippet',
      maxResults,
    };
    
    if (pageToken) {
      params.pageToken = pageToken;
    }
    
    const response = await apiClient.get('/search', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching videos:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Gets search suggestions (using search API for autocomplete)
 * Note: YouTube doesn't have official autocomplete API, so we'll use search with partial results
 * @param {string} query - Partial search query
 * @returns {Promise} Response with suggestions
 */
export const getSearchSuggestions = async (query) => {
  if (!query || query.length < 2) {
    return { items: [] };
  }
  
  try {
    const response = await apiClient.get('/search', {
      params: {
        key: API_KEY,
        q: query,
        type: 'video',
        part: 'snippet',
        maxResults: 5, // Only get a few for suggestions
      },
    });
    return response.data;
  } catch (error) {
    // Silently fail for suggestions
    return { items: [] };
  }
};

/**
 * Gets video details including statistics
 * @param {string} videoId - YouTube video ID
 * @returns {Promise} Response containing video details
 */
export const getVideoDetails = async (videoId) => {
  try {
    const response = await apiClient.get('/videos', {
      params: {
        key: API_KEY,
        id: videoId,
        part: 'snippet,statistics',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching video details:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};
