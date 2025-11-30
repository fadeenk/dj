<script setup lang="ts">
import QRCode from 'qrcode'

const supabase = useSupabaseClient()
const toast = useToast()

definePageMeta({
  middleware: 'auth'
})

// Types
interface Event {
  id: string
  name: string
  code: string
  is_active: boolean | null
  dj_id: string
  location?: string | null
  start_time: string
  end_time?: string | null
  description?: string | null
  house_rules?: string | null
}

// State
const events = ref<Event[]>([])
const loading = ref(true)
const isCreateModalOpen = ref(false)
const isQrModalOpen = ref(false)
const qrCodeUrl = ref('')
const selectedEvent = ref<Event | null>(null)
const newEvent = ref({
  name: '',
  code: '',
  date: new Date().toISOString().split('T')[0],
  is_active: true,
  location: '',
  start_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  end_time: '23:59',
  description: '',
  house_rules: ''
})
const creating = ref(false)

// Fetch events
async function fetchEvents() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_time', { ascending: false })

    if (error) throw error
    if (error) throw error
    events.value = (data as unknown as Event[]) || []
  } catch (error: any) {
    toast.add({
      title: 'Error fetching events',
      description: error.message,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Create event
async function createEvent() {
  creating.value = true
  try {
    console.log('--- DEBUG EVENT CREATION ---')

    // Get user ID from session directly (more reliable than user.value)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !sessionData.session) {
      throw new Error('Could not get user session')
    }

    const userId = sessionData.session.user.id
    console.log('User ID from session:', userId)

    // Combine date and time
    const startDateTime = new Date(`${newEvent.value.date}T${newEvent.value.start_time}`)
    const endDateTime = new Date(`${newEvent.value.date}T${newEvent.value.end_time}`)

    // Handle next day logic
    if (endDateTime < startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventData: any = {
      name: newEvent.value.name,
      code: newEvent.value.code,
      is_active: newEvent.value.is_active,
      dj_id: userId,
      location: newEvent.value.location || null,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      description: newEvent.value.description || null,
      house_rules: newEvent.value.house_rules || null
    }

    console.log('Payload:', eventData)
    console.log('----------------------------')

    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single()

    if (error) throw error

    events.value.unshift(data as unknown as Event)
    isCreateModalOpen.value = false
    newEvent.value = {
      name: '',
      code: '',
      date: new Date().toISOString().split('T')[0],
      is_active: true,
      location: '',
      start_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      end_time: '23:59',
      description: '',
      house_rules: ''
    }
    toast.add({
      title: 'Event created',
      color: 'success'
    })
  } catch (error: any) {
    console.error('Event creation error:', error)
    toast.add({
      title: 'Error creating event',
      description: error.message,
      color: 'error'
    })
  } finally {
    creating.value = false
  }
}

// Toggle active status
async function toggleEventStatus(event: Event) {
  try {
    const { error } = await supabase
      .from('events')
      .update({ is_active: !event.is_active })
      .eq('id', event.id)

    if (error) throw error

    event.is_active = !event.is_active
    toast.add({
      title: 'Status updated',
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: 'Error updating status',
      description: error.message,
      color: 'error'
    })
  }
}

// Delete event
async function deleteEvent(id: string) {
  if (!confirm('Are you sure you want to delete this event?')) return

  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) throw error

    events.value = events.value.filter(e => e.id !== id)
    toast.add({
      title: 'Event deleted',
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: 'Error deleting event',
      description: error.message,
      color: 'error'
    })
  }
}

// Generate QR Code
async function showQrCode(event: Event) {
  selectedEvent.value = event
  const url = `${window.location.origin}/event/${event.code}`
  try {
    qrCodeUrl.value = await QRCode.toDataURL(url, { width: 300 })
    isQrModalOpen.value = true
  } catch (err) {
    console.error(err)
    toast.add({
      title: 'Error generating QR code',
      color: 'error'
    })
  }
}

function copyLink() {
  if (!selectedEvent.value) return
  const url = `${window.location.origin}/event/${selectedEvent.value.code}`
  navigator.clipboard.writeText(url)
  toast.add({
    title: 'Link copied to clipboard',
    color: 'success'
  })
}

// Unread feedback count
const unreadFeedbackCount = ref(0)

async function fetchUnreadFeedbackCount() {
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user.id

    if (!userId) return

    const { count, error } = await supabase
      .from('feedback')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      // We need to filter by events owned by this DJ
      // This is a bit complex with RLS, but since we have RLS policy "DJs can view feedback for their events"
      // we can just query feedback directly and RLS will filter it for us?
      // Let's verify RLS policy:
      // CREATE POLICY "DJs can view feedback for their events" ON public.feedback FOR SELECT USING (EXISTS (SELECT 1 FROM public.events WHERE public.events.id = public.feedback.event_id AND public.events.dj_id = auth.uid()))
      // Yes, RLS handles it!

    if (error) throw error
    unreadFeedbackCount.value = count || 0
  } catch (error) {
    console.error('Error fetching unread feedback count:', error)
  }
}

// Subscribe to new feedback
function subscribeToFeedback() {
  console.log('Subscribing to feedback changes...')
  const channel = supabase
    .channel('dashboard-feedback')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'feedback'
      },
      (payload) => {
        console.log('Realtime feedback received:', payload)
        // Increment count on new feedback
        // We could check if it belongs to us, but RLS might not filter realtime events payload if we don't use filter
        // Ideally we should refetch count to be safe and accurate
        fetchUnreadFeedbackCount()
        toast.add({
          title: 'New feedback received!',
          color: 'primary',
          icon: 'i-heroicons-chat-bubble-left-ellipsis'
        })
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status)
    })

  return channel
}

