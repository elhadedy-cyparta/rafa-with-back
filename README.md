# RAFAL E-commerce Website

A modern, responsive e-commerce website for RAFAL electrical appliances built with React, TypeScript, and Tailwind CSS.

## 🌟 Features

- 🛍️ **Complete E-commerce Functionality**
  - Product catalog with categories
  - Shopping cart and checkout process
  - Order management system
  - User authentication

- 📱 **Fully Responsive Design**
  - Mobile-first approach
  - Optimized for all screen sizes
  - Touch-friendly interface

- 🎥 **Dynamic YouTube Integration**
  - Automatic video fetching from @rafalelectric channel
  - Real-time updates when new videos are uploaded
  - Responsive video player with modal view
  - Support for both regular videos and YouTube Shorts

- 📢 **Live Advertisement System**
  - Real-time banner fetching from RAFAL API
  - Automatic refresh every 5 minutes
  - Responsive banner display with smooth transitions
  - Fallback system for offline scenarios

- ❤️ **Enhanced User Experience**
  - Wishlist and product comparison
  - Advanced product filtering
  - Smooth animations and transitions
  - Professional UI/UX design

## 📢 Advertisement API Integration

The website automatically fetches and displays live advertisement banners from the RAFAL API.

### ✨ API Features

- **Real-time Updates**: Banners refresh automatically every 5 minutes
- **Smart Caching**: Reduces API calls while ensuring fresh content
- **Error Handling**: Graceful fallback when API is unavailable
- **Responsive Display**: Banners adapt to all screen sizes
- **Click Tracking**: Monitor banner engagement (ready for analytics)

### 🔧 API Configuration

The advertisement system connects to:
```
GET https://apirafal.cyparta.com/Ads/
```

**Headers Used:**
- `accept: application/json, text/plain, */*`
- `origin: https://rafalelectric.com`
- `sec-fetch-mode: cors`
- And other security headers for CORS compliance

### 📊 Banner Management

- **Priority System**: Banners display based on priority order
- **Date Filtering**: Only shows active banners within date range
- **Image Validation**: Automatic fallback for broken images
- **Cache Management**: 5-minute cache with automatic refresh

## 🎥 YouTube Channel Integration

The website automatically fetches and displays videos from the **RAFAL Electric YouTube channel** (@rafalelectric).

### ✨ Dynamic Features

- **Automatic Updates**: New videos appear on the website within 5 minutes of upload
- **Smart Detection**: Automatically identifies YouTube Shorts vs regular videos
- **Responsive Layout**: Videos display beautifully on all devices
- **Interactive Player**: Modal video player with full YouTube integration
- **Fallback System**: Graceful handling when API is unavailable

### 🔧 Setup YouTube API

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.developers.google.com/)
   - Create a new project or select existing one

2. **Enable YouTube Data API v3**
   - Navigate to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"

3. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

4. **Configure Environment**
   ```bash
   # Create .env file in project root
   VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
   ```

### 📊 API Usage & Costs

- **Free Quota**: 10,000 units per day
- **Cost per Request**: ~1-3 units per video fetch
- **Refresh Rate**: Every 5 minutes (configurable)
- **Fallback**: Mock data when quota exceeded

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rafal-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your YouTube API key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🛠️ Technologies Used

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Build Tool**: Vite for fast development and building
- **Routing**: React Router for navigation
- **Icons**: Lucide React for consistent iconography
- **API Integration**: 
  - YouTube Data API v3 for video content
  - RAFAL Advertisement API for live banners
- **State Management**: React Context API

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ApiBanner.tsx    # Live advertisement banner
│   ├── VideoSection.tsx # YouTube integration component
│   ├── ProductCard.tsx  # Product display component
│   └── ...
├── pages/              # Page components
├── context/            # React context providers
├── services/           # API services
│   ├── adsApi.ts       # Advertisement API integration
│   ├── youtubeApi.ts   # YouTube API integration
│   └── ...
├── utils/              # Utility functions
│   ├── apiHelpers.ts   # API utility functions
│   └── env.ts          # Environment validation
├── types/              # TypeScript type definitions
└── data/               # Static data and mock data
```

## 🎯 Key Components

### ApiBanner Component
- **Live Data Fetching**: Connects to RAFAL Advertisement API
- **Auto-refresh**: Updates every 5 minutes automatically
- **Error Handling**: Graceful fallback with retry mechanism
- **Responsive Design**: Adapts to all screen sizes
- **Click Tracking**: Ready for analytics integration

### Advertisement Service
- **API Integration**: Handles all communication with ads endpoint
- **Data Transformation**: Normalizes API responses to consistent format
- **Cache Management**: Optimizes performance with smart caching
- **Error Recovery**: Robust error handling with fallbacks

### VideoSection Component
- **Dynamic Video Loading**: Fetches latest videos from YouTube
- **Responsive Grid**: Adapts to screen size (1-4 columns)
- **Interactive Modal**: Full-screen video player
- **Auto-refresh**: Updates every 5 minutes
- **Error Handling**: Graceful fallback to mock data

### YouTube Service
- **Channel Detection**: Automatically finds @rafalelectric channel
- **Video Metadata**: Fetches titles, descriptions, thumbnails, view counts
- **Duration Formatting**: Converts ISO 8601 to readable format
- **Smart Caching**: Optimizes API usage

## 🔄 How Auto-Updates Work

### Advertisement Banners
1. **Initial Load**: Fetches active banners from RAFAL API
2. **Periodic Refresh**: Updates every 5 minutes automatically
3. **Cache Strategy**: Uses localStorage with TTL for performance
4. **Error Recovery**: Falls back to cached data if API fails
5. **UI Update**: Seamlessly updates banner content

### YouTube Videos
1. **Initial Load**: Fetches latest 12 videos from @rafalelectric
2. **Periodic Refresh**: Updates every 5 minutes automatically
3. **New Video Detection**: Compares with previous fetch
4. **UI Update**: Seamlessly updates the video grid
5. **Error Recovery**: Falls back to cached/mock data if API fails

## 🎨 Design Features

- **Modern UI**: Clean, professional design with smooth animations
- **Brand Consistency**: RAFAL brand colors and styling throughout
- **Accessibility**: Keyboard navigation and screen reader support
- **Performance**: Optimized images and lazy loading
- **Mobile-First**: Responsive design for all devices

## 📈 Performance Optimizations

- **Image Optimization**: WebP format with fallbacks
- **Lazy Loading**: Videos and images load on demand
- **API Caching**: Reduces unnecessary API calls
- **Bundle Splitting**: Code splitting for faster initial load
- **CDN Ready**: Optimized for content delivery networks

## 🔒 Security & Privacy

- **API Key Protection**: Environment variables for sensitive data
- **CORS Handling**: Proper cross-origin request handling
- **Data Validation**: Input sanitization and validation
- **Privacy Compliance**: Respects user privacy preferences

## 🚀 Deployment

The website is optimized for deployment on:
- **Netlify** (recommended)
- **Vercel**
- **GitHub Pages**
- **Any static hosting service**

### Deployment Steps

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Set environment variables** in your hosting platform
   ```
   VITE_YOUTUBE_API_KEY=your_api_key
   ```

3. **Deploy the `dist` folder**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software owned by **RAFAL/New Way Electric Company**.

## 📞 Support

For technical support or questions:
- **Email**: support@rafal.com
- **Phone**: 19265
- **YouTube**: [@rafalelectric](https://www.youtube.com/@rafalelectric)

---

**Built with ❤️ for RAFAL Electric**