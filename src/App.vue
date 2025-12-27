<template>
  <LoginPage v-if="ready && !authed" />
  <div v-else-if="!ready" class="checking">正在检票中…🐾</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LoginPage from '@/components/LoginPage.vue'
import { clearToken, getToken } from '@/utils/token'

// ✅ 是否完成“验票”
const ready = ref(false)
// ✅ token 真的有效才算 authed
const authed = ref(false)

/**
 * 兼容你的 base: './'
 * - 没 redirect：默认去 ./modeler.html
 * - 有 redirect（通常是 /modeler.html?...）：转成 ./modeler.html?... 才稳
 */
function getRedirectTarget() {
  const sp = new URLSearchParams(location.search)
  const r = sp.get('redirect')
  if (!r) return './modeler.html'
  return r.startsWith('/') ? `.${r}` : r
}

onMounted(async () => {
  const token = getToken()
  if (!token) {
    ready.value = true
    authed.value = false
    return
  }

  try {
    // ✅ 走你现有 Vite 代理：/dev-api -> http://127.0.0.1:8080
    // 后端的 MeController 路径是 /api/me
    const resp = await fetch('/dev-api/api/me', {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (resp.ok) {
      authed.value = true
      // ✅ 验票通过才跳
      location.replace(getRedirectTarget())
      return
    }

    // ❌ token 失效/后端不认：清掉，留在登录页
    clearToken()
    authed.value = false
  } catch {
    // ❌ 后端没开/网络问题：也清掉避免卡死
    clearToken()
    authed.value = false
  } finally {
    ready.value = true
  }
})
</script>

<style scoped>
.checking {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  opacity: 0.75;
}
</style>
