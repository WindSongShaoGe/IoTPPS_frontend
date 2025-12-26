<template>
  <div class="wrap">
    <div class="card">
      <h2 class="title">欢迎回来 ✨</h2>

      <div class="field">
        <label>用户名</label>
        <input
          v-model="username"
          placeholder="请输入用户名"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
        />
      </div>

      <div class="field">
        <label>密码</label>
        <input
          v-model="password"
          type="password"
          placeholder="请输入密码"
          autocomplete="new-password"
        />
      </div>

      <div v-if="captchaEnabled" class="field">
        <label>验证码</label>
        <div class="captchaRow">
          <input
            v-model="code"
            placeholder="请输入验证码"
            autocomplete="off"
            inputmode="numeric"
          />
          <img class="captchaImg" :src="captchaSrc" title="点我换一张" @click="loadCaptcha" />
        </div>
      </div>

      <button class="btn" :disabled="loading" @click="doLogin">
        {{ loading ? '登录中…' : '登录并进入流程设计器 →' }}
      </button>

      <p class="hint">{{ hint }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getCaptchaImage, loginApi } from '@/api/auth'
import { setToken } from '@/utils/token'

// ✅ 不再默认填 admin / 密码
const username = ref('')
const password = ref('')

const code = ref('')
const uuid = ref('')
const captchaSrc = ref('')
const captchaEnabled = ref(false)
const loading = ref(false)
const hint = ref('')

function normalizeCaptchaImg(img: string) {
  if (!img) return ''
  if (img.startsWith('data:image')) return img
  return `data:image/gif;base64,${img}`
}

async function loadCaptcha() {
  try {
    const res: any = await getCaptchaImage()
    captchaEnabled.value = res?.captchaEnabled !== false
    uuid.value = res?.uuid || ''
    captchaSrc.value = normalizeCaptchaImg(res?.img || '')
    if (!captchaSrc.value) captchaEnabled.value = false
  } catch {
    captchaEnabled.value = false
  }
}

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

async function doLogin() {
  hint.value = ''
  loading.value = true
  try {
    const u = username.value.trim()
    const p = password.value

    if (!u || !p) {
      throw new Error('请输入用户名和密码')
    }

    const payload: any = { username: u, password: p }

    if (captchaEnabled.value) {
      if (!code.value.trim()) throw new Error('请输入验证码')
      payload.code = code.value.trim()
      payload.uuid = uuid.value
    }

    const res: any = await loginApi(payload)

    // 兼容：token 在 res.token / res.data.token / res.data
    const token =
      res?.token ||
      res?.data?.token ||
      (typeof res?.data === 'string' ? res.data : '')

    if (!token) throw new Error(res?.msg || '登录失败：未获取到 token')

    setToken(token)
    location.href = getRedirectTarget()
  } catch (e: any) {
    hint.value = e?.message || '登录失败：请检查后端是否启动 / 账号密码是否正确'
    if (captchaEnabled.value) await loadCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(loadCaptcha)
</script>

<style scoped>
.wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;}
.card{width:360px;max-width:92vw;padding:22px 18px;border-radius:14px;background:#fff;box-shadow:0 12px 30px rgba(0,0,0,.08);}
.title{margin:0 0 14px;font-size:20px;}
.field{margin:12px 0;}
label{display:block;font-size:12px;opacity:.7;margin-bottom:6px;}
input{width:100%;padding:10px 10px;border-radius:10px;border:1px solid rgba(0,0,0,.15);outline:none;}
.captchaRow{display:flex;gap:10px;align-items:center;}
.captchaImg{width:110px;height:40px;border-radius:10px;border:1px solid rgba(0,0,0,.15);cursor:pointer;object-fit:cover;}
.btn{width:100%;margin-top:12px;padding:10px 12px;border:none;border-radius:10px;cursor:pointer;}
.btn:disabled{opacity:.6;cursor:not-allowed;}
.hint{margin:10px 0 0;font-size:12px;opacity:.75;}
</style>
