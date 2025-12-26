<template>
  <LoginPage v-if="!authed" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LoginPage from '@/components/LoginPage.vue'
import { getToken } from '@/utils/token'

const authed = computed(() => !!getToken())

function getRedirectTarget() {
  const sp = new URLSearchParams(location.search)
  const r = sp.get('redirect')
  if (!r) return './modeler.html'
  return r.startsWith('/') ? `.${r}` : r
}

if (authed.value) {
  location.replace(getRedirectTarget())
}
</script>
