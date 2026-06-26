# GTM Engine - Vercel Frontend Setup

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd /Users/cankarakoc/Desktop/cendra/gtm-frontend
npm install
```

### 2. Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### 3. Run Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

---

## 📁 Project Structure

```
gtm-frontend/
├── app/
│   ├── (auth)/
│   │   └── login/           # Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx       # Dashboard shell + nav
│   │   ├── overview/        # Overview page
│   │   ├── funnel/          # Funnel page
│   │   ├── health/          # Health page
│   │   ├── logs/            # Run Log page
│   │   ├── operators/       # Operators page
│   │   ├── ingest/          # Ingest page
│   │   └── config/          # Configuration page
│   └── api/
│       └── auth/[...nextauth]/   # NextAuth endpoints
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── kpi-card.tsx         # KPI cards
│   ├── stage-health.tsx     # Stage health cards
│   ├── the-engine.tsx       # The Engine component
│   └── charts/              # Chart components
├── lib/
│   ├── api.ts               # API client
│   └── auth.ts              # Auth utilities
└── public/
    └── gtm-design.css       # Design system CSS
```

---

## 🎨 Using the HTML Reference

The HTML reference (`gtm-engine-dashboard.html`) contains all the CSS and component HTML we need.

### Migration Strategy:
1. ✅ Copy CSS from HTML → `public/gtm-design.css`
2. ✅ Extract components → React components in `components/`
3. ✅ Wire to API → Replace mock data with API calls
4. ✅ Add authentication → NextAuth.js

---

## 🔐 Authentication Flow

### Login:
```typescript
// User logs in
POST /api/auth/login
→ Returns JWT token + user data
→ Stores in HTTP-only cookie (auto-sent with requests)
→ Also stores user in localStorage for quick restore

// On page load
useEffect(() => {
  // Restore user from cookie (automatic!)
  const user = await fetch('/api/auth/me')
  setUser(user)
}, [])
```

### Protected Routes:
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')
  if (!token && request.nextUrl.pathname !== '/login') {
    return NextResponse.redirect('/login')
  }
}
```

---

## 📦 Key Dependencies

- `next` - React framework
- `next-auth` - Authentication
- `swr` - Data fetching with auto-refresh
- `recharts` - Charts (or use native SVG from HTML)
- `@radix-ui/react-dialog` - Modals
- `sonner` - Toast notifications
- `react-hook-form` - Forms

---

## 🚢 Deployment

### To Vercel:
```bash
# 1. Push to GitHub
git push origin main

# 2. Import in Vercel dashboard
# https://vercel.com/new

# 3. Set environment variables in Vercel:
NEXT_PUBLIC_API_URL=https://your-api.fly.dev
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-production-secret

# 4. Deploy!
# Vercel auto-deploys on every push
```

---

## 🎯 Next Steps

1. **Copy HTML reference CSS** to `public/gtm-design.css`
2. **Create component library** from HTML markup
3. **Build auth pages** (login/logout)
4. **Create dashboard layout** with navigation
5. **Build each page** (Overview, Funnel, etc.)
6. **Wire to API** endpoints
7. **Test & deploy!**

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [NextAuth.js](https://next-auth.js.org)
- [SWR](https://swr.vercel.app)
- [Vercel Deploy](https://vercel.com/docs)
