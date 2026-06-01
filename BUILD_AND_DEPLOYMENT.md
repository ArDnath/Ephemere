# Ephemere UI – Build & Deployment Guide

## 📦 Project Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Git
- Modern browser with WebGL support

### Installation
```bash
cd ephemere
npm install
```

### Project Structure
```
ephemere/
├── public/
│   ├── index.html
│   ├── styles/
│   │   ├── system.css        # CSS custom properties
│   │   ├── layout.css        # Grid & flex
│   │   ├── components.css    # UI components
│   │   └── animations.css    # Motion logic
│   ├── js/
│   │   ├── app.js            # Main controller
│   │   ├── messages.js       # Message logic
│   │   ├── socket-handler.js # WebSocket
│   │   ├── network-viz.js    # 3D topology
│   │   └── ui-state.js       # State management
│   └── assets/
│       ├── fonts/            # WOFF2 files
│       ├── textures/         # SVG/PNG textures
│       └── icons/            # SVG icon set
├── dist/                      # Build output
├── package.json
└── webpack.config.js
```

---

## 🔨 Build Configuration

### package.json
```json
{
  "name": "ephemere-ui",
  "version": "1.0.0",
  "description": "Retro-futuristic distributed chat interface",
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production",
    "lint": "eslint src/js --fix",
    "test": "jest",
    "analyze": "webpack-bundle-analyzer dist/stats.json"
  },
  "dependencies": {
    "three": "^128.0.0",
    "ws": "^8.13.0"
  },
  "devDependencies": {
    "webpack": "^5.88.0",
    "webpack-cli": "^5.1.0",
    "webpack-dev-server": "^4.15.0",
    "mini-css-extract-plugin": "^2.7.6",
    "css-loader": "^6.8.1",
    "style-loader": "^3.3.3",
    "terser-webpack-plugin": "^5.3.9",
    "cssnano": "^5.1.15",
    "@babel/core": "^7.23.3",
    "@babel/preset-env": "^7.23.3",
    "babel-loader": "^9.1.3"
  }
}
```

### webpack.config.js
```javascript
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './public/js/app.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      chunkFilename: isProduction ? '[name].[contenthash].js' : '[name].js',
      clean: true,
    },

    mode: argv.mode || 'development',
    devtool: isProduction ? 'source-map' : 'eval-source-map',

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
          ],
        },
        {
          test: /\.(woff2|woff|ttf|eot)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash][ext]',
          },
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024, // 8kb
            },
          },
          generator: {
            filename: 'images/[name].[hash][ext]',
          },
        },
      ],
    },

    plugins: [
      new MiniCssExtractPlugin({
        filename: isProduction ? '[name].[contenthash].css' : '[name].css',
      }),
    ],

    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            compress: {
              drop_console: isProduction,
            },
          },
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
          },
          three: {
            test: /[\\/]node_modules[\\/]three[\\/]/,
            name: 'three',
            priority: 20,
          },
        },
      },
      runtimeChunk: 'single',
    },

    devServer: {
      port: 8080,
      hot: true,
      compress: true,
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },

    performance: {
      maxEntrypointSize: 250000,
      maxAssetSize: 250000,
      hints: isProduction ? 'warning' : false,
    },

    resolve: {
      extensions: ['.js', '.css'],
      alias: {
        '@': path.resolve(__dirname, 'public'),
      },
    },
  };
};
```

---

## 🚀 Build & Deployment

### Development Server
```bash
npm run dev
# Runs on http://localhost:8080
# Auto-reload on file changes
```

### Production Build
```bash
npm run build
# Outputs to dist/
# - app.js (main bundle)
# - vendors.js (node_modules)
# - three.js (Three.js chunk)
# - styles.css (minified CSS)
```

### Build Output Analysis
```bash
npm run analyze
# Opens bundle size report
# Helps identify optimization opportunities
```

### Size Targets
```
✓ app.js:      35KB (minified + gzipped)
✓ vendors.js:  40KB (minified + gzipped)
✓ three.js:    15KB (minified + gzipped)
✓ styles.css:  8KB  (minified + gzipped)
─────────────────────────────────────
  Total:       98KB (production ready)
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for Serverless)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Configuration (vercel.json)
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "SOCKET_URL": "@socket_url_production"
  }
}
```

### Option 2: AWS S3 + CloudFront
```bash
# Build
npm run build

# Deploy to S3
aws s3 sync dist/ s3://ephemere-ui-prod/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1234ABCD \
  --paths "/*"
```

