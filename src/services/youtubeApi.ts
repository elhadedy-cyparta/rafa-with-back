// YouTube API service for fetching RAFAL Electric channel videos exclusively
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  videoUrl: string;
}

export class YouTubeService {
  private static readonly API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  private static readonly BASE_URL = 'https://www.googleapis.com/youtube/v3';
  private static readonly CHANNEL_HANDLE = '@rafalelectric';
  private static readonly CHANNEL_NAME = 'RAFAL Electric';
  private static channelId: string | null = null;

  // Get RAFAL Electric channel ID using multiple methods
  static async getChannelId(): Promise<string | null> {
    if (this.channelId) return this.channelId;

    try {
      if (!this.API_KEY) {
        console.warn('YouTube API key not found. Cannot fetch real channel data.');
        return null;
      }

      // Method 1: Search by channel handle/username
      let response = await fetch(
        `${this.BASE_URL}/channels?part=id&forHandle=${this.CHANNEL_HANDLE}&key=${this.API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          this.channelId = data.items[0].id;
          console.log('Found RAFAL Electric channel via handle:', this.channelId);
          return this.channelId;
        }
      }

      // Method 2: Search by exact channel name
      response = await fetch(
        `${this.BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(this.CHANNEL_NAME)}&maxResults=10&key=${this.API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          // Look for exact match
          const exactMatch = data.items.find((item: any) => 
            item.snippet.title.toLowerCase() === this.CHANNEL_NAME.toLowerCase() ||
            item.snippet.title.toLowerCase().includes('rafal electric')
          );
          
          if (exactMatch) {
            this.channelId = exactMatch.snippet.channelId;
            console.log('Found RAFAL Electric channel via exact search:', this.channelId);
            return this.channelId;
          }
        }
      }

      // Method 3: Search with alternative terms
      const searchTerms = ['rafalelectric', 'rafal+electric+appliances', 'rafal+electrical'];
      
      for (const term of searchTerms) {
        response = await fetch(
          `${this.BASE_URL}/search?part=snippet&type=channel&q=${term}&maxResults=5&key=${this.API_KEY}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            // Look for RAFAL Electric related channels
            const rafalChannel = data.items.find((item: any) => 
              item.snippet.title.toLowerCase().includes('rafal') ||
              item.snippet.description.toLowerCase().includes('rafal') ||
              item.snippet.description.toLowerCase().includes('electric')
            );
            
            if (rafalChannel) {
              this.channelId = rafalChannel.snippet.channelId;
              console.log(`Found RAFAL Electric channel via search term "${term}":`, this.channelId);
              return this.channelId;
            }
          }
        }
      }

      console.warn('Could not find RAFAL Electric channel automatically');
      return null;
    } catch (error) {
      console.error('Error getting RAFAL Electric channel ID:', error);
      return null;
    }
  }

  // Fetch ALL videos from RAFAL Electric channel only
  static async getChannelVideos(maxResults: number = 50): Promise<YouTubeVideo[]> {
    try {
      if (!this.API_KEY) {
        console.warn('YouTube API key not found. Cannot fetch real channel videos.');
        return [];
      }

      const channelId = await this.getChannelId();
      
      if (!channelId) {
        console.warn('Could not find RAFAL Electric channel.');
        return [];
      }

      const allVideos: YouTubeVideo[] = [];
      let nextPageToken = '';
      let totalFetched = 0;

      // Fetch videos with pagination to get ALL videos from RAFAL Electric
      do {
        const pageTokenParam = nextPageToken ? `&pageToken=${nextPageToken}` : '';
        const resultsPerPage = Math.min(50, maxResults - totalFetched);
        
        const searchResponse = await fetch(
          `${this.BASE_URL}/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=${resultsPerPage}${pageTokenParam}&key=${this.API_KEY}`
        );

        if (!searchResponse.ok) {
          throw new Error(`Search API error! status: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();
        
        if (searchData.error) {
          console.error('YouTube Search API Error:', searchData.error);
          break;
        }

        if (!searchData.items || searchData.items.length === 0) {
          console.log('No more videos found from RAFAL Electric channel');
          break;
        }

        // Get video IDs for this page
        const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
        
        // Fetch detailed information for these videos
        const detailsResponse = await fetch(
          `${this.BASE_URL}/videos?part=contentDetails,statistics,snippet&id=${videoIds}&key=${this.API_KEY}`
        );

        if (!detailsResponse.ok) {
          console.error(`Details API error! status: ${detailsResponse.status}`);
          break;
        }

        const detailsData = await detailsResponse.json();

        if (detailsData.error) {
          console.error('YouTube Details API Error:', detailsData.error);
          break;
        }

        // Process videos for this page - only from RAFAL Electric
        const pageVideos = searchData.items
          .filter((item: any) => {
            // Ensure video is from RAFAL Electric channel
            return item.snippet.channelId === channelId;
          })
          .map((item: any) => {
            const details = detailsData.items?.find((detail: any) => detail.id === item.id.videoId);
            
            return {
              id: item.id.videoId,
              title: item.snippet.title,
              description: this.truncateDescription(item.snippet.description || ''),
              thumbnail: this.getBestThumbnail(item.snippet.thumbnails),
              publishedAt: item.snippet.publishedAt,
              duration: this.formatDuration(details?.contentDetails?.duration || 'PT0S'),
              viewCount: this.formatViewCount(details?.statistics?.viewCount || '0'),
              videoUrl: `https://www.youtube.com/embed/${item.id.videoId}?rel=0&modestbranding=1`
            };
          });

        allVideos.push(...pageVideos);
        totalFetched += pageVideos.length;
        nextPageToken = searchData.nextPageToken || '';

        console.log(`Fetched ${pageVideos.length} videos from RAFAL Electric (total: ${totalFetched})`);

      } while (nextPageToken && totalFetched < maxResults);

      console.log(`Successfully fetched ${allVideos.length} total videos from RAFAL Electric channel`);
      return allVideos;

    } catch (error) {
      console.error('Error fetching RAFAL Electric YouTube videos:', error);
      return [];
    }
  }

  // Get videos from RAFAL Electric uploads playlist
  static async getChannelUploads(maxResults: number = 50): Promise<YouTubeVideo[]> {
    try {
      if (!this.API_KEY) {
        return [];
      }

      const channelId = await this.getChannelId();
      if (!channelId) {
        return [];
      }

      // Get channel details to find uploads playlist
      const channelResponse = await fetch(
        `${this.BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${this.API_KEY}`
      );

      if (!channelResponse.ok) {
        throw new Error(`Channel API error! status: ${channelResponse.status}`);
      }

      const channelData = await channelResponse.json();
      const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

      if (!uploadsPlaylistId) {
        console.warn('Could not find RAFAL Electric uploads playlist');
        return this.getChannelVideos(maxResults);
      }

      const allVideos: YouTubeVideo[] = [];
      let nextPageToken = '';
      let totalFetched = 0;

      // Fetch from RAFAL Electric uploads playlist with pagination
      do {
        const pageTokenParam = nextPageToken ? `&pageToken=${nextPageToken}` : '';
        const resultsPerPage = Math.min(50, maxResults - totalFetched);
        
        const playlistResponse = await fetch(
          `${this.BASE_URL}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${resultsPerPage}${pageTokenParam}&key=${this.API_KEY}`
        );

        if (!playlistResponse.ok) {
          throw new Error(`Playlist API error! status: ${playlistResponse.status}`);
        }

        const playlistData = await playlistResponse.json();
        
        if (!playlistData.items || playlistData.items.length === 0) {
          break;
        }

        // Get video IDs for detailed information
        const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');
        
        const detailsResponse = await fetch(
          `${this.BASE_URL}/videos?part=contentDetails,statistics,snippet&id=${videoIds}&key=${this.API_KEY}`
        );

        if (!detailsResponse.ok) {
          console.error(`Details API error! status: ${detailsResponse.status}`);
          break;
        }

        const detailsData = await detailsResponse.json();

        // Process videos - ensure they're from RAFAL Electric
        const pageVideos = playlistData.items
          .filter((item: any) => {
            // Double-check channel ownership
            return item.snippet.channelId === channelId;
          })
          .map((item: any) => {
            const videoId = item.snippet.resourceId.videoId;
            const details = detailsData.items?.find((detail: any) => detail.id === videoId);
            
            return {
              id: videoId,
              title: item.snippet.title,
              description: this.truncateDescription(item.snippet.description || ''),
              thumbnail: this.getBestThumbnail(item.snippet.thumbnails),
              publishedAt: item.snippet.publishedAt,
              duration: this.formatDuration(details?.contentDetails?.duration || 'PT0S'),
              viewCount: this.formatViewCount(details?.statistics?.viewCount || '0'),
              videoUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
            };
          });

        allVideos.push(...pageVideos);
        totalFetched += pageVideos.length;
        nextPageToken = playlistData.nextPageToken || '';

      } while (nextPageToken && totalFetched < maxResults);

      console.log(`Successfully fetched ${allVideos.length} videos from RAFAL Electric uploads playlist`);
      return allVideos;

    } catch (error) {
      console.error('Error fetching from RAFAL Electric uploads playlist:', error);
      return this.getChannelVideos(maxResults);
    }
  }

  // Get the best available thumbnail
  private static getBestThumbnail(thumbnails: any): string {
    if (thumbnails.maxres) return thumbnails.maxres.url;
    if (thumbnails.high) return thumbnails.high.url;
    if (thumbnails.medium) return thumbnails.medium.url;
    if (thumbnails.standard) return thumbnails.standard.url;
    return thumbnails.default?.url || '';
  }

  // Truncate description to reasonable length
  private static truncateDescription(description: string): string {
    const maxLength = 150;
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
  }

  // Format ISO 8601 duration to readable format
  private static formatDuration(duration: string): string {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Format view count to readable format
  private static formatViewCount(viewCount: string): string {
    const count = parseInt(viewCount);
    if (isNaN(count)) return '0 views';
    
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }
    return `${count} views`;
  }

  // Minimal fallback data - only RAFAL Electric related content
  static getChannelOnlyVideos(): YouTubeVideo[] {
    return [
      {
        id: 'rafal-demo-1',
        title: 'RAFAL Electric - Official Channel Introduction',
        description: 'Welcome to RAFAL Electric official YouTube channel. Discover our range of premium electrical appliances.',
        thumbnail: 'https://images.pexels.com/photos/1599791/pexels-photo-1599791.jpeg?auto=compress&cs=tinysrgb&w=600',
        publishedAt: '2024-01-15T10:00:00Z',
        duration: '2:30',
        viewCount: 'Visit our channel',
        videoUrl: 'https://www.youtube.com/@rafalelectric'
      }
    ];
  }

  // Refresh videos from RAFAL Electric channel only
  static async refreshChannelVideos(): Promise<YouTubeVideo[]> {
    console.log('Refreshing RAFAL Electric YouTube videos...');
    
    // Clear cached channel ID to force refresh
    this.channelId = null;
    
    try {
      // Try uploads playlist method first (more reliable for channel content)
      const videos = await this.getChannelUploads(50);
      
      if (videos.length > 0) {
        console.log(`Successfully refreshed ${videos.length} videos from RAFAL Electric`);
        return videos;
      }
      
      // Fallback to search method
      const searchVideos = await this.getChannelVideos(50);
      
      if (searchVideos.length > 0) {
        console.log(`Successfully refreshed ${searchVideos.length} videos via search from RAFAL Electric`);
        return searchVideos;
      }
      
      // If no real videos found, return empty array (no mock data)
      console.log('No videos found from RAFAL Electric channel');
      return [];
      
    } catch (error) {
      console.error('Error refreshing RAFAL Electric videos:', error);
      return [];
    }
  }

  // Get RAFAL Electric channel statistics
  static async getChannelStats(): Promise<any> {
    try {
      if (!this.API_KEY) return null;

      const channelId = await this.getChannelId();
      if (!channelId) return null;

      const response = await fetch(
        `${this.BASE_URL}/channels?part=statistics&id=${channelId}&key=${this.API_KEY}`
      );

      if (!response.ok) return null;

      const data = await response.json();
      return data.items?.[0]?.statistics || null;
    } catch (error) {
      console.error('Error fetching RAFAL Electric channel stats:', error);
      return null;
    }
  }

  // Verify if a video belongs to RAFAL Electric channel
  static async verifyChannelVideo(videoId: string): Promise<boolean> {
    try {
      if (!this.API_KEY) return false;

      const channelId = await this.getChannelId();
      if (!channelId) return false;

      const response = await fetch(
        `${this.BASE_URL}/videos?part=snippet&id=${videoId}&key=${this.API_KEY}`
      );

      if (!response.ok) return false;

      const data = await response.json();
      const video = data.items?.[0];
      
      return video?.snippet?.channelId === channelId;
    } catch (error) {
      console.error('Error verifying video channel:', error);
      return false;
    }
  }
}