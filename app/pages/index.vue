<script setup lang="ts">
const supabase = useSupabaseClient()
const events = ref([])
const loading = ref(true)

onMounted(async () => {
  // Get today's date in local time formatted as YYYY-MM-DD
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .or(`and(start_time.gte.${startOfToday.toISOString()},start_time.lt.${endOfToday.toISOString()}),and(end_time.gte.${startOfToday.toISOString()},end_time.lt.${endOfToday.toISOString()})`)
      .order('start_time', { ascending: true })

    if (error) throw error
    events.value = data || []
  } catch (error) {
    console.error('Error fetching events:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
        <UContainer>

    <div
      class="text-lg sm:text-xl/8 text-muted text-balance py-8 text-center"
    >
      Find your event, request your favorite songs, and keep the party going.
    </div>
    </UContainer>

    <UContainer>
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Today's Events
        </h2>
        <span class="text-sm text-gray-500">
          {{ new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
        </span>
      </div>

      <div
        v-if="loading"
        class="flex justify-center py-12"
      >
        <UIcon
          name="i-heroicons-arrow-path"
          class="animate-spin text-3xl text-primary-500"
        />
      </div>

      <div
        v-else-if="events.length > 0"
        class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <UCard
          v-for="event in events"
          :key="event.id"
          class="hover:ring-2 hover:ring-primary-500 transition-all cursor-pointer"
          @click="navigateTo(`/event/${event.code}`)"
        >
          <template #header>
            <div class="flex justify-between items-start">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white line-clamp-1">
                {{ event.name }}
              </h3>
              <UBadge
                color="primary"
                variant="subtle"
              >
                {{ event.code }}
              </UBadge>
            </div>
          </template>

          <div class="space-y-3">
            <div
              v-if="event.location"
              class="flex items-start text-gray-600 dark:text-gray-300"
            >
              <UIcon
                name="i-heroicons-map-pin"
                class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              />
              <span class="line-clamp-2">{{ event.location }}</span>
            </div>

            <div
              v-if="event.start_time"
              class="flex items-center text-gray-600 dark:text-gray-300"
            >
              <UIcon
                name="i-heroicons-clock"
                class="w-5 h-5 mr-2 flex-shrink-0"
              />
              <span>
                {{ new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                <span v-if="event.end_time"> - {{ new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
              </span>
            </div>

            <div
              v-if="event.description"
              class="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mt-2"
            >
              {{ event.description }}
            </div>
          </div>

          <template #footer>
            <UButton
              block
              color="primary"
              variant="solid"
              label="Join Event"
              :to="`/event/${event.code}`"
            />
          </template>
        </UCard>
      </div>

      <div
        v-else
        class="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700"
      >
        <UIcon
          name="i-heroicons-calendar"
          class="w-12 h-12 text-gray-400 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No events found for today
        </h3>
        <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          There are no active events scheduled for today. Check back later or contact your DJ.
        </p>
      </div>
    </UContainer>
  </div>
</template>
