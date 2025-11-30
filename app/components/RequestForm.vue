<script setup lang="ts">
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

const searchQuery = ref('')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const searchResults = ref<any[]>([])
const searching = ref(false)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectedVideo = ref<any | null>(null)
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
      const { data } = await useFetch('/api/youtube/search', {
        params: { q: searchQuery.value }
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      searchResults.value = (data.value as any)?.items || []
    } catch (e) {
      console.error('Search error', e)
    } finally {
      searching.value = false
    }
  }, 500)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function selectVideo(video: any) {
  selectedVideo.value = video
  searchResults.value = [] // Clear results to show selection UI
}

function submitRequest() {
  if (!selectedVideo.value) return

  emit('submit', {
    song_title: selectedVideo.value.snippet.title,
    song_artist: selectedVideo.value.snippet.channelTitle,
    youtube_url: selectedVideo.value.id.videoId,
    user_comment: userComment.value
  })
}
</script>

<template>
  <div class="flex flex-col gap-4 rounded-lg bg-white/5 p-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-bold text-white">
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
      <div class="flex flex-col gap-3 rounded-lg bg-white/10 p-3">
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
            <p class="font-bold text-white line-clamp-2">
              {{ selectedVideo.snippet.title }}
            </p>
            <p class="text-sm text-white/70">
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
        class="flex max-h-60 flex-col gap-2 overflow-y-auto"
      >
        <button
          v-for="video in searchResults"
          :key="video.id.videoId"
          class="flex items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-white/10"
          @click="selectVideo(video)"
        >
          <img
            :src="video.snippet.thumbnails.default.url"
            class="h-12 w-20 rounded object-cover"
          >
          <div>
            <p class="text-sm font-bold text-white line-clamp-2">
              {{ video.snippet.title }}
            </p>
            <p class="text-xs text-white/70">
              {{ video.snippet.channelTitle }}
            </p>
          </div>
        </button>
      </div>
      <div
        v-else-if="searchQuery.length >= 3 && !searching"
        class="text-center text-sm text-white/50"
      >
        No results found
      </div>
    </div>
  </div>
</template>
