# Ephemere UI Implementation Guide
## Retro-Futuristic Chat Interface – Component & Engineering Specifications

---

## Quick Start

### View the Prototype
```bash
# Open in browser (supports all modern browsers with WebGL)
open ephemere-ui-prototype.html
# or
python -m http.server 8000 && open http://localhost:8000/ephemere-ui-prototype.html
```

---

## Architecture Overview

The Ephemere UI is built on three architectural pillars:

1. **Semantic HTML + CSS Custom Properties** – Maintainable design system
2. **CSS Animations & Transitions** – No heavy animation libraries (pure CSS for 60 FPS)
3. **Vanilla JavaScript** – Direct socket integration without framework overhead

### Directory Structure (Recommended)
```
ephemere/
├── public/
│   ├── index.html              # Main entry point
│   ├── styles/
│   │   ├── system.css          # Design tokens & variables
│   │   ├── layout.css          # Grid & flex layout
│   │   ├── components.css      # Chat bubbles, badges, panels
│   │   ├── textures.css        # Paper grain, noise overlays
│   │   └── animations.css      # Motion logic
│   ├── js/
│   │   ├── app.js              # Main app controller
│   │   ├── messages.js         # Message rendering & logic
│   │   ├── socket-handler.js   # WebSocket integration
│   │   ├── network-visualizer.js # 3D topology (Three.js)
│   │   └── ui-state.js         # State management
│   └── assets/
│       ├── textures/
│       │   ├── paper-grain.png # 512x512 texture
│       │   └── micro-noise.svg # SVG pattern
│       ├── fonts/              # Woff2 font files
│       └── icons/              # SVG icon set
└── UI_DESIGN_SPEC.md           # This design system
```

---

## CSS System Implementation

### 1. Design Tokens Setup (system.css)

```css
:root {
  /* ---- Color Tokens ---- */
  --color-primary: #f5f0eb;           /* Warm paper base */
  --color-secondary: #1a1a1a;         /* Dark terminal noir */
  --color-accent-success: #00e676;    /* Cyber green */
  --color-accent-warning: #ffd700;    /* Amber alert */
  --color-accent-danger: #d62839;     /* Crimson error */
  --color-accent-info: #00bcd4;       /* Cyan info */
  
  /* ---- Typography Tokens ---- */
  --font-serif-family: 'IBM Plex Serif', 'Georgia', serif;
  --font-serif-size: 18px;
  --font-serif-weight: 700;
  
  --font-sans-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  --font-sans-size: 14px;
  --font-sans-weight: 400;
  
  --font-mono-family: 'JetBrains Mono', 'Courier New', monospace;
  --font-mono-size: 11px;
  --font-mono-weight: 400;
  
  /* ---- Spacing Tokens ---- */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* ---- Z-Index Stack ---- */
  --z-texture-overlay: 9999;
  --z-modal: 1000;
  --z-dropdown: 100;
  --z-sticky: 50;
  --z-base: 0;
}

/* Dark mode variant */
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #1a1a1a;
    --color-secondary: #f5f0eb;
  }
}
```

### 2. Texture & Grain System (textures.css)

```css
/* Global paper grain overlay */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="noise"><feTurbulence baseFrequency="0.9" numOctaves="4"/></filter><rect width="200" height="200" fill="%231a1a1a" opacity="0.015" filter="url(%23noise)"/></svg>');
  mix-blend-mode: overlay;
  pointer-events: none;
  z-index: var(--z-texture-overlay);
}

/* Component-level micro-noise */
.message-bubble,
.panel,
.badge {
  background-image:
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><filter id="n"><feTurbulence baseFrequency="2" numOctaves="1" result="noise"/></filter><rect width="100" height="100" fill="%23000" opacity="0.005" filter="url(%23n)"/></svg>');
  background-size: 50px 50px;
}

/* Crisp halftone shadow (replaces blur) */
.card-shadow {
  box-shadow:
    2px 2px 0px rgba(0, 0, 0, 0.12),
    4px 4px 0px rgba(0, 0, 0, 0.08),
    6px 6px 0px rgba(0, 0, 0, 0.04);
}

/* Stippled badge texture */
.badge {
  background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
  background-size: 3px 3px;
}
```

### 3. Intentional Imperfection (animations.css)