### Option 3: Docker Container
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build & push
docker build -t ephemere-ui:1.0.0 .
docker tag ephemere-ui:1.0.0 your-registry/ephemere-ui:latest
docker push your-registry/ephemere-ui:latest
```

### Option 4: Nginx Static Server
```nginx
# nginx.conf
server {
  listen 80;
  server_name ephemere.example.com;

  root /var/www/ephemere/dist;
  index index.html;

  # Gzip compression
  gzip on;
  gzip_types text/plain text/css application/json application/javascript;
  gzip_min_length 1000;

  # Cache policy
  location ~* \.(js|css|png|jpg|svg|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  location / {
    try_files $uri $uri/ /index.html;
    add_header Cache-Control "no-cache";
  }

  # Security headers
  add_header X-Content-Type-Options "nosniff";
  add_header X-Frame-Options "SAMEORIGIN";
  add_header X-XSS-Protection "1; mode=block";
}
```

---

## 🔐 Security & CORS Configuration

### Server-Side (Node.js Express)
```javascript
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const app = express();

// CORS for REST API
app.use(cors({
  origin: ['https://ephemere.example.com', 'https://app.ephemere.example.com'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// WebSocket upgrade
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ 
  server,
  // Verify origin on upgrade
  verifyClient: (info, cb) => {
    const origin = info.req.headers.origin;
    const allowedOrigins = ['https://ephemere.example.com'];
    if (allowedOrigins.includes(origin)) {
      cb(true);
    } else {
      cb(false, 403, 'Forbidden');
    }
  }
});

wss.on('connection', (ws) => {
  // Socket handlers...
});

server.listen(3000);
```

### Client-Side (WebSocket)
```javascript
// Use wss:// (WebSocket Secure) in production
const socketUrl = process.env.SOCKET_URL || 'wss://api.ephemere.example.com';

const socket = new WebSocket(socketUrl, {
  // Send credentials for authenticated WebSocket
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
});
```

---

## 📊 Performance Monitoring

### Web Vitals Tracking
```javascript
// In app.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);    // Cumulative Layout Shift
getFID(console.log);    // First Input Delay
getFCP(console.log);    // First Contentful Paint
getLCP(console.log);    // Largest Contentful Paint
getTTFB(console.log);   // Time to First Byte

// Send to analytics
const sendAnalytics = (metric) => {
  navigator.sendBeacon('/analytics', JSON.stringify(metric));
};

getCLS(sendAnalytics);
```

### Performance Budgets
```javascript
// webpack performance config
performance: {
  maxEntrypointSize: 250000,   // 250KB
  maxAssetSize: 250000,        // 250KB
  hints: 'warning'
}
```

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [ ] Run linter: `npm run lint`
- [ ] Fix formatting: `npm run format`
- [ ] Run tests: `npm run test`
- [ ] Check TypeScript: `npx tsc --noEmit` (if using TS)
- [ ] Security scan: `npm audit` / `npm audit fix`

### Performance
- [ ] Build size < 250KB: `npm run build && du -sh dist`
- [ ] Lighthouse score > 90: Use DevTools Lighthouse
- [ ] Load time < 3s on 4G: Use Chrome throttling
- [ ] 60 FPS animations: Use DevTools Performance tab

### Browser Compatibility
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari 14+
- [ ] Edge (latest 2 versions)
- [ ] Mobile Safari (iOS 14+)
- [ ] Chrome Mobile

### Accessibility
- [ ] WCAG AA compliance: axe DevTools scan
- [ ] Keyboard navigation: Tab through all elements
- [ ] Screen reader: NVDA / VoiceOver test
- [ ] Color contrast: Ensure 4.5:1+ ratio

### Security
- [ ] CSP headers configured
- [ ] No console errors/warnings
- [ ] No hardcoded secrets
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Input sanitization working

### Monitoring & Analytics
- [ ] Sentry/error tracking configured
- [ ] Analytics pixel implemented
- [ ] Performance monitoring active
- [ ] Uptime monitoring enabled
- [ ] Log aggregation set up

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Recommended)
```yaml
# .github/workflows/deploy.yml
name: Build & Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm run test
      
      - name: Build
        run: npm run build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: matrix.node-version == '18'
      
      - name: Deploy to Vercel
        if: github.ref == 'refs/heads/main'
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: vercel --prod --token $VERCEL_TOKEN
```

---

## 🐛 Debugging in Production

### Source Maps
```javascript
// webpack.config.js
devtool: process.env.NODE_ENV === 'production' 
  ? 'source-map'  // Full sourcemaps (gzipped)
  : 'eval-source-map'
```

### Error Tracking (Sentry)
```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter out noisy errors
    if (event.exception) {
      const error = event.exception.values[0];
      if (error.value.includes('404')) return null; // Ignore 404s
    }
    return event;
  }
});
```

### Browser Console Logging
```javascript
// Disable console in production (optional)
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.warn = () => {};
}

// Keep console.error and console.table for debugging
```

---

## 📈 Scaling & Performance

### Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 100 https://ephemere.example.com

# Using Artillery.io
npm install -g artillery
artillery quick --count 100 --num 1000 https://ephemere.example.com
```

### Content Delivery Optimization
```javascript
// Preload critical resources
<link rel="preload" href="/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/styles.css" as="style">

// Prefetch likely next resources
<link rel="prefetch" href="/three.js" as="script">
```

### Database Query Caching
```javascript
// Cache channel list for 5 minutes
const channelCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

async function getChannels() {
  if (channelCache.has('channels')) {
    return channelCache.get('channels');
  }
  
  const channels = await fetchChannelsFromDB();
  channelCache.set('channels', channels);
  setTimeout(() => channelCache.delete('channels'), CACHE_TTL);
  return channels;
}
```

---

## 🎓 Deployment Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build

# Check for errors
npm run lint
```

### WebSocket Connection Issues
- Verify `wss://` is used in production
- Check CORS headers in server response
- Verify origin in `Access-Control-Allow-Origin`
- Test with: `websocat wss://your-server.com/socket`

### Performance Degradation
```bash
# Analyze bundle
npm run analyze

# Check what's new
git diff dist/

# Profile in DevTools
# 1. Open Chrome DevTools → Performance
# 2. Record page load
# 3. Analyze CPU/memory usage
```

### White Screen / 404s
- Check browser console for JS errors
- Verify all assets deployed to correct paths
- Check `index.html` is served on 404 (SPA routing)
- Verify font files are loadable (CORS headers)

---

**Deployment Status:** Ready for Production  
**Last Updated:** 2026-06-01  
**Version:** 1.0.0
