export interface Artist {
  id: number
  name: string
  spotify_id?: string
  youtube_channel_id?: string
  spotify_followers?: number
  spotify_popularity?: number
  monthly_listeners?: number
  youtube_subscribers?: number
  youtube_views?: number
  youtube_videos_count?: number
  score?: number
  genre: string
  country?: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface Opportunity {
  artist_id: number
  name: string
  score: number
  category: string
  recommendation: string
  spotify_id?: string
  youtube_channel_id?: string
  spotify_followers: number
  youtube_subscribers: number
  spotify_popularity: number
  updated_at?: string
}

export interface OpportunitiesResponse {
  total_opportunities: number
  opportunities: Opportunity[]
}

export interface CollectionResult {
  success: boolean
  artist_name: string
  artist_id?: number
  spotify_data_collected: boolean
  youtube_data_collected: boolean
  errors: string[]
}

export interface BatchCollectionResult {
  total_artists: number
  successful_collections: number
  failed_collections: number
  artists_processed: Array<{
    name: string
    artist_id?: number
    status: 'success' | 'failed' | 'error'
    spotify_collected?: boolean
    youtube_collected?: boolean
    errors?: string[]
    error?: string
  }>
  errors: string[]
}
