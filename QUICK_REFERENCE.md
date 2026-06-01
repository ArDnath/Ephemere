# Ephemere UI – Quick Reference Guide

## 📋 Files Overview

| File | Purpose |
|------|---------|
| `ephemere-ui-prototype.html` | Interactive prototype – **Start here** |
| `UI_DESIGN_SPEC.md` | Complete design system documentation |
| `IMPLEMENTATION_GUIDE.md` | Code integration patterns & best practices |
| `components-system.css` | Production CSS library (all components) |
| `QUICK_REFERENCE.md` | This file – cheat sheet for developers |

---

## 🎨 Design System Quick Links

### Colors (CSS Variables)
```css
--color-primary-bg: #f5f0eb;        /* Warm paper base */
--color-secondary-bg: #1a1a1a;      /* Dark noir */
--color-accent-green: #00e676;      /* Online/Active */
--color-accent-amber: #ffd700;      /* Alert/Metadata */
--color-accent-red: #d62839;        /* Error/Offline */
```

### Typography
```css
.type-header-1         /* 24px bold serif – Channel titles */
.type-body-default     /* 14px sans – Chat messages */
.type-mono-small       /* 11px monospace – Timestamps */
.type-script           /* Playful script – "typing..." */
```

### Components
```css
.message-bubble        /* Chat message container */
.badge-connection      /* Status indicator (online/offline/latency) */
.channel-item          /* Channel list item */
.btn-primary           /* Primary action button */
.input-field           /* Text input */
.panel                 /* Card container */
```

---

## 🔧 JavaScript Integration

### Basic WebSocket Integration
```javascript
const socket = new SocketHandler({ 
  url: 'ws://your-server.com/socket' 
});
socket.connect();

// Send message
socket.sendMessage("Hello", { channel: "general" });

// Listen to events
socket.on('message', (msg) => {
  renderMessage(msg);
});
```

### Add Message to UI
```javascript
const messageEl = document.createElement('div');
messageEl.className = 'message own';
const bubble = document.createElement('div');
bubble.className = 'message-bubble';
bubble.innerHTML = `
  <div class="message-content">Your message</div>
  <div class="message-metadata">You • 14:32 • 42ms</div>
`;
messageEl.appendChild(bubble);
document.getElementById('messageThread').appendChild(messageEl);
```

### Socket State Visualization
```javascript
// Update connection badge
function updateStatus(state) {
  const badge = document.getElementById('statusBadge');
  const states = {
    'online': { text: '● ONLINE', class: '' },
    'latency': { text: '⚠ LATENCY', class: 'unstable' },
    'offline': { text: '✕ OFFLINE', class: 'offline' }
  };
  const s = states[state];
  badge.textContent = s.text;
  badge.className = 'badge-connection ' + s.class;
}
```

---

## 🎯 Component Recipes

### Message Bubble with Intentional Imperfection
```html
<div class="message own">
  <div class="message-bubble corner-imperfect-md shadow-medium">
    <div class="message-content">This feels handwritten</div>
    <div class="message-metadata">You • 14:32 • 45.2ms</div>
  </div>
</div>
```

### Channel List
```html
<div class="channel-explorer">
  <div class="explorer-header type-header-2">Servers</div>
  <div class="channel-item active">#general</div>
  <div class="channel-item">#random</div>
  <div class="channel-item">#tech</div>
</div>
```

### Connection Badge
```html
<!-- Online -->
<div class="badge-connection">● ONLINE</div>

<!-- Unstable (pulsing) -->
<div class="badge-connection unstable">⚠ LATENCY</div>

<!-- Offline -->
<div class="badge-connection offline">✕ OFFLINE</div>
```

### Message Input
```html
<div class="message-input-area">
  <textarea class="textarea-field" placeholder="Type a message..."></textarea>
  <button class="btn btn-primary">SEND</button>
</div>
```

---

## 🎬 Animation Examples

### Message Arrival
```css
.message {
  animation: slideInUp 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Socket Sending (Compression Effect)
```css
.message.sending {
  animation: socketSend 500ms ease-out;
}

@keyframes socketSend {
  0%, 100% { opacity: 1; transform: scaleX(1); }
  50% { opacity: 0.75; transform: scaleX(0.97); }
}
```

### Connection Unstable (Wobble)
```css
.badge-connection.unstable {
  animation: wobble 200ms infinite;
}

@keyframes wobble {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}
```

---

## 🔗 3D Network Topology (Three.js)

### Basic Setup
```javascript
import * as THREE from 'three';

const container = document.querySelector('.network-3d-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 
  container.clientWidth / container.clientHeight);
const renderer = new THREE.WebGLRenderer({ alpha: true });

// Create nodes (spheres with accent colors)
const nodeGeo = new THREE.SphereGeometry(0.3, 32, 32);
const nodeMat = new THREE.MeshStandardMaterial({
  color: 0x00e676,
  emissive: 0x00e676,
  emissiveIntensity: 0.3
});
const node = new THREE.Mesh(nodeGeo, nodeMat);
scene.add(node);

