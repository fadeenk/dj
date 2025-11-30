<script setup lang="ts">
const supabase = useSupabaseClient()
const logs = ref<string[]>([])

function log(msg: string, data?: object | null) {
  const line = `${new Date().toISOString()} - ${msg} ${data ? JSON.stringify(data, null, 2) : ''}`
  logs.value.push(line)
  console.log(msg, data)
}

async function runDebug() {
  log('Starting Debug...')

  // 1. Check Session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  log('Initial Session:', sessionData)
  if (sessionError) log('Session Error:', sessionError)

  // 2. Login if needed
  if (!sessionData.session) {
    log('No session, attempting login...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'fadeekannah@gmail.com',
      password: 'test123'
    })
    log('Login Result:', loginData)
    if (loginError) {
      log('Login Failed:', loginError)
      return
    }
  }

  // 3. Check User
  const { data: userData, error: userError } = await supabase.auth.getUser()
  log('User Data:', userData)
  if (userError) log('User Error:', userError)

  if (!userData.user) {
    log('No user found after login attempt.')
    return
  }

  // 4. Check DJ Record
  const { data: djData, error: djError } = await supabase
    .from('djs')
    .select('*')
    .eq('id', userData.user.id)

  log('DJ Record:', djData)
  if (djError) log('DJ Error:', djError)
}

onMounted(() => {
  runDebug()
})
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">
      Supabase Debug
    </h1>
    <pre class="bg-gray-100 p-4 rounded overflow-auto h-[800px] text-xs">{{ logs.join('\n') }}</pre>
  </div>
</template>
