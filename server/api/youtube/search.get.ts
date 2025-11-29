export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiKey = config.youtubeApiKey
  const query = getQuery(event)
  const q = query.q as string

  if (!q) {
    return {
      items: []
    }
  }

  if (!apiKey) {
    console.error('YouTube API Key is missing. Please set NUXT_YOUTUBE_API_KEY in .env')
    throw createError({
      statusCode: 500,
      statusMessage: 'Server configuration error: YouTube API key missing'
    })
  }

  try {
    const response = await $fetch<{ items: any[] }>('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q,
        type: 'video',
        key: apiKey,
        order: 'viewCount',
        maxResults: 30
      }
    })

    return {
      items: response.items.map((item: any) => ({
        id: { videoId: item.id.videoId },
        snippet: {
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          thumbnails: item.snippet.thumbnails
        }
      }))
    }
  } catch (error: any) {
    console.error('YouTube API Error:', error)
    throw createError({
      statusCode: error?.response?.status || 500,
      statusMessage: 'Failed to search YouTube videos'
    })
  }
})
