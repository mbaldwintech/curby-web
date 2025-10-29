# Curby Web

A modern web application for community-driven sharing of free items. Curby connects neighbors and local businesses to reduce waste and build stronger communities by making it easy to give away and find free items.

## 🌟 Features

- **Community Marketplace**: Browse and post free items in your neighborhood
- **User Authentication**: Secure sign-up, login, and profile management
- **Moderation System**: Community-driven reporting and moderation tools
- **Curby Coins**: Reward system for positive community participation
- **Admin Dashboard**: Comprehensive management tools for administrators
- **Mobile Responsive**: Optimized for all devices
- **Real-time Notifications**: Stay updated on item activity
- **Business Profiles**: Special features for local businesses

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **State Management**: Redux Toolkit
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React & Tabler Icons

## 📋 Prerequisites

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun
- Supabase account and project

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/mbaldwintech/curby-web.git
   cd curby-web
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**

   Copy the example environment file and configure your variables:

   ```bash
   cp .env.example .env.local
   ```

   See the [Environment Variables](#-environment-variables) section below for required configuration.

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Application Configuration
NEXT_PUBLIC_APP_VERSION=0.1.0
```

### How to Get Supabase Credentials

1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings → API
3. Copy your Project URL and anon/public key
4. The anon key is safe to use in client-side code

### Optional Variables

```env
# Development
PORT=3000
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/          # Public pages (landing, legal)
│   ├── admin/             # Admin panel and authentication
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── core/                  # Business logic and app-specific code
│   ├── components/        # Feature-specific components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services and business logic
│   ├── slices/           # Redux slices
│   └── types/            # Core TypeScript types
├── store/                 # Redux store configuration
└── supa/                  # Supabase integration
    ├── hooks/            # Supabase-specific hooks
    ├── providers/        # Auth and other providers
    └── services/         # Database services
```

## 🏗️ Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🚀 Deployment

### Deploy on Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Other Platforms

This is a standard Next.js application and can be deployed on any platform that supports Node.js:

- Netlify
- Railway
- Render
- DigitalOcean App Platform

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Create an [issue](https://github.com/mbaldwintech/curby-web/issues) for bug reports or feature requests
- Check our [documentation](https://github.com/mbaldwintech/curby-web/wiki) for more details

## 🏆 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [Radix UI](https://radix-ui.com)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Database and auth by [Supabase](https://supabase.com)
- Icons by [Lucide](https://lucide.dev) and [Tabler Icons](https://tabler.io/icons)
