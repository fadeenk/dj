<script setup lang="ts">
import { generateUsername } from '~/utils/usernameGenerator'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

// Guest State
const guestName = ref(generateUsername())
const newGuestName = ref('')

// Initialize
onMounted(() => {
  const stored = localStorage.getItem('guestUserName')
  if (!stored) {
    localStorage.setItem('guestUserName', guestName.value)
  }
  if (stored) {
    guestName.value = stored
  }
})

// Computed display name
const displayName = computed(() => {
  if (user.value) {
    return user.value.email?.split('@')[0] || 'DJ'
  }
  return guestName.value
})

// Modal state
const isOpen = ref(false)

// Actions
function handleGuestNameUpdate() {
  if (!newGuestName.value.trim()) return

  guestName.value = newGuestName.value.trim()
  localStorage.setItem('guestUserName', guestName.value)
  isOpen.value = false
  newGuestName.value = ''

  toast.add({
    title: 'Name updated',
    color: 'success'
  })
}

async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    isOpen.value = false

    toast.add({
      title: 'Logged out successfully',
      color: 'success'
    })
    navigateTo('/login')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    toast.add({
      title: 'Error logging out',
      description: message,
      color: 'error'
    })
  }
}
</script>

<template>
  <UModal v-model:open="isOpen">
    <UButton
      color="neutral"
      variant="ghost"
    >
      <UAvatar
        :alt="displayName"
        size="sm"
        icon="i-heroicons-user-circle"
      />
      <span class="hidden sm:inline-block font-medium">{{ displayName }}</span>
    </UButton>

    <template #content>
      <!-- Authenticated User Content -->
      <div v-if="user" class="p-4 space-y-4">
        <h3 class="text-lg font-bold">
          Account
        </h3>
        <div class="space-y-2">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Logged in as: <span class="font-medium">{{ user.email }}</span>
          </p>
        </div>
        <UButton
          color="error"
          variant="soft"
          block
          @click="handleLogout"
        >
          Logout
        </UButton>
      </div>

      <!-- Guest User Content -->
      <div v-else class="p-4 space-y-4">
        <h3 class="text-lg font-bold">
          Change Your Name
        </h3>
        <form
          class="space-y-4"
          @submit.prevent="handleGuestNameUpdate"
        >
          <UInput
            v-model="newGuestName"
            placeholder="Enter your name"
            autofocus
          />
          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              @click="isOpen = false"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              color="primary"
              :disabled="!newGuestName.trim()"
            >
              Save
            </UButton>
          </div>
        </form>
      </div>
    </template>
  </UModal>
</template>
