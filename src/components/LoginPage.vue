<template>
  <div class="page">
    <!-- 背景层 -->
    <div class="bg" aria-hidden="true"></div>

    <div class="shell">
      <!-- 左侧品牌区（大屏展示，小屏自动隐藏） -->
      <section class="brand" aria-hidden="true">
        <div class="brandCard">
          <div class="logo">
            <span>⚙️</span>
          </div>
          <h1 class="brandTitle">{{ appTitle }}</h1>
          <p class="brandSub">
            统一管理 · 可靠登录 · 一键进入流程设计器
          </p>

          <div class="brandMeta">
            <div class="pill">Secure Session</div>
            <div class="pill">Captcha Ready</div>
            <div class="pill">Token Based</div>
          </div>

          <div class="brandFooter">
            <span class="dot"></span>
            <span>Powered by Vue 3 + LogicFlow</span>
          </div>
        </div>
      </section>

      <!-- 右侧表单区 -->
      <main class="panel" role="main">
        <div class="card">
          <header class="header">
            <div class="headerTop">
              <h2 class="title">欢迎回来</h2>
              <span class="spark">✨</span>
            </div>
            <p class="subtitle">请使用你的账号登录进入流程设计器</p>
          </header>

          <div class="form">
            <div class="field">
              <label for="u">用户名</label>
              <input
                id="u"
                ref="userInput"
                v-model="username"
                placeholder="请输入用户名/手机号/邮箱"
                autocomplete="username"
                autocapitalize="off"
                spellcheck="false"
                @keydown="onKey"
              />
            </div>

            <div class="field">
              <label for="p">密码</label>
              <div class="passwordRow">
                <input
                  id="p"
                  v-model="password"
                  :type="showPwd ? 'text' : 'password'"
                  placeholder="请输入密码"
                  autocomplete="current-password"
                  @keydown="onKey"
                />
                <button class="ghost" type="button" @click="showPwd = !showPwd" :aria-label="showPwd ? '隐藏密码' : '显示密码'">
                  {{ showPwd ? '🙈' : '👀' }}
                </button>
              </div>
              <p v-if="capsOn" class="tiny warn">检测到大写锁定（CapsLock）已开启</p>
            </div>

            <div v-if="captchaEnabled" class="field">
              <label for="c">验证码</label>
              <div class="captchaRow">
                <input
                  id="c"
                  v-model="code"
                  placeholder="请输入验证码"
                  autocomplete="off"
                  inputmode="numeric"
                  @keydown="onKey"
                />
                <img
                  class="captchaImg"
                  :src="captchaSrc"
                  title="点我换一张"
                  alt="验证码"
                  @click="loadCaptcha"
                />
              </div>
              <p class="tiny">看不清？点图片刷新</p>
            </div>

            <button class="btn" :disabled="loading || !canSubmit" @click="doLogin">
              <span class="btnText">{{ loading ? '登录中…' : '登录并进入流程设计器' }}</span>
              <span class="btnArrow" aria-hidden="true">→</span>
            </button>

            <div v-if="hint" class="alert" role="alert">
              <span class="alertIcon">⚠️</span>
              <span class="alertText">{{ hint }}</span>
            </div>

            <footer class="footer">
              <span>© {{ new Date().getFullYear() }} {{ appTitle }}</span>
              <span class="sep">·</span>
              <span class="muted">如无法登录，请联系管理员重置密码</span>
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

const appTitle = (import.meta as any)?.env?.VITE_APP_TITLE || '流程设计平台'

// ✅ 不再默认填 admin / 密码
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

function normalizeCaptchaImg(img: string) {
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

/**
 * 兼容 base: './'
 * - 没 redirect：默认去 ./modeler.html
 * - 有 redirect（通常是 /modeler.html?...）：转成 ./modeler.html?... 才稳
 */
function getRedirectTarget() {
  const sp = new URLSearchParams(location.search)
  const r = sp.get('redirect')
  if (!r) return './modeler.html'
  return r.startsWith('/') ? `.${r}` : r
}

function onKey(e: KeyboardEvent) {
  // CapsLock 检测（更像“专业产品”的小细节）
  try {
    capsOn.value = !!e.getModifierState && e.getModifierState('CapsLock')
  } catch {}

  // 回车提交
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

    if (!u || !p) throw new Error('请输入用户名和密码')

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
    hint.value = e?.message || '登录失败：请检查账号密码是否正确'
    if (captchaEnabled.value) await loadCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadCaptcha()
  // 体验：自动聚焦用户名
  setTimeout(() => userInput.value?.focus(), 0)
})
</script>

