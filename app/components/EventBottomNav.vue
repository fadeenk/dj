<script setup lang="ts">
const route = useRoute()
const code = route.params.code as string

// Determine active tab based on current route
const isRequestsActive = computed(() => route.path === `/event/${code}`)
const isFeedbackActive = computed(() => route.path === `/event/${code}/feedback`)
const isTipsActive = computed(() => route.path === `/event/${code}/tips`)
const isInfoActive = computed(() => route.path === `/event/${code}/info`)
</script>

<template>
  <nav class="fixed bottom-0 z-20 w-full border-t border-white/10 bg-background-dark/80 backdrop-blur-sm">
    <UContainer>
      <div class="flex h-20 items-center justify-around">
        <NuxtLink
          :to="`/event/${code}`"
          class="flex flex-col items-center gap-1 transition-colors"
          :class="isRequestsActive ? 'text-primary' : 'text-white/70'"
        >
          <UIcon
            name="i-heroicons-musical-note"
            class="text-2xl"
            :class="isRequestsActive ? 'font-bold' : ''"
          />
          <span class="text-xs font-medium">Requests</span>
        </NuxtLink>

        <NuxtLink
          :to="`/event/${code}/feedback`"
          class="flex flex-col items-center gap-1 transition-colors"
          :class="isFeedbackActive ? 'text-primary' : 'text-white/70'"
        >
          <UIcon
            name="i-heroicons-chat-bubble-left-ellipsis"
            class="text-2xl"
            :class="isFeedbackActive ? 'font-bold' : ''"
          />
          <span class="text-xs font-medium">Feedback</span>
        </NuxtLink>

        <NuxtLink
          :to="`/event/${code}/tips`"
          class="flex flex-col items-center gap-1 transition-colors"
          :class="isTipsActive ? 'text-primary' : 'text-white/70'"
        >
          <UIcon
            name="i-lucide-hand-coins"
            class="text-2xl"
            :class="isTipsActive ? 'font-bold' : ''"
          />
          <span class="text-xs font-medium">Tips</span>
        </NuxtLink>

        <NuxtLink
          :to="`/event/${code}/info`"
          class="flex flex-col items-center gap-1 transition-colors"
          :class="isInfoActive ? 'text-primary' : 'text-white/70'"
        >
          <UIcon
            name="i-heroicons-information-circle"
            :class="[
              'text-2xl',
              isInfoActive ? 'font-bold' : ''
            ]"
          />
          <span class="text-xs font-medium">Event Info</span>
        </NuxtLink>
      </div>
    </UContainer>
  </nav>
</template>