```css
/* Irregular corner radii */
.message-bubble {
  border-radius: 4px 6px 5px 7px;
}

.channel-item {
  border-radius: 3px 5px 4px 6px;
}

/* Hand-drawn rotation (user messages) */
.message.own {
  transform: rotate(-0.5deg);
}

.message.other {
  transform: rotate(0.3deg);
}

/* Sending state distortion */
.message.sending {
  animation: socket-sending 500ms ease-out forwards;
}

@keyframes socket-sending {
  0% {
    opacity: 1;
    transform: scaleX(1) rotate(var(--rotation, -0.5deg));
  }
  50% {
    opacity: 0.75;
    transform: scaleX(0.97) rotate(var(--rotation, -0.5deg));
  }
  100% {
    opacity: 1;
    transform: scaleX(1) rotate(var(--rotation, -0.5deg));
  }
}

/* Connection unstable wobble */
.connection-badge.unstable {
  animation: network-wobble 200ms infinite;
}

@keyframes network-wobble {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

/* Reconnect pulse */
.connection-badge.reconnecting {
  animation: pulse-heartbeat 600ms infinite;
}

@keyframes pulse-heartbeat {
  0%, 100% {
    border-color: var(--color-accent-success);
    box-shadow: 0 0 0 0 rgba(0, 230, 118, 0.4);
  }
  50% {
    border-color: var(--color-accent-warning);
    box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
  }
}
```

---

## JavaScript Integration Patterns

### 1. Socket State Management (socket-handler.js)

```javascript
class SocketHandler {
  constructor(options = {}) {
    this.url = options.url || 'ws://localhost:8080';
    this.reconnectAttempts = 0;
    this.maxReconnect = 5;
    this.socket = null;
    this.messageQueue = [];
    
    this.ui = {
      badge: document.getElementById('statusBadge'),
      thread: document.getElementById('messageThread'),
      metrics: document.getElementById('networkMetrics')
    };
  }

  connect() {
    this.socket = new WebSocket(this.url);
    
    this.socket.addEventListener('open', () => this.onOpen());
    this.socket.addEventListener('message', (e) => this.onMessage(e));
    this.socket.addEventListener('close', () => this.onClose());
    this.socket.addEventListener('error', (e) => this.onError(e));
  }

  onOpen() {
    console.log('[Socket] Connected');
    this.reconnectAttempts = 0;
    this.updateBadge('● ONLINE', '');
    this.flushQueue();
  }

  onMessage(event) {
    const data = JSON.parse(event.data);
    
    // Update UI based on message type
    if (data.type === 'CHAT_MESSAGE') {
      this.renderMessage(data.payload);
    } else if (data.type === 'SOCKET_METRIC') {
      this.updateMetrics(data.payload);
    }
  }

  onClose() {
    console.warn('[Socket] Disconnected, attempting reconnect...');
    this.updateBadge('✕ OFFLINE', 'offline');
    this.attemptReconnect();
  }

  onError(error) {
    console.error('[Socket] Error:', error);
    this.updateBadge('⚠ LATENCY', 'unstable');
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnect) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      console.log(`[Socket] Reconnecting in ${delay}ms...`);
      
      setTimeout(() => {
        this.updateBadge('↻ RECONNECTING', 'reconnecting');
        this.connect();
      }, delay);
    }
  }

  sendMessage(text, metadata = {}) {
    const msg = {
      id: this.generateId(),
      content: text,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(msg));
    } else {
      this.messageQueue.push(msg);
      this.updateBadge('⏳ QUEUED', 'unstable');
    }
  }

  flushQueue() {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      this.socket.send(JSON.stringify(msg));
    }
  }

  updateBadge(text, className) {
    this.ui.badge.textContent = text;
    this.ui.badge.className = `connection-badge ${className}`;
  }

  updateMetrics(data) {
    // data: { latency, jitter, packetLoss, throughput, activeNodes }
    const metricsHTML = `
      <div class="metric-row">
        <span class="metric-label">LATENCY:</span>
        <span class="metric-value">${data.latency}ms</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">JITTER:</span>
        <span class="metric-value">±${data.jitter}ms</span>
      </div>
      <!-- ... more metrics ... -->
    `;
    this.ui.metrics.innerHTML = metricsHTML;
  }

  renderMessage(payload) {
    const { author, content, timestamp, latency } = payload;
    const messageEl = this.createMessageElement(author, content, timestamp, latency);
    this.ui.thread.appendChild(messageEl);
    this.ui.thread.scrollTop = this.ui.thread.scrollHeight;
  }

  createMessageElement(author, content, timestamp, latency) {
    const div = document.createElement('div');
    div.className = 'message';
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = `
      <div class="message-content">${escapeHtml(content)}</div>
      <div class="message-metadata">
        ${author} • ${new Date(timestamp).toLocaleTimeString()} • ${latency}
      </div>
    `;
    
    div.appendChild(bubble);
    return div;
  }

  generateId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Usage
const socket = new SocketHandler({ url: 'ws://your-server.com/socket' });
socket.connect();
```

