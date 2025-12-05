<script setup lang="ts">
interface YouTubeThumbnail {
  url: string
  width: number
  height: number
}

interface YouTubeThumbnails {
  default: YouTubeThumbnail
  medium: YouTubeThumbnail
  high: YouTubeThumbnail
}

interface YouTubeVideoSnippet {
  title: string
  channelTitle: string
  thumbnails: YouTubeThumbnails
}

interface YouTubeVideoId {
  videoId: string
}

interface YouTubeSearchItem {
  id: YouTubeVideoId
  snippet: YouTubeVideoSnippet
}

interface YouTubeSearchResponse {
  items: YouTubeSearchItem[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  eventId: string
}>()

const emit = defineEmits<{
  (e: 'submit', data: {
    song_title: string
    song_artist: string
    youtube_url: string
    user_comment: string
  }): void
  (e: 'cancel'): void
}>()

const config = useRuntimeConfig()
const loading = ref(false)
const searchQuery = ref('')
const searchResults = ref<YouTubeSearchItem[]>([])
const searching = ref(false)
const selectedVideo = ref<YouTubeSearchItem | null>(null)
const userComment = ref('')

// Debounce search
let searchTimeout: NodeJS.Timeout
const handleSearch = () => {
  clearTimeout(searchTimeout)
  if (!searchQuery.value || searchQuery.value.length < 3) {
    searchResults.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    searching.value = true
    try {
      // Call YouTube API directly from client
      const response = await $fetch<YouTubeSearchResponse>('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: searchQuery.value,
          type: 'video',
          key: config.public.youtubeApiKey,
          order: 'viewCount',
          maxResults: 30
        }
      })

      searchResults.value = response.items.map((item: YouTubeSearchItem) => ({
        id: { videoId: item.id.videoId },
        snippet: {
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          thumbnails: item.snippet.thumbnails
        }
      }))
    } catch (e) {
      console.error('YouTube API Error:', e)
      searchResults.value = []
    } finally {
      searching.value = false
    }
  }, 500)
}

function selectVideo(video: YouTubeSearchItem) {
  selectedVideo.value = video
  searchResults.value = [] // Clear results to show selection UI
}

async function submitRequest() {
  if (!selectedVideo.value) return
  loading.value = true

  const { status } = await useFetch('https://metube.mrkannah.com/add', {
    method: 'POST',
    body: {
      url: 'https://www.youtube.com/watch?v=' + selectedVideo.value.id.videoId,
      quality: 'best',
      format: 'mp3',
      playlist_strict_mode: false,
      auto_start: true
    }
  })

  if (status.value === 'success') {
    emit('submit', {
      song_title: selectedVideo.value.snippet.title,
      song_artist: selectedVideo.value.snippet.channelTitle,
      youtube_url: selectedVideo.value.id.videoId,
      user_comment: userComment.value
    })
  }

  loading.value = false
}
</script>

<template>
  <div class="gradient-border-wrapper">
    <div class="flex flex-col gap-4 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold">
          Request a Song
        </h3>
        <UButton
          icon="i-heroicons-x-mark"
          color="neutral"
          variant="ghost"
          @click="$emit('cancel')"
        />
      </div>

      <!-- Selection State -->
      <div
        v-if="selectedVideo"
        class="flex flex-col gap-4"
      >
        <div class="flex flex-col gap-3 rounded-lg p-3">
          <!-- Video Preview -->
          <div
            class="relative w-full"
            style="padding-bottom: 56.25%;"
          >
            <iframe
              :src="`https://www.youtube.com/embed/${selectedVideo.id.videoId}`"
              class="absolute inset-0 h-full w-full rounded"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          </div>

          <!-- Video Info -->
          <div class="flex items-start gap-3">
            <div class="flex-1">
              <p class="font-bold line-clamp-2">
                {{ selectedVideo.snippet.title }}
              </p>
              <p class="text-sm text-toned">
                {{ selectedVideo.snippet.channelTitle }}
              </p>
            </div>
            <UButton
              icon="i-heroicons-trash"
              color="error"
              variant="ghost"
              size="xs"
              @click="selectedVideo = null"
            />
          </div>
        </div>

        <UTextarea
          v-model="userComment"
          placeholder="Add a comment or dedication (optional)..."
          :rows="2"
        />

        <GradientButton
          block
          label="Submit Request"
          variant="rounded"
          size="md"
          :loading="loading"
          @click="submitRequest"
        />
      </div>

      <!-- Search State -->
      <div
        v-else
        class="flex flex-col gap-4"
      >
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="Search YouTube..."
          autofocus
          :loading="searching"
          @input="handleSearch"
        />

        <div
          v-if="searchResults.length > 0"
          class="flex max-h-80 flex-col gap-2 overflow-y-auto"
        >
          <button
            v-for="video in searchResults"
            :key="video.id.videoId"
            class="flex items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accented"
            @click="selectVideo(video)"
          >
            <img
              :src="video.snippet.thumbnails.default.url"
              class="h-12 w-20 rounded object-cover"
            >
            <div>
              <p class="text-sm font-bold line-clamp-2">
                {{ video.snippet.title }}
              </p>
              <p class="text-xs text-toned">
                {{ video.snippet.channelTitle }}
              </p>
            </div>
          </button>
        </div>
        <div
          v-else-if="searchQuery.length >= 3 && !searching"
          class="text-center text-sm text-muted"
        >
          No results found
        </div>
      </div>
    </div>
  </div>
</template>