// Initial fetch
onMounted(() => {
  fetchEvents()
  fetchUnreadFeedbackCount()
  const channel = subscribeToFeedback()

  onUnmounted(() => {
    supabase.removeChannel(channel)
  })
})
</script>

<template>
  <div class="p-4 max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">
        Event Management
      </h1>
      <div class="flex gap-2">
        <UChip
          :text="unreadFeedbackCount"
          :show="unreadFeedbackCount > 0"
          color="error"
          size="2xl"
        >
          <UButton
            to="/admin/feedback"
            icon="i-heroicons-chat-bubble-left-ellipsis"
            color="neutral"
            variant="soft"
            label="View Feedback"
          />
        </UChip>
        <UButton
          icon="i-heroicons-plus"
          color="primary"
          label="Create Event"
          @click="isCreateModalOpen = true"
        />
      </div>
    </div>

    <div
      v-if="loading"
      class="flex justify-center py-8"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin text-2xl"
      />
    </div>

    <div
      v-else-if="events.length === 0"
      class="text-center py-8 text-gray-500"
    >
      No events found. Create one to get started!
    </div>

    <div
      v-else
      class="space-y-4"
    >
      <UCard
        v-for="event in events"
        :key="event.id"
      >
        <div class="flex flex-col gap-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-xl font-semibold">
                {{ event.name }}
              </h3>
              <p class="text-sm text-gray-500">
                Code: {{ event.code }}
              </p>
              <p class="text-sm text-gray-500">
                Date: {{ new Date(event.start_time).toLocaleDateString() }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <UBadge :color="event.is_active ? 'success' : 'neutral'">
                {{ event.is_active ? 'Active' : 'Inactive' }}
              </UBadge>
              <UButton
                icon="i-heroicons-qr-code"
                color="neutral"
                variant="ghost"
                title="View QR Code"
                @click="showQrCode(event)"
              />
              <UButton
                :icon="event.is_active ? 'i-heroicons-pause' : 'i-heroicons-play'"
                color="neutral"
                variant="ghost"
                :title="event.is_active ? 'Deactivate' : 'Activate'"
                @click="toggleEventStatus(event)"
              />
              <UButton
                icon="i-heroicons-trash"
                color="error"
                variant="ghost"
                title="Delete"
                @click="deleteEvent(event.id)"
              />
            </div>
          </div>

          <!-- Request Manager (Collapsible or always visible for active events?) -->
          <!-- Let's make it expandable -->
          <UAccordion
            :items="[{ label: 'Manage Requests', slot: 'requests' }]"
            variant="soft"
          >
            <template #requests>
              <RequestQueue :event-id="event.id" is-admin />
            </template>
          </UAccordion>
        </div>
      </UCard>
    </div>

    <!-- Create Event Modal -->
    <UModal
      v-model:open="isCreateModalOpen"
      title="Create New Event"
    >
      <template #body>
        <form
          id="create-event-form"
          class="space-y-4"
          @submit.prevent="createEvent"
        >
          <UFormField
            label="Event Name"
            required
          >
            <UInput
              v-model="newEvent.name"
              placeholder="e.g. Friday Night Party"
              required
            />
          </UFormField>

          <UFormField
            label="Event Code"
            required
            help="Unique code for guests to join"
          >
            <UInput
              v-model="newEvent.code"
              placeholder="e.g. PARTY123"
              required
            />
          </UFormField>

          <UFormField
            label="Date"
            required
          >
            <UInput
              v-model="newEvent.date"
              type="date"
              required
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Start Time">
              <UInput
                v-model="newEvent.start_time"
                type="time"
                placeholder="e.g. 21:00"
              />
            </UFormField>

            <UFormField label="End Time">
              <UInput
                v-model="newEvent.end_time"
                type="time"
                placeholder="e.g. 02:00"
              />
            </UFormField>
          </div>

          <UFormField label="Location">
            <UInput
              v-model="newEvent.location"
              placeholder="e.g. The Void, 123 Electric Ave, Downtown"
            />
          </UFormField>

          <UFormField label="Description">
            <UTextarea
              v-model="newEvent.description"
              placeholder="About the event..."
              :rows="3"
            />
          </UFormField>

          <UFormField
            label="House Rules"
            help="One rule per line"
          >
            <UTextarea
              v-model="newEvent.house_rules"
              placeholder="Respect the vibe, respect each other.&#10;Song requests are welcome through the app.&#10;No outside drinks or food."
              :rows="4"
            />
          </UFormField>

          <div class="flex items-center gap-2">
            <UCheckbox
              v-model="newEvent.is_active"
              label="Active immediately"
            />
          </div>
        </form>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            @click="isCreateModalOpen = false"
          >
            Cancel
          </UButton>
          <UButton
            type="submit"
            form="create-event-form"
            color="primary"
            :loading="creating"
          >
            Create
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- QR Code Modal -->
    <UModal
      v-model:open="isQrModalOpen"
      title="Event QR Code"
    >
      <template #body>
        <div class="flex flex-col items-center gap-4 py-4">
          <img
            :src="qrCodeUrl"
            alt="Event QR Code"
            class="w-64 h-64"
          >
          <p class="text-lg font-bold">
            {{ selectedEvent?.code }}
          </p>
          <UButton
            icon="i-heroicons-clipboard"
            color="neutral"
            variant="solid"
            label="Copy Link"
            @click="copyLink"
          />
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end">
          <UButton
            color="neutral"
            variant="ghost"
            @click="isQrModalOpen = false"
          >
            Close
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
