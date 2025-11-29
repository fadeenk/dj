<script setup lang="ts">
import type { Database } from '~/types/database.types'

type Request = Database['public']['Tables']['requests']['Row']

const props = defineProps<{
  request: Request
  isAdmin?: boolean
  hasUpvoted?: boolean
}>()

const emit = defineEmits<{
  (e: 'vote', id: string): void
  (e: 'updateStatus', id: string, status: Database['public']['Enums']['request_status']): void
}>()

const statusColors = {
  pending: 'orange',
  ready: 'success',
  played: 'neutral',
  ignored: 'error'
} as const

const isVoting = ref(false)

async function handleVote() {
  if (props.isAdmin || isVoting.value) return
  isVoting.value = true
  emit('vote', props.request.id)
  setTimeout(() => {
    isVoting.value = false
  }, 1000) // Prevent spam
}
</script>

<template>
  <div class="relative flex flex-col gap-3 rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10">
    <!-- Status Badge (Admin or if not pending) -->
    <div
      v-if="request.status && request.status !== 'pending'"
      class="absolute right-4 top-4"
    >
      <UBadge
        :color="statusColors[request.status]"
        variant="subtle"
        size="xs"
      >
        {{ request.status.toUpperCase() }}
      </UBadge>
    </div>

    <div class="flex items-start gap-4">
      <!-- Thumbnail -->
      <div class="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-black/50">
        <img
          v-if="request.youtube_url"
          :src="`https://img.youtube.com/vi/${request.youtube_url}/mqdefault.jpg`"
          class="h-full w-full object-cover"
          alt="Thumbnail"
        >
        <div
          v-else
          class="flex h-full w-full items-center justify-center"
        >
          <UIcon
            name="i-heroicons-musical-note"
            class="text-2xl text-white/20"
          />
        </div>
      </div>

      <!-- Info -->
      <div class="flex min-w-0 flex-1 flex-col">
        <h3 class="truncate text-base font-bold text-white underline hover:text-primary">
          <a :href="`https://www.youtube.com/watch?v=${request.youtube_url}`" target="_blank">
            {{ request.song_title }}
            <UIcon name="i-heroicons-arrow-top-right-on-square" />
          </a>
        </h3>
        <p class="truncate text-sm text-white/70">
          {{ request.song_artist }}
        </p>
        <div class="mt-1 flex items-center gap-2 text-xs text-white/50">
          <UIcon
            name="i-heroicons-user"
            class="text-xs"
          />
          <span class="truncate">Requested by {{ request.user_name || 'Anonymous' }}</span>
        </div>
        <div
          v-if="request.user_comment"
          class="mt-2 text-sm italic text-white/80"
        >
          "{{ request.user_comment }}"
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-between border-t border-white/5 pt-3">
      <!-- Vote Count -->
      <button
        class="flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors"
        :class="[
          isAdmin ? 'cursor-default' : 'hover:bg-white/10 active:scale-95',
          hasUpvoted ? 'text-primary' : 'text-white/50'
        ]"
        @click="handleVote"
      >
        <UIcon
          :name="hasUpvoted || (isAdmin && request.upvotes! > 0) ? 'i-heroicons-hand-thumb-up-solid' : 'i-heroicons-hand-thumb-up'"
          :class="hasUpvoted || (isAdmin && request.upvotes! > 0) ? 'text-primary' : ''"
        />
        <span class="text-sm font-medium">{{ request.upvotes || 0 }}</span>
      </button>

      <!-- Admin Actions -->
      <div
        v-if="isAdmin"
        class="flex items-center gap-2"
      >
        <UButton
          v-if="request.status !== 'played'"
          icon="i-heroicons-check"
          color="success"
          variant="ghost"
          size="xs"
          title="Mark as Played"
          @click="$emit('updateStatus', request.id, 'played')"
        />
        <UButton
          v-if="request.status !== 'ready'"
          icon="i-heroicons-play"
          color="primary"
          variant="ghost"
          size="xs"
          title="Mark as Ready"
          @click="$emit('updateStatus', request.id, 'ready')"
        />
        <UButton
          v-if="request.status !== 'ignored'"
          icon="i-heroicons-x-mark"
          color="error"
          variant="ghost"
          size="xs"
          title="Ignore"
          @click="$emit('updateStatus', request.id, 'ignored')"
        />
      </div>
    </div>
  </div>
</template>