### 2. Message Rendering with Intentional Imperfection

```javascript
class MessageRenderer {
  static createBubble(msg) {
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    // Apply random micro-rotation to user messages
    if (msg.isOwn) {
      const rotation = (Math.random() * 1 - 0.5); // -0.5 to 0.5 degrees
      bubble.style.setProperty('--rotation', `${rotation}deg`);
    }

    // Apply irregular corner radii
    const radii = [
      Math.random() * 2 + 3,  // 3-5px
      Math.random() * 2 + 5,  // 5-7px
      Math.random() * 2 + 4,  // 4-6px
      Math.random() * 2 + 6   // 6-8px
    ];
    bubble.style.borderRadius = `${radii[0]}px ${radii[1]}px ${radii[2]}px ${radii[3]}px`;

    // Render content
    bubble.innerHTML = `
      <div class="message-content">${escapeHtml(msg.content)}</div>
      <div class="message-metadata">
        ${msg.author} • ${msg.time} • ${msg.latency}
      </div>
    `;

    return bubble;
  }

  static createSendingAnimation(element) {
    element.classList.add('sending');
    setTimeout(() => {
      element.classList.remove('sending');
    }, 500);
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
```

### 3. 3D Network Topology (network-visualizer.js)

For the 3D node visualization, integrate **Three.js**:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
```

```javascript
class NetworkVisualizer {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 
      container.clientWidth / container.clientHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearColor(0x1a1410, 0.1);
    container.appendChild(this.renderer.domElement);

    this.nodes = [];
    this.connections = [];
    this.camera.position.z = 5;

    this.initScene();
    this.animate();
    this.setupClickDetection();
  }

  initScene() {
    // Create nodes
    const nodeData = [
      { id: 'node-1', pos: [-2, 0, 0], color: 0x00e676, label: 'NODE-1: 45ms' },
      { id: 'node-2', pos: [0, 1.5, 0], color: 0x00bcd4, label: 'NODE-2: 62ms' },
      { id: 'node-3', pos: [2, 0, 0], color: 0x9d4edd, label: 'NODE-3: 38ms' }
    ];

    nodeData.forEach(data => {
      const geometry = new THREE.SphereGeometry(0.3, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: data.color,
        emissive: data.color,
        emissiveIntensity: 0.3
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...data.pos);
      mesh.userData = data;

      this.scene.add(mesh);
      this.nodes.push(mesh);
    });

    // Create connections
    for (let i = 0; i < this.nodes.length - 1; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        this.createConnection(this.nodes[i], this.nodes[j]);
      }
    }

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    this.scene.add(light);
  }

  createConnection(node1, node2) {
    const geometry = new THREE.TubeGeometry(
      new THREE.LineCurve3(node1.position, node2.position),
      20, 0.05, 8, false
    );
    const material = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffd700,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.6
    });
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    this.connections.push(mesh);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Rotate nodes slightly
    this.nodes.forEach(node => {
      node.rotation.x += 0.002;
      node.rotation.y += 0.003;
    });

    this.renderer.render(this.scene, this.camera);
  }

  setupClickDetection() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    this.container.addEventListener('click', (event) => {
      mouse.x = (event.clientX / this.container.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / this.container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.nodes);

      if (intersects.length > 0) {
        const node = intersects[0].object;
        console.log('Clicked node:', node.userData.id);
        // Emit event: trigger channel switch, etc.
      }
    });
  }
}

// Usage
const visualizer = new NetworkVisualizer(document.querySelector('.network-3d-container'));
```

---

## Integration with Socket System

### Complete Flow Example

```javascript
// app.js
class EphemereApp {
  constructor() {
    this.socket = new SocketHandler();
    this.messageRenderer = new MessageRenderer();
    this.ui = this.initializeUI();
    
    this.socket.connect();
    this.attachEventListeners();
  }