// Animate
function animate() {
  requestAnimationFrame(animate);
  node.rotation.x += 0.002;
  node.rotation.y += 0.003;
  renderer.render(scene, camera);
}
animate();
```

### Handle Node Clicks
```javascript
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

container.addEventListener('click', (event) => {
  mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / container.clientHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  
  if (intersects.length > 0) {
    const nodeId = intersects[0].object.userData.id;
    console.log('Clicked node:', nodeId);
    // Switch channel/cluster
  }
});
```

---

## ⚙️ Configuration

### Socket Configuration
```javascript
{
  url: 'ws://localhost:8080',
  reconnectAttempts: 5,
  reconnectDelay: 1000,
  messageQueueSize: 1000,
  heartbeatInterval: 30000
}
```

### UI Configuration
```javascript
{
  animationDuration: 200,
  messageFadeOut: 5000,
  maxVisibleMessages: 500,
  virtualScrolling: true,
  textureOverlayOpacity: 0.015
}
```

---

## 📊 Performance Tips

1. **Use CSS transforms** for animations (GPU-accelerated)
2. **Lazy-load 3D scene** – don't init Three.js until needed
3. **Virtual scroll** – for threads with 500+ messages
4. **Batch DOM updates** – use `documentFragment`
5. **Debounce metrics** – update every 200ms minimum
6. **Compress assets** – WOFF2 fonts, optimized SVGs

### Virtual Scrolling Example
```javascript
class VirtualScroller {
  constructor(container, itemHeight = 80) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.startIdx = 0;
    this.endIdx = Math.ceil(container.clientHeight / itemHeight);
    
    this.container.addEventListener('scroll', () => {
      this.startIdx = Math.floor(this.container.scrollTop / itemHeight);
      this.endIdx = this.startIdx + Math.ceil(container.clientHeight / itemHeight);
      this.render();
    });
  }
  
  render() {
    // Only render visible items
    this.messages
      .slice(this.startIdx, this.endIdx)
      .forEach((msg, i) => this.renderItem(msg, this.startIdx + i));
  }
}
```

---

## 🎨 Dark Mode Support

The design system automatically switches based on system preference:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary-bg: #1a1a1a;
    --color-text-primary: #f5f0eb;
  }
}
```

Or manually toggle:
```javascript
document.documentElement.setAttribute('data-theme', 'dark');
```

CSS:
```css
[data-theme="dark"] {
  --color-primary-bg: #1a1a1a;
}
```

---

## ♿ Accessibility Checklist

- [ ] Color contrast ≥ 4.5:1 for text
- [ ] Focus indicators visible (2px outline)
- [ ] Respect `prefers-reduced-motion`
- [ ] ARIA labels on status badges
- [ ] Keyboard navigation (Tab, Enter)
- [ ] Screen reader support (`aria-live`)

```html
<!-- Example: Accessible badge -->
<div 
  class="badge-connection"
  role="status"
  aria-live="polite"
  aria-label="Connection status: Online"
>
  ● ONLINE
</div>
```

---

## 🚀 Deployment Checklist

- [ ] Minify CSS & JS (`terser`, `csso`)
- [ ] Create sourcemaps for production
- [ ] Optimize images & textures
- [ ] Set up CDN for static assets
- [ ] Configure CORS for WebSocket
- [ ] Load test with 1000+ connections
- [ ] Monitor Core Web Vitals
- [ ] Test in Chrome, Firefox, Safari, Edge

```bash
# Build command example
npm run build:prod

# Output
# - dist/styles.min.css (8KB)
# - dist/app.min.js (35KB)
# - dist/3d-topology.min.js (15KB)
```

---

## 🐛 Debugging Tips

### Check Socket Connection
```javascript
console.log(socket.readyState);
// WebSocket.CONNECTING (0)
// WebSocket.OPEN (1)
// WebSocket.CLOSING (2)
// WebSocket.CLOSED (3)
```

### Inspect Message Queue
```javascript
socket.messageQueue.forEach(msg => {
  console.log('Queued:', msg.content, 'at', msg.timestamp);
});
```

### Test Network Latency
```javascript
const start = performance.now();
socket.sendMessage('ping');
socket.on('pong', () => {
  const latency = performance.now() - start;
  console.log('Latency:', latency.toFixed(2), 'ms');
});
```

### Performance Profiling
```javascript
// Measure animation performance
performance.mark('message-render-start');
renderMessage(msg);
performance.mark('message-render-end');
performance.measure('message-render', 'message-render-start', 'message-render-end');
```

---

## 📚 Resources

- **Design Tokens**: CSS custom properties in `components-system.css`
- **Component Styles**: Pre-built classes (`.message-bubble`, `.badge-connection`, etc.)
- **Interactive Prototype**: Open `ephemere-ui-prototype.html` in browser
- **Full Spec**: Read `UI_DESIGN_SPEC.md` for deep dive
- **Integration**: See `IMPLEMENTATION_GUIDE.md` for code patterns

---

**Last Updated:** 2026-06-01  
**Design System Version:** 1.0  
**Status:** Production Ready ✓
