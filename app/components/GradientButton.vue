<script setup lang="ts">
const props = withDefaults(defineProps<{
  label?: string
  variant?: 'rounded' | 'pill' | 'square'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  block?: boolean
  icon?: string
  animate?: boolean
}>(), {
  variant: 'rounded',
  size: 'md',
  disabled: false,
  loading: false,
  block: false,
  icon: undefined,
  animate: true,
  label: ''
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

const sizeClasses = {
  sm: 'h-8 px-4 text-sm',
  md: 'h-12 px-5 text-base',
  lg: 'h-14 px-6 text-lg'
}

const variantClasses = {
  rounded: 'rounded-lg',
  pill: 'rounded-full',
  square: 'rounded-none'
}
</script>

<template>
  <button
    class="relative inline-flex items-center justify-center overflow-hidden bg-gradient-to-r from-primary to-secondary font-bold leading-normal tracking-[0.015em] text-white shadow-lg shadow-secondary/30 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
    :class="[
      sizeClasses[size],
      variantClasses[variant],
      block ? 'w-full' : '',
      animate && !disabled && !loading ? 'hover:scale-[1.02] hover:shadow-xl hover:shadow-secondary/40 active:scale-[0.98]' : ''
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <UIcon
      v-if="loading"
      name="i-heroicons-arrow-path"
      class="mr-2 animate-spin"
    />
    <UIcon
      v-else-if="icon"
      :name="icon"
      class="mr-2"
    />
    <span class="truncate">{{ loading ? 'Loading...' : label }}</span>
    <slot />
  </button>
</template>