  initializeUI() {
    return {
      sendBtn: document.getElementById('sendBtn'),
      messageInput: document.getElementById('messageInput'),
      messageThread: document.getElementById('messageThread'),
      channelItems: document.querySelectorAll('.channel-item'),
    };
  }

  attachEventListeners() {
    this.ui.sendBtn.addEventListener('click', () => this.sendMessage());
    
    this.ui.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    this.ui.channelItems.forEach(item => {
      item.addEventListener('click', (e) => this.switchChannel(e.target));
    });
  }

  sendMessage() {
    const text = this.ui.messageInput.value.trim();
    if (!text) return;

    // Create optimistic UI update
    const tempMsg = {
      id: 'temp-' + Date.now(),
      content: text,
      author: 'You',
      isOwn: true,
      timestamp: new Date(),
      latency: '...'
    };

    const messageEl = document.createElement('div');
    messageEl.className = 'message own';
    const bubble = this.messageRenderer.createBubble(tempMsg);
    messageEl.appendChild(bubble);
    this.ui.messageThread.appendChild(messageEl);

    // Trigger sending animation
    this.messageRenderer.createSendingAnimation(messageEl);

    // Send via socket
    this.socket.sendMessage(text, {
      channel: this.currentChannel,
      clientId: this.clientId
    });

    this.ui.messageInput.value = '';
  }

  switchChannel(element) {
    document.querySelectorAll('.channel-item').forEach(e => 
      e.classList.remove('active')
    );
    element.classList.add('active');
    this.currentChannel = element.textContent.trim().replace('#', '');

    // Clear thread and fetch messages for new channel
    this.ui.messageThread.innerHTML = '';
    this.socket.sendMessage(null, {
      type: 'FETCH_CHANNEL',
      channel: this.currentChannel
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new EphemereApp();
});
```

---

## Performance Considerations

### Optimization Checklist
- [ ] Use CSS transforms (translate, rotate, scale) for animations – GPU accelerated
- [ ] Lazy-load 3D topology scene (Three.js) – defer until visible
- [ ] Implement virtual scrolling for message threads > 1000 items
- [ ] Debounce connection status updates to 200ms minimum
- [ ] Use `requestAnimationFrame` for smooth 60 FPS animations
- [ ] Minimize repaints: batch DOM updates, use `will-change` selectively
- [ ] Compress font files to WOFF2 format (~40-60KB per font)
- [ ] Gzip texture SVGs and PNG assets

### Asset Loading Strategy
```javascript
// Preload critical resources
const preloadFont = (family, weight) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.type = 'font/woff2';
  link.href = `/fonts/${family}-${weight}.woff2`;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};

preloadFont('inter', 400);
preloadFont('ibm-plex-serif', 700);

// Lazy load Three.js only when needed
const loadNetworkVisualizer = () => {
  return import('https://cdn.jsdelivr.net/npm/three@r128/build/three.min.js')
    .then(() => new NetworkVisualizer(...));
};
```

---

## Accessibility Compliance

### WCAG AA Checklist
- [ ] **Color Contrast**: All text passes 4.5:1 minimum ratio
  ```css
  /* Test: #charcoal on #paper = 9:1 ✓ */
  /* Test: #cyber-green on #noir = 7.2:1 ✓ */
  ```

- [ ] **Focus Indicators**: Visible 2px outline on keyboard nav
  ```css
  :focus-visible {
    outline: 2px solid var(--color-accent-warning);
    outline-offset: 2px;
  }
  ```

- [ ] **Motion**: Respect `prefers-reduced-motion`
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

- [ ] **Keyboard Navigation**: All interactive elements tab-accessible
- [ ] **Screen Reader**: Use ARIA labels for status changes
  ```html
  <div class="connection-badge" aria-live="polite" aria-label="Connection status">
    ● ONLINE
  </div>
  ```

---

## Deployment Checklist

- [ ] Minify CSS/JS for production
- [ ] Generate sourcemaps for debugging
- [ ] Test in Chrome, Firefox, Safari, Edge (last 2 versions)
- [ ] Verify mobile responsiveness (iOS Safari, Chrome Mobile)
- [ ] Set up CDN for static assets (fonts, textures)
- [ ] Configure CORS headers for WebSocket upgrades
- [ ] Load-test with 1000+ concurrent connections
- [ ] Monitor Core Web Vitals (LCP, FID, CLS)

---

**Design System Version:** 1.0  
**Last Updated:** 2026-06-01  
**Maintained By:** UI/UX Engineering Team
