<template>
  <div class="page">
    <div class="bg" aria-hidden="true"></div>

    <div class="shell">
      <section class="brand" aria-hidden="true">
        <div class="brand-card">
          <div class="badge">AUTH</div>
          <h1 class="brand-title">{{ appTitle }}</h1>
          <p class="brand-subtitle">Industrial workflow modeling platform access entry.</p>

          <dl class="meta-list">
            <div class="meta-item">
              <dt>Authentication</dt>
              <dd>JWT + Redis Session</dd>
            </div>
            <div class="meta-item">
              <dt>Security Policy</dt>
              <dd>Captcha verification and single-session control</dd>
            </div>
            <div class="meta-item">
              <dt>Tech Stack</dt>
              <dd>Vue 3 + LogicFlow</dd>
            </div>
          </dl>

          <div class="brand-footer">
            <span class="status-dot"></span>
            <span>System Access Channel Online</span>
          </div>
        </div>
      </section>

      <main class="panel" role="main">
        <div class="card">
          <header class="header">
            <p class="header-tag">AUTHENTICATION CENTER</p>
            <h2 class="title">Sign In</h2>
            <p class="subtitle">Use your assigned account to enter the modeler workspace.</p>
          </header>

          <div class="form">
            <div class="field">
              <label for="username">Username</label>
              <input
                id="username"
                ref="userInput"
                v-model="username"
                placeholder="Enter username / phone / email"
                autocomplete="username"
                autocapitalize="off"
                spellcheck="false"
                @keydown="onKey"
              />
            </div>

            <div class="field">
              <label for="password">Password</label>
              <div class="password-row">
                <input
                  id="password"
                  v-model="password"
                  :type="showPwd ? 'text' : 'password'"
                  placeholder="Enter password"
                  autocomplete="current-password"
                  @keydown="onKey"
                />
                <button
                  class="ghost"
                  type="button"
                  @click="showPwd = !showPwd"
                  :aria-label="showPwd ? 'Hide password' : 'Show password'"
                >
                  {{ showPwd ? 'Hide' : 'Show' }}
                </button>
              </div>
              <p v-if="capsOn" class="tiny warn">Caps Lock is currently enabled.</p>
            </div>

            <div v-if="captchaEnabled" class="field">
              <label for="captcha">Captcha</label>
              <div class="captcha-row">
                <input
                  id="captcha"
                  v-model="code"
                  placeholder="Enter captcha"
                  autocomplete="off"
                  inputmode="numeric"
                  @keydown="onKey"
                />
                <img
                  class="captcha-img"
                  :src="captchaSrc"
                  title="Click to refresh captcha"
                  alt="captcha"
                  @click="loadCaptcha"
                />
              </div>
              <p class="tiny">If unreadable, click the image to refresh.</p>
            </div>

            <button class="btn" :disabled="loading || !canSubmit" @click="doLogin">
              <span>{{ loading ? 'Signing in...' : 'Sign in and open modeler' }}</span>
              <span aria-hidden="true">&gt;</span>
            </button>

            <div v-if="hint" class="alert" role="alert">
              <span class="alert-label">Notice</span>
              <span class="alert-text">{{ hint }}</span>
            </div>

            <footer class="footer">
              <span>&copy; {{ new Date().getFullYear() }} {{ appTitle }}</span>
              <span class="sep">|</span>
              <span class="muted">If sign-in fails, contact admin to reset credentials.</span>
            </footer>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getCaptchaImage, loginApi } from '@/api/auth'
import { setToken } from '@/utils/token'

const appTitle = (import.meta as any)?.env?.VITE_APP_TITLE || 'Process Modeling Platform'

const username = ref('')
const password = ref('')
const showPwd = ref(false)

const code = ref('')
const uuid = ref('')
const captchaSrc = ref('')
const captchaEnabled = ref(false)

const loading = ref(false)
const hint = ref('')
const capsOn = ref(false)
const userInput = ref<HTMLInputElement | null>(null)

const canSubmit = computed(() => {
  const u = username.value.trim()
  const p = password.value
  if (!u || !p) return false
  if (captchaEnabled.value && !code.value.trim()) return false
  return true
})

