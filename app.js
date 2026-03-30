// ============================================================
// CERES — Main Application Logic
// ============================================================
import {
  FARMER_PROFILE, GOLDEN_HOUR_ALERTS, DAILY_ACTIONS,
  MANDI_PRICES, GOVT_SCHEMES, WHAT_IF_CROPS,
  COMMUNITY_POSTS, WEATHER_DATA, SATELLITE_ZONES,
  EXPERT_CONTACTS, CROP_TIMELINE, PROFIT_LEAKS,
  HABIT_STREAK, WEATHER_ACTIONS
} from './data/mock.js';

// ── State ──────────────────────────────────────────────────
const state = {
  activeTab: 'home',
  aiMode: 'simple',       // 'simple' | 'expert'
  tasksDone: new Set([0, 1]),
  simCrop: null,
  voiceListening: false,
  cameraActive: false,
  chatHistory: [],
  countdowns: {},         // alert id → seconds remaining
};

// ── Utilities ──────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function formatHours(h) {
  if (h >= 24) return `${Math.round(h / 24)}d`;
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return mm > 0 ? `${hh}h ${mm}m` : `${hh}h`;
}

function showToast(msg, type = 'success') {
  const tc = $('#toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span><span>${msg}</span>`;
  tc.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

function navigateTo(tab) {
  state.activeTab = tab;
  $$('.page').forEach(p => p.classList.remove('active'));
  $$('.nav-item').forEach(n => n.classList.remove('active'));
  const page = $(`#page-${tab}`);
  const nav  = $(`.nav-item[data-tab="${tab}"]`);
  if (page) page.classList.add('active');
  if (nav)  nav.classList.add('active');
  page?.scrollTo?.(0, 0);
}

function drawSVGWave(svgEl, points = 10) {
  const W = 200, H = 24;
  svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const pts = Array.from({length: points}, (_, i) => {
    const x = (i / (points - 1)) * W;
    const y = H / 2 + (Math.random() - 0.5) * H * 0.7;
    return `${x},${y}`;
  }).join(' ');
  svgEl.innerHTML = `<polyline points="${pts}" fill="none" stroke="#34d399" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>`;
}

// ── Countdown Engine ────────────────────────────────────────
function startCountdowns() {
  GOLDEN_HOUR_ALERTS.forEach(a => {
    state.countdowns[a.id] = Math.round(a.hoursLeft * 3600);
  });
  setInterval(() => {
    GOLDEN_HOUR_ALERTS.forEach(a => {
      if (state.countdowns[a.id] > 0) {
        state.countdowns[a.id]--;
        const el = $(`#countdown-${a.id}`);
        if (el) {
          const s = state.countdowns[a.id];
          const h = Math.floor(s / 3600);
          const m = Math.floor((s % 3600) / 60);
          const sec = s % 60;
          el.textContent = h > 0
            ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
            : `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
        }
      }
    });
  }, 1000);
}

// ── Weather Page ────────────────────────────────────────────
function renderWeather() {
  const w = WEATHER_DATA;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' });
  return `
  <div class="weather-hero">
    <div class="weather-date">📍 ${FARMER_PROFILE.village} · ${dateStr}</div>
    <div class="weather-main">
      <div class="temp-block">
        <div class="temp">${w.temp}°</div>
        <div class="cond">${w.condition}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:6px">${w.rainfall}</div>
      </div>
      <div class="weather-icon-big">${w.icon}</div>
    </div>
    <div class="weather-stats">
      <div class="weather-stat">💧 <span class="stat-val">${w.humidity}%</span> Humidity</div>
      <div class="weather-stat">💨 <span class="stat-val">${w.wind} km/h</span></div>
      <div class="weather-stat">☀️ UV <span class="stat-val">${w.uvIndex}</span></div>
    </div>
    <div class="forecast-row">
      ${w.forecast.map((d, i) => `
        <div class="forecast-pill ${i === 0 ? 'today' : ''}">
          ${d.icon} <strong>${d.day}</strong> ${d.high}° / ${d.low}°
        </div>`).join('')}
    </div>
  </div>`;
}

// ── Dashboard (Home) ────────────────────────────────────────
function renderDashboard() {
  const p = FARMER_PROFILE;
  const tasksDoneCount = [...state.tasksDone].filter(i => DAILY_ACTIONS[i]).length;
  const h = HABIT_STREAK;

  return `
  ${renderWeather()}

  <!-- Weather + Action Alerts -->
  <div class="section-header">
    <div class="section-title">⚡ Weather Actions</div>
    <span class="badge badge-blue">Live</span>
  </div>
  ${WEATHER_ACTIONS.map(w => `
    <div class="weather-action-card">
      <div class="wa-icon-wrap" style="background:${w.bg};border:1.5px solid ${w.border}">${w.icon}</div>
      <div style="flex:1">
        <div class="wa-title">${w.alert}</div>
        <div class="wa-action" style="background:${w.bg};color:${w.color};margin-top:5px">${w.action}</div>
      </div>
    </div>`).join('')}

  <!-- Habit Streak -->
  <div class="streak-card">
    <div class="streak-top">
      <div>
        <div class="streak-number">🔥 ${h.currentStreak}</div>
        <div class="streak-label">Day Streak</div>
        <div class="streak-sub">Best: ${h.longestStreak} days · ${h.points} pts · ${h.level}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:11px;opacity:.8;margin-bottom:8px">This Week</div>
        <div class="streak-dots">
          ${h.weekDays.map((d, i) => `
            <div class="streak-dot ${h.completed[i] ? 'done' : i === 5 ? 'today' : ''}">${h.completed[i] ? '✓' : d}</div>`).join('')}
        </div>
      </div>
    </div>
    <button class="btn btn-full" style="background:rgba(255,255,255,0.25);color:white;font-weight:700;border-radius:12px;padding:10px" onclick="markTodayDone()">
      ✅ Mark Today Done — Keep Streak Alive!
    </button>
  </div>

  <!-- Profit Leak Mini -->
  <div class="profit-leak-mini" onclick="navigateTo('doctor')">
    <div class="pl-header">
      <div class="pl-header-icon">🔍</div>
      <div>
        <div class="pl-title">Profit Leaks Detected</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px">Tap to see what's costing you money</div>
      </div>
      <div class="pl-total">₹${PROFIT_LEAKS.reduce((s,l)=>s+l.loss,0).toLocaleString()}</div>
    </div>
    ${PROFIT_LEAKS.slice(0,2).map(l => `
      <div class="profit-leak-item">
        <span style="font-size:18px">${l.icon}</span>
        <div class="pl-item-text">${l.title}</div>
        <div class="pl-item-loss">-₹${l.loss.toLocaleString()}</div>
      </div>`).join('')}
  </div>

  <div class="farmer-card">
    <div class="farmer-avatar">${p.name[0]}</div>
    <div class="farmer-info">
      <h2>${p.name}</h2>
      <p>📍 ${p.village} · ${p.landAcres} acres</p>
      <div class="crop-tag">
        <span class="badge badge-green">🌾 ${p.cropType}</span>
        <span class="badge badge-amber" style="margin-left:6px">🏆 Score: ${p.farmScore}</span>
      </div>
    </div>
  </div>

  <!-- Golden Hour -->
  <div class="golden-hour-title">
    <div class="pulse-dot"></div>
    <h2>⏱ Golden Hour Alerts</h2>
  </div>
  ${GOLDEN_HOUR_ALERTS.map(a => `
    <div class="alert-card urgency-${a.urgency}" onclick="handleAlertClick(${a.id})">
      <div class="alert-card-top">
        <div class="alert-left">
          <div class="alert-icon-wrap">${a.icon}</div>
          <div>
            <div class="alert-title">${a.title}</div>
            <div class="alert-desc">${a.desc}</div>
          </div>
        </div>
        <div class="countdown-box">
          <div class="countdown-time" id="countdown-${a.id}">${formatHours(a.hoursLeft)}</div>
          <div class="countdown-label">Left</div>
        </div>
      </div>
      <div class="alert-action" style="margin-top:10px">
        <button class="btn btn-sm" style="background:var(--urgency-bg);color:var(--urgency-color);border:1.5px solid var(--urgency-border)">
          ${a.action} →
        </button>
      </div>
    </div>`).join('')}

  <!-- Daily Tasks -->
  <div class="section-header" style="margin-top:20px">
    <div class="section-title">🗓 Today's Action Plan</div>
    <div class="badge badge-green">${tasksDoneCount}/${DAILY_ACTIONS.length} Done</div>
  </div>
  <div class="card">
    ${DAILY_ACTIONS.map((t, i) => `
      <div class="task-item ${state.tasksDone.has(i) ? 'done-item' : ''}" onclick="toggleTask(${i})">
        <div class="task-check ${state.tasksDone.has(i) ? 'done' : ''}"></div>
        <div class="task-icon">${t.icon}</div>
        <div class="task-info">
          <div class="task-name">${t.task}</div>
          <div class="task-time">${t.time}</div>
        </div>
      </div>`).join('')}
  </div>

  <!-- Quick Call -->
  <div class="section-header" style="margin-top:20px">
    <div class="section-title">📞 Call an Expert</div>
  </div>
  ${EXPERT_CONTACTS.map(e => `
    <div class="expert-card">
      <div class="expert-info">
        <div class="expert-name">${e.name}</div>
        <div class="expert-role">${e.role} · ${e.phone}</div>
      </div>
      <button class="call-btn" onclick="makeCall('${e.phone}','${e.name}')">📞</button>
    </div>`).join('')}`;
}

// ── Camera Screen ───────────────────────────────────────────
function renderCamera() {
  return `
  <div class="section-header">
    <div class="section-title">🎥 AI Crop Scanner</div>
    <div class="mode-chip simple" id="ai-mode-chip" onclick="toggleAIMode()">
      ${state.aiMode === 'simple' ? '🧑‍🌾 Simple Mode' : '🔬 Expert Mode'}
    </div>
  </div>

  <div class="camera-wrap" id="camera-wrap">
    <video id="camera-video" autoplay playsinline muted></video>
    <canvas id="camera-canvas"></canvas>
    <div class="camera-overlay-ui">
      <div class="camera-corner tl"></div>
      <div class="camera-corner tr"></div>
      <div class="camera-corner bl"></div>
      <div class="camera-corner br"></div>
      <div class="scan-line" id="scan-line"></div>
      <div class="camera-status" id="cam-status-text">🟢 Ready to Scan</div>
    </div>
    <div class="camera-controls">
      <button class="cam-btn cam-btn-side" onclick="switchCamera()" title="Switch">🔄</button>
      <button class="cam-btn cam-btn-capture" id="cam-capture-btn" onclick="captureAndAnalyze()" title="Capture">📷</button>
      <button class="cam-btn cam-btn-side" onclick="toggleFlash()" title="Flash">⚡</button>
    </div>
  </div>

  <div id="cam-start-overlay" style="margin-bottom:16px">
    <button class="btn btn-primary btn-full btn-lg" onclick="startCamera()">
      📷 Start AI Camera
    </button>
  </div>

  <div id="detection-results" style="display:none">
    <div class="section-header">
      <div class="section-title">🔍 Detection Results</div>
      <span class="badge badge-green">AI Analyzed</span>
    </div>
    <div id="results-list"></div>
  </div>

  <div class="section-header" style="margin-top:4px">
    <div class="section-title">📚 Scan History</div>
  </div>
  <div class="card" style="text-align:center;padding:24px;color:var(--text-muted);font-size:13px">
    📷 Scan a crop leaf to get AI-powered disease and pest detection
  </div>`;
}

// ── Satellite Screen ────────────────────────────────────────
function renderSatellite() {
  return `
  <div class="section-header">
    <div class="section-title">🛰 Satellite Farm View</div>
    <span class="badge badge-blue">NDVI Live</span>
  </div>

  <div class="satellite-map-wrap">
    <canvas id="satellite-canvas" height="280"></canvas>
    <div class="map-toolbar">
      <button class="map-tool-btn" onclick="zoomMap(1.2)" title="Zoom In">➕</button>
      <button class="map-tool-btn" onclick="zoomMap(0.8)" title="Zoom Out">➖</button>
      <button class="map-tool-btn" onclick="refreshSatellite()" title="Refresh">🔄</button>
    </div>
    <div class="map-legend">
      <div class="legend-item"><div class="legend-dot" style="background:#22c55e"></div><span style="color:var(--green-400)">Healthy</span></div>
      <div class="legend-item"><div class="legend-dot" style="background:#fbbf24"></div><span style="color:var(--gold-400)">Stressed</span></div>
      <div class="legend-item"><div class="legend-dot" style="background:#ef4444"></div><span style="color:var(--red-400)">Poor</span></div>
    </div>
  </div>

  <div class="section-header">
    <div class="section-title">📊 Field Zones</div>
    <span class="section-link" onclick="exportReport()">Export Report →</span>
  </div>
  <div class="zone-cards">
    ${SATELLITE_ZONES.map(z => {
      const color = z.ndvi >= 0.7 ? '#22c55e' : z.ndvi >= 0.5 ? '#fbbf24' : '#ef4444';
      const statusColor = z.status === 'healthy' ? 'badge-green' : z.status === 'stressed' ? 'badge-amber' : 'badge-red';
      return `
      <div class="zone-card" onclick="zoneDetail('${z.label}')">
        <div class="zone-name">${z.label}</div>
        <div class="zone-ndvi" style="color:${color}">${z.ndvi.toFixed(2)}</div>
        <div class="zone-area">${z.area} acres</div>
        <div class="ndvi-bar-bg">
          <div class="ndvi-bar-fill" style="width:${z.ndvi*100}%;background:${color}"></div>
        </div>
        <div style="margin-top:8px"><span class="badge ${statusColor}">${z.status}</span></div>
      </div>`;
    }).join('')}
  </div>

  <div style="margin-top:16px" class="card">
    <div style="font-size:13px;font-weight:700;margin-bottom:8px">🐛 Pest Spread Forecast</div>
    <div style="font-size:12px;color:var(--text-muted);line-height:1.6">
      ⚠️ <strong style="color:var(--gold-400)">Aphid outbreak risk</strong> detected in South Field. 
      Spread to adjacent zones likely within <strong style="color:var(--red-400)">3 days</strong> 
      based on wind patterns and crop density.
    </div>
    <button class="btn btn-sm btn-gold" style="margin-top:12px" onclick="showToast('Pest alert sent to nearby farmers!','success')">
      🔔 Alert Nearby Farmers
    </button>
  </div>`;
}

// ── Market Screen ────────────────────────────────────────────
function renderMarket() {
  const cropIcons = { Wheat:'🌾', Rice:'🍚', Mustard:'🌻', Cotton:'🌿', Maize:'🌽', Barley:'🫘' };
  return `
  <div class="section-header">
    <div class="section-title">💰 Mandi Intelligence</div>
    <span class="badge badge-green">Live Prices</span>
  </div>

  <div class="price-ticker">
    ${MANDI_PRICES.map(m => `
      <div class="ticker-chip">
        <span class="crop-name">${m.crop}</span>
        <span class="crop-price">₹${m.price.toLocaleString()}</span>
        <span class="${m.trend > 0 ? 'trend-up' : 'trend-down'}">${m.trend > 0 ? '▲' : '▼'}${Math.abs(m.trend)}%</span>
      </div>`).join('')}
  </div>

  <div class="chart-area">
    <div class="chart-title">📈 Price Trend — Last 7 Days</div>
    <canvas id="price-chart"></canvas>
  </div>

  <div class="card">
    ${MANDI_PRICES.map(m => `
      <div class="mandi-row">
        <div class="mandi-left">
          <div class="mandi-crop-icon">${cropIcons[m.crop] || '🌱'}</div>
          <div>
            <div class="mandi-crop-name">${m.crop}</div>
            <div class="mandi-location">📍 ${m.location}</div>
          </div>
        </div>
        <div class="mandi-right">
          <div class="mandi-price">₹${m.price.toLocaleString()}</div>
          <div class="mandi-unit">/quintal</div>
          <div class="mandi-trend ${m.trend > 0 ? 'up' : 'down'}">
            ${m.trend > 0 ? '▲ +' : '▼ '}${m.trend}%
          </div>
        </div>
      </div>`).join('')}
  </div>

  <div class="section-header" style="margin-top:16px">
    <div class="section-title">🎯 Best Sell Today</div>
  </div>
  <div class="card" style="background:linear-gradient(135deg,#0d2318,var(--bg-card));border-color:rgba(245,158,11,0.3)">
    <div style="display:flex;align-items:center;gap:14px">
      <div style="font-size:42px">🌻</div>
      <div>
        <div style="font-size:13px;color:var(--text-muted)">Best Profit Today</div>
        <div style="font-size:20px;font-weight:800;color:var(--gold-400)">Mustard at Sirsa Mandi</div>
        <div style="font-size:13px;color:var(--green-400);margin-top:4px">₹5,400/q · Demand: Very High · ▲7.8%</div>
      </div>
    </div>
    <button class="btn btn-gold btn-full" style="margin-top:14px" onclick="showToast('Route to Sirsa Mandi opened!','success')">
      🗺 Get Directions to Mandi
    </button>
  </div>`;
}

// ── AI Chat / Voice ──────────────────────────────────────────
const AI_RESPONSES = {
  simple: {
    soil:      { icon:'🌱', title:'Soil Check', text:'Your soil needs more nutrients. Add urea or compost near the roots. Water well after adding.' },
    pest:      { icon:'🐛', title:'Pest Found', text:'Small bugs spotted on leaves. Spray neem oil mixed with water (2 spoons per litre). Do this in the evening.' },
    water:     { icon:'💧', title:'Watering Guide', text:'Your crops are thirsty! Water them now — especially the south field. Best time is early morning or evening.' },
    weather:   { icon:'⛅', title:'Weather for Farming', text:'Rain is coming in 2 days. Don\'t spray pesticide today. Good time to plan irrigation.' },
    default:   { icon:'🌾', title:'Ceres AI', text:'I\'m here to help! Ask me about your soil, water, weather, pests or crops.' }
  },
  expert: {
    soil:      { icon:'🧪', title:'Soil Analysis', text:'Nitrogen deficiency detected (NPK ratio imbalanced). Recommend 46-0-0 urea at 60 kg/acre. pH correction may be required if <6.5.' },
    pest:      { icon:'🔬', title:'Pest Identification', text:'Aphis gossypii (Cotton Aphid) or Lipaphis erysimi detected. Apply Imidacloprid 17.8 SL @ 0.25 ml/L or Thiamethoxam 25 WG @ 0.3 g/L.' },
    water:     { icon:'📊', title:'Irrigation Advisory', text:'Soil moisture at 28% (critical threshold: 35%). Recommend drip irrigation at 3mm/day. Avoid flood irrigation — water stress index high.' },
    weather:   { icon:'🌡', title:'Agro-Met Advisory', text:'IMD forecast: Southwest winds bringing 4-6mm rainfall. ETo = 4.2 mm/day. Delay foliar sprays 48h. Chapman-Richards model predicts 82% probability of precipitation.' },
    default:   { icon:'🌿', title:'Ceres Agricultural AI', text:'Precision farming system active. Query soil, pest, irrigation, market or micro-climate data.' }
  }
};

function getAIResponse(query) {
  const q = query.toLowerCase();
  const mode = state.aiMode;
  if (q.includes('soil') || q.includes('nutrient') || q.includes('fertiliz')) return AI_RESPONSES[mode].soil;
  if (q.includes('pest') || q.includes('bug') || q.includes('insect') || q.includes('disease')) return AI_RESPONSES[mode].pest;
  if (q.includes('water') || q.includes('irrigat')) return AI_RESPONSES[mode].water;
  if (q.includes('weather') || q.includes('rain') || q.includes('forecast')) return AI_RESPONSES[mode].weather;
  return AI_RESPONSES[mode].default;
}

function renderChat() {
  return `
  <div class="section-header">
    <div class="section-title">🧠 Ceres AI Assistant</div>
    <div class="toggle-group" style="min-width:200px">
      <button class="toggle-opt ${state.aiMode==='simple'?'active':''}" onclick="setAIMode('simple')">🧑‍🌾 Simple</button>
      <button class="toggle-opt ${state.aiMode==='expert'?'active':''}" onclick="setAIMode('expert')">🔬 Expert</button>
    </div>
  </div>

  <div id="chat-messages" class="ai-chat-wrap" style="min-height:300px;padding-bottom:8px">
    <div class="chat-bubble ai">
      <div class="ai-mode-label">${state.aiMode === 'simple' ? '🧑‍🌾 SIMPLE MODE' : '🔬 EXPERT MODE'}</div>
      ${state.aiMode === 'simple'
        ? 'Hello Ramesh ji! 🙏 I can help with your crops. Ask me about soil, water, pests or weather!'
        : 'Agricultural AI system initialized. Submit a query regarding soil composition, integrated pest management, hydrology, or agro-meteorological conditions.'}
    </div>
    ${state.chatHistory.map(m => `
      <div class="chat-bubble ${m.role}">${m.text}</div>
    `).join('')}
  </div>

  <div class="chat-input-area">
    <div class="chat-input-row">
      <button class="chat-voice-btn" id="mic-btn" onclick="toggleVoiceInput()" title="Voice Input">🎤</button>
      <textarea class="chat-input-box" id="chat-input" placeholder="Ask about your crops..." rows="1"
        onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChat()}"
        oninput="autoGrow(this)"></textarea>
      <button class="chat-send-btn" onclick="sendChat()" title="Send">➤</button>
    </div>
  </div>`;
}

// ── Community Screen ─────────────────────────────────────────
function renderCommunity() {
  return `
  <div class="section-header">
    <div class="section-title">🧑‍🌾 Kisan Network</div>
    <button class="btn btn-sm btn-primary" onclick="showRecordVoice()">🎙 Post</button>
  </div>

  <div id="record-panel" style="display:none" class="card" style="margin-bottom:14px">
    <div style="font-size:14px;font-weight:700;margin-bottom:12px">🎙 Record Voice Message</div>
    <div id="record-wave" style="background:var(--bg-elevated);border-radius:12px;padding:20px;text-align:center;font-size:13px;color:var(--text-muted)">
      Press Record to share with farmers nearby
    </div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn btn-danger btn-full" id="record-btn" onclick="startRecording()">🔴 Record</button>
      <button class="btn btn-ghost" onclick="hideRecordVoice()">Cancel</button>
    </div>
  </div>

  ${COMMUNITY_POSTS.map(p => `
    <div class="voice-bubble">
      <div class="voice-bubble-header">
        <div class="comm-avatar">${p.avatar}</div>
        <div>
          <div class="comm-name">${p.farmer}</div>
          <div class="comm-meta">📍 ${p.village} · ${p.time}</div>
        </div>
        <div style="margin-left:auto"><span class="badge badge-green">+${p.likes} 👍</span></div>
      </div>
      ${p.hasAudio ? `
        <div class="audio-player" onclick="playVoiceBubble(${p.id})">
          <div class="play-btn-sm" id="play-${p.id}">▶</div>
          <svg class="audio-wave" id="wave-${p.id}" viewBox="0 0 200 24"></svg>
          <div class="audio-dur">0:${Math.floor(Math.random()*40+10)}</div>
        </div>` : ''}
      <div class="bubble-text">${p.message}</div>
      ${p.translation ? `<div class="bubble-translation">"${p.translation}"</div>` : ''}
      <div class="bubble-actions">
        <button class="bubble-action" onclick="likePost(${p.id})">👍 Like</button>
        <button class="bubble-action" onclick="replyPost(${p.id})">💬 ${p.replies} Replies</button>
        <button class="bubble-action" onclick="sharePost(${p.id})">📤 Share</button>
      </div>
    </div>`).join('')}`;
}

// ── Simulator Screen ─────────────────────────────────────────
function renderSimulator() {
  const cropEmojis = { Wheat:'🌾', Mustard:'🌻', Rice:'🍚', Maize:'🌽', Soybean:'🫘' };
  return `
  <div class="section-header">
    <div class="section-title">🧪 What-If Simulator</div>
    <span class="badge badge-blue">AI Powered</span>
  </div>

  <div class="card" style="margin-bottom:16px">
    <div style="font-size:13px;color:var(--text-muted);margin-bottom:12px">
      Select a crop to simulate yield & profit on your <strong style="color:var(--green-400)">${FARMER_PROFILE.landAcres} acres</strong>:
    </div>
    <div class="sim-crop-grid">
      ${WHAT_IF_CROPS.map(c => `
        <div class="sim-crop-btn ${state.simCrop===c.name?'selected':''}" onclick="selectSimCrop('${c.name}')">
          <div class="sim-crop-emoji">${cropEmojis[c.name]||'🌱'}</div>
          <div class="sim-crop-name">${c.name}</div>
        </div>`).join('')}
    </div>
  </div>

  <div id="sim-result-area">
    <div class="card" style="text-align:center;padding:32px;color:var(--text-muted)">
      <div style="font-size:40px;margin-bottom:8px">🌱</div>
      <div>Select a crop above to see yield and profit predictions</div>
    </div>
  </div>`;
}

function showSimResult(cropName) {
  const c = WHAT_IF_CROPS.find(x => x.name === cropName);
  if (!c) return;
  const acres = FARMER_PROFILE.landAcres;
  const totalYield = (c.yieldPerAcre * acres).toFixed(1);
  const totalProfit = Math.round(c.yieldPerAcre * acres * c.pricePerQ * 0.9);
  const riskColor = c.risk === 'Low' ? 'var(--green-400)' : c.risk === 'Medium' ? 'var(--gold-400)' : 'var(--red-400)';
  const cropEmojis = { Wheat:'🌾', Mustard:'🌻', Rice:'🍚', Maize:'🌽', Soybean:'🫘' };

  $('#sim-result-area').innerHTML = `
    <div class="sim-result">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="font-size:44px">${cropEmojis[c.name]||'🌱'}</div>
        <div>
          <div style="font-size:18px;font-weight:800">${c.name} Simulation</div>
          <div style="font-size:12px;color:var(--text-muted)">${acres} acres · ${c.growDays} day crop</div>
        </div>
      </div>
      <div class="sim-result-grid">
        <div class="sim-metric">
          <div class="sim-metric-val">${totalYield}q</div>
          <div class="sim-metric-label">Expected Yield</div>
        </div>
        <div class="sim-metric">
          <div class="sim-metric-val" style="color:var(--green-400)">₹${(totalProfit/1000).toFixed(0)}K</div>
          <div class="sim-metric-label">Estimated Profit</div>
        </div>
        <div class="sim-metric">
          <div class="sim-metric-val" style="color:var(--blue-400)">${c.waterNeed}</div>
          <div class="sim-metric-label">Water Needs</div>
        </div>
        <div class="sim-metric">
          <div class="sim-metric-val" style="color:${riskColor}">${c.risk}</div>
          <div class="sim-metric-label">Risk Level</div>
        </div>
      </div>
      <div style="margin-top:14px;background:rgba(255,255,255,0.04);border-radius:12px;padding:12px">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">💡 AI Recommendation</div>
        <div style="font-size:13px;line-height:1.6;color:var(--text-secondary)">
          ${c.name === 'Mustard' ? '🔥 High profitability! Low water needs make this ideal for current season. Govt bonus of ₹500/q available.' :
            c.name === 'Wheat'   ? '✅ Stable and safe choice. Strong mandi demand. Consider early sowing for +15% yield.' :
            c.name === 'Rice'    ? '⚠️ High water requirement may increase costs. Check groundwater levels first.' :
            c.name === 'Maize'   ? '👍 Good for mixed cropping. Consider intercropping with legumes for extra ₹8K income.' :
            '⚠️ High risk due to market volatility. Ensure crop insurance before sowing.'}
        </div>
      </div>
    </div>`;
}

// ── Schemes Screen ───────────────────────────────────────────
function renderSchemes() {
  return `
  <div class="farm-score-section">
    <div class="farm-score-title">Your Farm Score</div>
    <canvas id="score-ring" width="160" height="160"></canvas>
    <div class="loan-banner">
      <div class="loan-icon">🏦</div>
      <div>
        <div class="loan-title">Loan Eligible!</div>
        <div class="loan-amount">₹${(FARMER_PROFILE.loanAmount/1000)}K Available</div>
        <div class="loan-sub">Low-interest KCC loan · 4% p.a.</div>
      </div>
    </div>
    <div style="margin-top:14px">
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:8px">🏅 Your Badges</div>
      <div class="badges-row" style="justify-content:center">
        ${FARMER_PROFILE.badges.map(b => `
          <div class="badge-chip">🏆 <span>${b}</span></div>`).join('')}
      </div>
    </div>
  </div>

  <div class="section-header">
    <div class="section-title">🏛 Government Schemes</div>
    <span class="badge badge-green">${GOVT_SCHEMES.filter(s=>s.eligible).length} Eligible</span>
  </div>
  ${GOVT_SCHEMES.map(s => `
    <div class="scheme-card ${!s.eligible ? 'not-eligible' : ''}">
      <div class="scheme-header">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span style="font-size:22px">${s.icon}</span>
            <div class="scheme-title">${s.name}</div>
          </div>
          <div class="scheme-desc">${s.desc}</div>
        </div>
        <span class="badge ${s.eligible ? 'badge-green' : 'badge-red'}">${s.eligible ? '✓ Eligible' : '✗ Ineligible'}</span>
      </div>
      <div class="scheme-meta">
        <span class="badge badge-amber">💰 ${s.benefit}</span>
        <span class="scheme-deadline">⏰ ${s.deadline}</span>
      </div>
      ${s.eligible ? `<button class="btn btn-primary btn-sm" style="margin-top:12px;width:100%" onclick="applyScheme('${s.name}')">Apply Now →</button>` : ''}
    </div>`).join('')}`;
}

// ── Score Ring Renderer ──────────────────────────────────────
function drawScoreRing() {
  const canvas = $('#score-ring');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const score = FARMER_PROFILE.farmScore;
  const cx = 80, cy = 80, R = 60, lw = 14;
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (score / 100) * 2 * Math.PI;

  ctx.clearRect(0, 0, 160, 160);
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(46,125,50,0.12)';
  ctx.lineWidth = lw;
  ctx.stroke();
  const grad = ctx.createLinearGradient(0, 0, 160, 160);
  grad.addColorStop(0, '#2E7D32');
  grad.addColorStop(1, '#F9A825');
  ctx.beginPath();
  ctx.arc(cx, cy, R, startAngle, endAngle);
  ctx.strokeStyle = grad;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.fillStyle = '#2E7D32';
  ctx.font = 'bold 32px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(score, cx, cy - 8);
  ctx.fillStyle = '#6A9B6F';
  ctx.font = '11px Plus Jakarta Sans, sans-serif';
  ctx.fillText('FARM SCORE', cx, cy + 16);
}

// ── Satellite Canvas ─────────────────────────────────────────
function drawSatelliteMap() {
  const canvas = $('#satellite-canvas');
  if (!canvas) return;
  const W = canvas.offsetWidth || 400;
  canvas.width = W;
  canvas.height = 280;
  const ctx = canvas.getContext('2d');

  const zones = [
    { x:0,    y:0,   w:0.55, h:0.55, ndvi:0.82, label:'North Field' },
    { x:0,    y:0.55,w:0.45, h:0.45, ndvi:0.55, label:'South Field' },
    { x:0.55, y:0,   w:0.45, h:0.45, ndvi:0.30, label:'East Plot' },
    { x:0.55, y:0.45,w:0.45, h:0.55, ndvi:0.71, label:'West Plot' },
  ];

  function ndviColor(v) {
    if (v >= 0.7) return ['#14532d','#22c55e'];
    if (v >= 0.5) return ['#713f12','#fbbf24'];
    return ['#7f1d1d','#ef4444'];
  }

  zones.forEach(z => {
    const px = z.x * W, py = z.y * 280;
    const pw = z.w * W, ph = z.h * 280;
    const [dark, bright] = ndviColor(z.ndvi);
    const grad = ctx.createRadialGradient(px+pw/2, py+ph/2, 0, px+pw/2, py+ph/2, Math.max(pw,ph)*0.6);
    grad.addColorStop(0, bright + '80');
    grad.addColorStop(1, dark   + 'cc');

    ctx.fillStyle = grad;
    ctx.fillRect(px + 1, py + 1, pw - 2, ph - 2);

    // Grid texture
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let gx = px; gx < px + pw; gx += 16) {
      ctx.beginPath(); ctx.moveTo(gx, py); ctx.lineTo(gx, py+ph); ctx.stroke();
    }
    for (let gy = py; gy < py + ph; gy += 16) {
      ctx.beginPath(); ctx.moveTo(px, gy); ctx.lineTo(px+pw, gy); ctx.stroke();
    }

    // Label
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(px+6, py+6, 90, 32);
    ctx.fillStyle = bright;
    ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
    ctx.fillText(z.label, px + 12, py + 18);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '10px Plus Jakarta Sans, sans-serif';
    ctx.fillText(`NDVI: ${z.ndvi.toFixed(2)}`, px + 12, py + 32);

    // Border
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, pw, ph);
  });
}

// ── Price Chart ───────────────────────────────────────────────
function drawPriceChart() {
  const canvas = $('#price-chart');
  if (!canvas) return;
  const W = canvas.offsetWidth || 360;
  canvas.width = W; canvas.height = 140;
  const ctx = canvas.getContext('2d');
  const prices = [2100, 2150, 2180, 2200, 2190, 2220, 2250];
  const min = Math.min(...prices) - 50;
  const max = Math.max(...prices) + 50;
  const pad = { t: 10, r: 10, b: 30, l: 40 };
  const cW = W - pad.l - pad.r;
  const cH = 140 - pad.t - pad.b;

  const xOf = i => pad.l + (i / (prices.length - 1)) * cW;
  const yOf = v => pad.t + (1 - (v - min) / (max - min)) * cH;

  ctx.strokeStyle = 'rgba(46,125,50,0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + (i / 4) * cH;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
  }
  const fillGrad = ctx.createLinearGradient(0, pad.t, 0, pad.t + cH);
  fillGrad.addColorStop(0, 'rgba(46,125,50,0.18)');
  fillGrad.addColorStop(1, 'rgba(46,125,50,0)');
  ctx.beginPath();
  ctx.moveTo(xOf(0), yOf(prices[0]));
  prices.forEach((p, i) => { if (i > 0) ctx.lineTo(xOf(i), yOf(p)); });
  ctx.lineTo(xOf(prices.length - 1), pad.t + cH);
  ctx.lineTo(xOf(0), pad.t + cH);
  ctx.closePath();
  ctx.fillStyle = fillGrad;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(xOf(0), yOf(prices[0]));
  prices.forEach((p, i) => { if (i > 0) ctx.lineTo(xOf(i), yOf(p)); });
  ctx.strokeStyle = '#2E7D32';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.stroke();
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  prices.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(xOf(i), yOf(p), 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#2E7D32';
    ctx.fill();
    ctx.strokeStyle = '#F2F8EE';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(46,125,50,0.6)';
    ctx.font = '9px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(days[i], xOf(i), 140 - 8);
  });
  ctx.fillStyle = 'rgba(46,125,50,0.5)';
  ctx.font = '9px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('₹'+min, pad.l - 4, pad.t + cH);
  ctx.fillText('₹'+max, pad.l - 4, pad.t + 10);
}

// ── Camera Logic ─────────────────────────────────────────────
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:'environment' }, audio:false });
    const video = $('#camera-video');
    video.srcObject = stream;
    state.cameraActive = true;
    $('#cam-start-overlay').style.display = 'none';
    $('#cam-status-text').textContent = '🟢 Scanning...';
    showToast('Camera started — point at a crop leaf', 'success');
  } catch(e) {
    showToast('Camera not available. Showing demo mode.', 'error');
    $('#cam-start-overlay').style.display = 'none';
    $('#cam-status-text').textContent = '🟡 Demo Mode';
    simulateDetection();
  }
}

function simulateDetection() {
  setTimeout(() => {
    $('#detection-results').style.display = 'block';
    const results = [
      { type:'disease', icon:'🔴', title:'Powdery Mildew Detected', subtitle:'Confidence: 87%',
        text: state.aiMode === 'simple'
          ? 'White powder on leaves found. Spray fungicide (available at local agri center) mixed with water. Do this every 7 days for 3 weeks.'
          : 'Erysiphe graminis (powdery mildew) detected at 87% confidence. Apply Propiconazole 25 EC @ 0.1% or Hexaconazole 5 EC @ 0.2% at 7-day intervals. Systemic resistance may be triggered.',
        fill: '#ef4444', pct: 87 },
      { type:'healthy', icon:'🟢', title:'Healthy Tissue Zones', subtitle:'Confidence: 94%',
        text: state.aiMode === 'simple'
          ? 'Most of your leaf looks healthy and green! Keep watering regularly and check again in 3 days.'
          : 'Chlorophyll density within normal parameters (NDVI ≈ 0.78). Stomatal conductance appears unimpaired. Continue current irrigation protocol.',
        fill: '#10b981', pct: 94 },
    ];
    $('#results-list').innerHTML = results.map(r => `
      <div class="ai-result-panel ${r.type}">
        <div class="ai-result-header">
          <div class="ai-result-icon">${r.icon}</div>
          <div><div class="ai-result-title">${r.title}</div><div class="ai-result-subtitle">${r.subtitle}</div></div>
        </div>
        <div class="ai-result-text">${r.text}</div>
        <div class="confidence-bar-wrap">
          <div class="confidence-label"><span>Confidence</span><span>${r.pct}%</span></div>
          <div class="confidence-bar"><div class="confidence-fill" style="width:${r.pct}%;background:${r.fill}"></div></div>
        </div>
        <button class="voice-output-btn" onclick="speakText(\`${r.text.replace(/`/g,"'")}\`)">
          <span class="speak-icon">🔊</span> Hear Diagnosis
        </button>
      </div>`).join('');
  }, 2000);
}

function captureAndAnalyze() {
  if (!state.cameraActive) { showToast('Start the camera first!', 'error'); return; }
  $('#cam-status-text').textContent = '🔍 Analyzing...';
  showToast('Analyzing crop...', 'success');
  simulateDetection();
}

function switchCamera() { showToast('Camera switched', 'success'); }
function toggleFlash()   { showToast('Flash toggled', 'success'); }

// ── Speech Synthesis ─────────────────────────────────────────
function speakText(text) {
  if (!window.speechSynthesis) { showToast('Voice not supported in this browser', 'error'); return; }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'en-IN';
  utt.rate = 0.9;
  window.speechSynthesis.speak(utt);
  showToast('🔊 Speaking...', 'success');
}

// ── Voice Input ───────────────────────────────────────────────
function toggleVoiceInput() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showToast('Voice input not supported. Try Chrome.', 'error'); return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SR();
  rec.lang = 'en-IN';
  rec.interimResults = false;
  state.voiceListening = true;
  $('#mic-btn')?.classList.add('listening');
  $('#voice-indicator')?.classList.add('show');
  rec.start();
  rec.onresult = (e) => {
    const txt = e.results[0][0].transcript;
    $('#chat-input').value = txt;
    state.voiceListening = false;
    $('#mic-btn')?.classList.remove('listening');
    $('#voice-indicator')?.classList.remove('show');
    sendChat();
  };
  rec.onerror = rec.onend = () => {
    state.voiceListening = false;
    $('#mic-btn')?.classList.remove('listening');
    $('#voice-indicator')?.classList.remove('show');
  };
}

// ── Global Voice Navigation ──────────────────────────────────
function startGlobalVoice() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showToast('Voice navigation not supported. Try Chrome.', 'error'); return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SR();
  rec.lang = 'en-IN';
  rec.interimResults = false;
  rec.continuous = false;
  $('#voice-nav-btn')?.classList.add('active');
  $('#voice-indicator')?.classList.add('show');
  rec.start();
  rec.onresult = (e) => {
    const cmd = e.results[0][0].transcript.toLowerCase();
    $('#voice-indicator')?.classList.remove('show');
    $('#voice-nav-btn')?.classList.remove('active');
    if (cmd.includes('home') || cmd.includes('dashboard')) navigateTo('home');
    else if (cmd.includes('camera') || cmd.includes('scan')) navigateTo('camera');
    else if (cmd.includes('market') || cmd.includes('mandi') || cmd.includes('price')) navigateTo('market');
    else if (cmd.includes('satellite') || cmd.includes('map') || cmd.includes('field')) navigateTo('satellite');
    else if (cmd.includes('chat') || cmd.includes('ai') || cmd.includes('help') || cmd.includes('soil') || cmd.includes('pest')) navigateTo('chat');
    else if (cmd.includes('community') || cmd.includes('farmer') || cmd.includes('network')) navigateTo('community');
    else if (cmd.includes('scheme') || cmd.includes('loan') || cmd.includes('score')) navigateTo('schemes');
    else if (cmd.includes('simulator') || cmd.includes('what if') || cmd.includes('crop')) navigateTo('simulator');
    else showToast(`Heard: "${cmd}" — try "home", "camera", "market"`, 'error');
    showToast(`🎤 "${cmd}"`, 'success');
  };
  rec.onerror = rec.onend = () => {
    $('#voice-indicator')?.classList.remove('show');
    $('#voice-nav-btn')?.classList.remove('active');
  };
}

// ── AI Chat Actions ──────────────────────────────────────────
function sendChat() {
  const input = $('#chat-input');
  const txt = input?.value.trim();
  if (!txt) return;
  input.value = '';
  autoGrow(input);

  state.chatHistory.push({ role:'user', text: txt });
  const msgs = $('#chat-messages');
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user';
  userBubble.textContent = txt;
  msgs.appendChild(userBubble);

  // Typing indicator
  const typing = document.createElement('div');
  typing.className = 'chat-bubble ai';
  typing.id = 'typing-indicator';
  typing.innerHTML = '<span class="spinner"></span>';
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;

  setTimeout(() => {
    typing.remove();
    const resp = getAIResponse(txt);
    state.chatHistory.push({ role:'ai', text: resp.text });
    const aiBubble = document.createElement('div');
    aiBubble.className = 'chat-bubble ai';
    aiBubble.innerHTML = `<div class="ai-mode-label">${resp.icon} ${resp.title}</div>${resp.text}`;
    msgs.appendChild(aiBubble);
    msgs.scrollTop = msgs.scrollHeight;
    speakText(resp.text);
  }, 1200);
}

function setAIMode(mode) {
  state.aiMode = mode;
  renderPage('chat');
}

function toggleAIMode() {
  state.aiMode = state.aiMode === 'simple' ? 'expert' : 'simple';
  renderPage('camera');
}

function autoGrow(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}

// ── Misc Actions ─────────────────────────────────────────────
function toggleTask(i) {
  if (state.tasksDone.has(i)) state.tasksDone.delete(i);
  else { state.tasksDone.add(i); showToast('Task completed! 🎉', 'success'); }
  renderPage('home');
}

function handleAlertClick(id) {
  const a = GOLDEN_HOUR_ALERTS.find(x => x.id === id);
  if (a) showToast(`Opening: ${a.title}`, 'success');
}

function makeCall(phone, name) {
  showToast(`Calling ${name}...`, 'success');
  window.location.href = `tel:${phone}`;
}

function applyScheme(name) { showToast(`Opening application for ${name}...`, 'success'); }
function exportReport()    { showToast('Farm report exported to PDF!', 'success'); }
function zoneDetail(label) { showToast(`Detailed view: ${label}`, 'success'); }
function zoomMap(factor)   { showToast(`Map ${factor > 1 ? 'zoomed in' : 'zoomed out'}`, 'success'); }
function refreshSatellite(){ showToast('Satellite imagery refreshed!', 'success'); drawSatelliteMap(); }
function likePost(id)      { showToast('Post liked! 👍', 'success'); }
function replyPost(id)     { showToast('Reply feature coming soon', 'success'); }
function sharePost(id)     { showToast('Post shared to your network!', 'success'); }
function showRecordVoice() { $('#record-panel').style.display = 'block'; }
function hideRecordVoice() { $('#record-panel').style.display = 'none'; }
function startRecording()  { showToast('🎙 Recording... (tap Stop when done)', 'success'); }
function selectSimCrop(name) { state.simCrop = name; renderPage('simulator'); showSimResult(name); }
function playVoiceBubble(id) { showToast('Playing voice message...', 'success'); }

// ── Page Renderer ────────────────────────────────────────────
const PAGE_RENDERERS = {
  home:      renderDashboard,
  camera:    renderCamera,
  satellite: renderSatellite,
  market:    renderMarket,
  chat:      renderChat,
  community: renderCommunity,
  simulator: renderSimulator,
  schemes:   renderSchemes,
};

function renderPage(tab) {
  const page = $(`#page-${tab}`);
  if (!page || !PAGE_RENDERERS[tab]) return;
  page.innerHTML = PAGE_RENDERERS[tab]();

  // Post-render hooks
  requestAnimationFrame(() => {
    if (tab === 'schemes')  drawScoreRing();
    if (tab === 'satellite') drawSatelliteMap();
    if (tab === 'market')   drawPriceChart();
    if (tab === 'community') {
      $$('.audio-wave').forEach(svg => drawSVGWave(svg));
    }
  });
}

// ── Router ───────────────────────────────────────────────────
function initRouter() {
  $$('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;
      navigateTo(tab);
      if (!$(`#page-${tab}`)?.innerHTML.trim()) renderPage(tab);
    });
  });
}

// ── Offline Detection ────────────────────────────────────────
function initOffline() {
  const banner = $('#offline-banner');
  window.addEventListener('offline', () => banner.classList.add('show'));
  window.addEventListener('online',  () => { banner.classList.remove('show'); showToast('Back online! Syncing data...', 'success'); });
}

// ── Bootstrap ────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  renderPage('home');
  initRouter();
  initOffline();
  startCountdowns();

  // Expose globals for inline handlers
  Object.assign(window, {
    navigateTo, handleAlertClick, toggleTask,
    startCamera, captureAndAnalyze, switchCamera, toggleFlash,
    speakText, toggleVoiceInput, startGlobalVoice,
    sendChat, setAIMode, toggleAIMode, autoGrow,
    selectSimCrop, showSimResult,
    applyScheme, exportReport, zoneDetail, zoomMap, refreshSatellite,
    likePost, replyPost, sharePost, showRecordVoice, hideRecordVoice, startRecording,
    playVoiceBubble, makeCall, showToast,
  });
});