<style scoped>
/* -------------- 基础变量 -------------- */
.page{
  min-height:100vh;
  position:relative;
  overflow:hidden;
  color:#0f172a;
}
.bg{
  position:absolute; inset:-40px;
  background:
    radial-gradient(800px 500px at 10% 10%, rgba(99,102,241,.35), transparent 60%),
    radial-gradient(900px 550px at 90% 20%, rgba(34,197,94,.22), transparent 60%),
    radial-gradient(700px 500px at 50% 110%, rgba(59,130,246,.25), transparent 60%),
    linear-gradient(180deg, #0b1020 0%, #0b1226 70%, #0b1226 100%);
  filter:saturate(1.05);
}
.shell{
  position:relative;
  min-height:100vh;
  display:grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap:28px;
  padding:28px;
  max-width:1100px;
  margin:0 auto;
  align-items:center;
}

/* -------------- 品牌区 -------------- */
.brand{ display:flex; justify-content:center; }
.brandCard{
  width:100%;
  max-width:520px;
  padding:26px;
  border-radius:22px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.12);
  box-shadow: 0 20px 60px rgba(0,0,0,.35);
  backdrop-filter: blur(10px);
}
.logo{
  width:52px;height:52px;
  border-radius:16px;
  display:grid;place-items:center;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.14);
  margin-bottom:14px;
  font-size:24px;
}
.brandTitle{
  margin:0;
  font-size:28px;
  letter-spacing:.3px;
  color: rgba(255,255,255,.95);
}
.brandSub{
  margin:10px 0 14px;
  color: rgba(255,255,255,.72);
  line-height:1.6;
}
.brandMeta{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin-top:10px;
}
.pill{
  font-size:12px;
  padding:6px 10px;
  border-radius:999px;
  color: rgba(255,255,255,.85);
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.12);
}
.brandFooter{
  margin-top:18px;
  display:flex;
  align-items:center;
  gap:10px;
  color: rgba(255,255,255,.62);
  font-size:12px;
}
.dot{
  width:8px;height:8px;border-radius:50%;
  background: rgba(34,197,94,.9);
  box-shadow: 0 0 0 4px rgba(34,197,94,.18);
}

/* -------------- 表单区 -------------- */
.panel{ display:flex; justify-content:center; }
.card{
  width:100%;
  max-width:420px;
  padding:22px 20px 18px;
  border-radius:18px;
  background: rgba(255,255,255,.94);
  border: 1px solid rgba(15,23,42,.08);
  box-shadow: 0 18px 45px rgba(0,0,0,.22);
}
.header{ margin-bottom:14px; }
.headerTop{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}
.title{
  margin:0;
  font-size:20px;
  letter-spacing:.2px;
}
.spark{ font-size:18px; opacity:.9; }
.subtitle{
  margin:6px 0 0;
  font-size:13px;
  color: rgba(15,23,42,.64);
}
.form{ margin-top:12px; }

.field{ margin:12px 0; }
label{
  display:block;
  font-size:12px;
  color: rgba(15,23,42,.72);
  margin-bottom:6px;
}
input{
  width:100%;
  padding:11px 12px;
  border-radius:12px;
  border:1px solid rgba(15,23,42,.14);
  outline:none;
  background: rgba(255,255,255,.85);
  transition: .15s ease;
}
input:focus{
  border-color: rgba(59,130,246,.55);
  box-shadow: 0 0 0 4px rgba(59,130,246,.14);
}
.passwordRow{
  display:flex;
  gap:10px;
  align-items:center;
}
.passwordRow input{ flex:1; }
.ghost{
  height:42px;
  padding:0 12px;
  border-radius:12px;
  border:1px solid rgba(15,23,42,.12);
  background: rgba(15,23,42,.03);
  cursor:pointer;
}
.ghost:hover{ background: rgba(15,23,42,.06); }

.captchaRow{
  display:flex;
  gap:10px;
  align-items:center;
}
.captchaImg{
  width:118px;
  height:42px;
  border-radius:12px;
  border:1px solid rgba(15,23,42,.14);
  cursor:pointer;
  object-fit:cover;
  background:#fff;
}
.tiny{
  margin:6px 0 0;
  font-size:12px;
  color: rgba(15,23,42,.55);
}
.warn{ color: rgba(220,38,38,.85); }

.btn{
  width:100%;
  margin-top:14px;
  padding:12px 14px;
  border:none;
  border-radius:12px;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  color:#fff;
  background: linear-gradient(90deg, rgba(59,130,246,.95), rgba(99,102,241,.95));
  box-shadow: 0 10px 20px rgba(59,130,246,.18);
  transition: .15s ease;
}
.btn:hover{ transform: translateY(-1px); }
.btn:disabled{
  opacity:.6;
  cursor:not-allowed;
  transform:none;
}
.btnArrow{ opacity:.9; }
.alert{
  margin-top:12px;
  padding:10px 12px;
  border-radius:12px;
  background: rgba(220,38,38,.08);
  border: 1px solid rgba(220,38,38,.18);
  color: rgba(153,27,27,.95);
  display:flex;
  gap:10px;
  align-items:flex-start;
}
.alertIcon{ line-height:1.2; }
.alertText{ font-size:12px; line-height:1.45; }

.footer{
  margin-top:14px;
  font-size:12px;
  color: rgba(15,23,42,.55);
  display:flex;
  flex-wrap:wrap;
  gap:6px;
  align-items:center;
  justify-content:center;
}
.sep{ opacity:.5; }
.muted{ opacity:.85; }

/* -------------- 响应式：小屏只保留登录卡 -------------- */
@media (max-width: 920px){
  .shell{
    grid-template-columns: 1fr;
    padding:20px;
    gap:18px;
  }
  .brand{ display:none; }
  .card{ max-width: 460px; }
}
</style>