function normalizeCaptchaImg(img: string): string {
  if (!img) return ''
  if (img.startsWith('data:image')) return img
  return `data:image/png;base64,${img}`
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

function getRedirectTarget(): string {
  const sp = new URLSearchParams(location.search)
  const redirect = sp.get('redirect')
  if (!redirect) return './modeler.html'
  return redirect.startsWith('/') ? `.${redirect}` : redirect
}

function onKey(e: KeyboardEvent) {
  try {
    capsOn.value = !!e.getModifierState && e.getModifierState('CapsLock')
  } catch {
    // ignore caps lock detection error
  }
  if (e.key === 'Enter') {
    e.preventDefault()
    if (canSubmit.value && !loading.value) doLogin()
  }
}

async function doLogin() {
  hint.value = ''
  loading.value = true
  try {
    const u = username.value.trim()
    const p = password.value
    if (!u || !p) throw new Error('Please enter username and password.')

    const payload: any = { username: u, password: p }
    if (captchaEnabled.value) {
      if (!code.value.trim()) throw new Error('Please enter captcha code.')
      payload.code = code.value.trim()
      payload.uuid = uuid.value
    }

    const res: any = await loginApi(payload)
    const token = res?.token || res?.data?.token || (typeof res?.data === 'string' ? res.data : '')
    if (!token) throw new Error(res?.msg || 'Login failed: token not found.')

    setToken(token)
    location.href = getRedirectTarget()
  } catch (e: any) {
    hint.value = e?.message || 'Login failed. Please verify your credentials.'
    if (captchaEnabled.value) await loadCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadCaptcha()
  setTimeout(() => userInput.value?.focus(), 0)
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  color: #0f172a;
}

.bg {
  position: absolute;
  inset: -40px;
  background:
    radial-gradient(760px 460px at 8% 12%, rgba(46, 94, 178, 0.36), transparent 60%),
    radial-gradient(820px 500px at 92% 16%, rgba(24, 65, 132, 0.28), transparent 62%),
    linear-gradient(180deg, #0c1429 0%, #0e1b33 72%, #101e39 100%);
  filter: saturate(1.02);
}

.shell {
  position: relative;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 28px;
  padding: 28px;
  max-width: 1100px;
  margin: 0 auto;
  align-items: center;
}

.brand {
  display: flex;
  justify-content: center;
}

.brand-card {
  width: 100%;
  max-width: 520px;
  padding: 28px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.34);
  backdrop-filter: blur(9px);
}

.badge {
  width: 64px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid rgba(197, 215, 255, 0.44);
  background: rgba(179, 200, 239, 0.18);
  color: rgba(228, 236, 255, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.08em;
  font-size: 12px;
  font-weight: 700;
  font-family: Consolas, 'Courier New', monospace;
  margin-bottom: 14px;
}

.brand-title {
  margin: 0;
  font-size: 28px;
  letter-spacing: 0.3px;
  color: rgba(255, 255, 255, 0.95);
}

.brand-subtitle {
  margin: 10px 0 18px;
  color: rgba(221, 233, 255, 0.74);
  line-height: 1.65;
}

.meta-list {
  margin: 0;
  display: grid;
  gap: 10px;
}

.meta-item {
  border-radius: 10px;
  border: 1px solid rgba(198, 216, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
  padding: 10px 12px;
}

.meta-item dt {
  color: rgba(227, 235, 255, 0.9);
  font-size: 12px;
}

.meta-item dd {
  margin: 4px 0 0;
  color: rgba(205, 220, 251, 0.8);
  font-size: 13px;
}

.brand-footer {
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(201, 219, 255, 0.68);
  font-size: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.92);
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
}

.panel {
  display: flex;
  justify-content: center;
}

.card {
  width: 100%;
  max-width: 430px;
  padding: 24px 22px 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.24);
}

.header {
  margin-bottom: 14px;
}

.header-tag {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.11em;
  color: rgba(56, 73, 109, 0.74);
  font-family: Consolas, 'Courier New', monospace;
}

.title {
  margin: 6px 0 0;
  font-size: 21px;
  letter-spacing: 0.2px;
}

.subtitle {
  margin: 7px 0 0;
  font-size: 13px;
  color: rgba(15, 23, 42, 0.64);
}

.form {
  margin-top: 12px;
}

.field {
  margin: 12px 0;
}

label {
  display: block;
  font-size: 12px;
  color: rgba(15, 23, 42, 0.72);
  margin-bottom: 6px;
}

input {
  width: 100%;
  padding: 11px 12px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.15);
  outline: none;
  background: rgba(255, 255, 255, 0.92);
  transition: 0.15s ease;
}

input:focus {
  border-color: rgba(43, 93, 187, 0.56);
  box-shadow: 0 0 0 4px rgba(43, 93, 187, 0.14);
}

.password-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.password-row input {
  flex: 1;
}

.ghost {
  height: 42px;
  min-width: 62px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  background: rgba(15, 23, 42, 0.03);
  color: rgba(15, 23, 42, 0.75);
  cursor: pointer;
  font-size: 12px;
}

.ghost:hover {
  background: rgba(15, 23, 42, 0.07);
}

.captcha-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.captcha-img {
  width: 118px;
  height: 42px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.15);
  cursor: pointer;
  object-fit: cover;
  background: #fff;
}

.tiny {
  margin: 6px 0 0;
  font-size: 12px;
  color: rgba(15, 23, 42, 0.58);
}

.warn {
  color: rgba(185, 28, 28, 0.92);
}

.btn {
  width: 100%;
  margin-top: 14px;
  padding: 12px 14px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  background: linear-gradient(90deg, rgba(30, 73, 156, 0.95), rgba(35, 88, 182, 0.95));
  box-shadow: 0 10px 20px rgba(30, 73, 156, 0.2);
  transition: 0.15s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.64;
  cursor: not-allowed;
  transform: none;
}

.alert {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.18);
  color: rgba(153, 27, 27, 0.95);
  display: grid;
  gap: 2px;
}

.alert-label {
  font-size: 12px;
  font-weight: 600;
}

.alert-text {
  font-size: 12px;
  line-height: 1.45;
}

.footer {
  margin-top: 14px;
  font-size: 12px;
  color: rgba(15, 23, 42, 0.56);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  justify-content: center;
}

.sep {
  opacity: 0.48;
}

.muted {
  opacity: 0.86;
}

@media (max-width: 920px) {
  .shell {
    grid-template-columns: 1fr;
    padding: 20px;
    gap: 18px;
  }

  .brand {
    display: none;
  }

  .card {
    max-width: 460px;
  }
}
</style>
