# Chad Area - Workflow Automation Platform

![Chad Area](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)

**Chad Area** is a powerful workflow automation platform that allows users to connect their favorite services and create custom automations between them. Think of it as an IFTTT/Zapier alternative with support for Discord, GitHub, Reddit, Spotify, Slack, and more.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Services & Integrations](#-services--integrations)
- [API Documentation](#-api-documentation)
- [Mobile App](#-mobile-app)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Features
- 🔗 **Multi-Service Integration**: Connect Discord, GitHub, Reddit, Spotify, Slack, and Timer services
- ⚡ **Action-Reaction Workflows**: Create powerful automations with triggers and responses
- 🎯 **Visual Workflow Builder**: Intuitive UI for creating and managing workflows
- 🔐 **OAuth Authentication**: Secure OAuth2 flow for all external services
- 🌙 **Dark Mode**: Full dark mode support across the platform

### Supported Triggers (Actions)
- **GitHub**: Repository push events
- **Timer**: Daily schedules, annual dates, future dates
- **Spotify**: New track saved to library
- **Reddit**: New posts in subreddit
- **Slack**: New messages in channels

### Supported Responses (Reactions)
- **Discord**: Send messages, DMs, create channels, manage roles, moderate members
- More services coming soon!

## 🏗 Architecture

The project follows a microservices architecture:

```
chad-area/
├── frontend/              # Next.js frontend (React 19)
├── backend/
│   ├── api/              # Main API service (Fastify)
│   ├── auth/             # Authentication service
│   ├── link/             # OAuth integration service
│   ├── workflow/         # Workflow execution engine
│   └── shared/           # Shared Prisma client
└── docker-compose.yml    # Docker orchestration
```

### Technology Stack

**Frontend:**
- Next.js 16.0.1
- React 19.2.0
- TypeScript 5
- Tailwind CSS 4
- Microsoft MSAL for OAuth

**Backend:**
- Node.js 20
- Fastify 5.6.1
- Prisma ORM 6.18.0
- PostgreSQL 16
- TypeScript 5.9.3

**Infrastructure:**
- Docker & Docker Compose
- PostgreSQL Database
- Redis (for future caching)

## 📦 Prerequisites

- **Docker** and **Docker Compose** (recommended)
- **Node.js** 20+ (if running without Docker)
- **PostgreSQL** 16+ (if running without Docker)
- OAuth credentials for services you want to integrate:
  - Discord: Client ID, Client Secret, Bot Token
  - GitHub: Client ID, Client Secret
  - Reddit: Client ID, Client Secret
  - Spotify: Client ID, Client Secret
  - Slack: Client ID, Client Secret

## 🚀 Installation

### Using Docker (Recommended)

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/chad-area.git
cd chad-area
```

2. **Create environment file:**
```bash
cp .env.example .env
```

3. **Configure environment variables** (see [Configuration](#-configuration))

4. **Start all services:**
```bash
docker-compose up -d
```

5. **Access the application:**
- Frontend: http://localhost:8081
- API: http://localhost:8080
- Auth Service: http://localhost:8082
- Link Service: http://localhost:8084
- Workflow Service: http://localhost:8083

### Without Docker

1. **Clone and install dependencies:**
```bash
git clone https://github.com/yourusername/chad-area.git
cd chad-area

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend/api && npm install
cd ../auth && npm install
cd ../link && npm install
cd ../workflow && npm install
```

2. **Setup PostgreSQL database:**
```bash
createdb chad_area
```

3. **Configure environment variables** in each service

4. **Run database migrations:**
```bash
cd backend/api
npx prisma migrate deploy
npx prisma generate
npm run seed
```

5. **Start services** (in separate terminals):
```bash
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - API
cd backend/api && npm run dev

# Terminal 3 - Auth
cd backend/auth && npm run dev

# Terminal 4 - Link
cd backend/link && npm run dev

# Terminal 5 - Workflow
cd backend/workflow && npm run dev
```

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://db_user:db_password@localhost:5432/db_name
DB_USER=db_user
DB_PASSWORD=db_password
DB_NAME=db_name

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this

# API Keys
AUTH_KEY=your-auth-service-key-change-this

# URLs
BASE_URL=http://localhost:8084
SLACK_BASE_URL=http://localhost:8084
REDIRECT_URL=http://localhost:8081/user
WORKFLOW_URL=http://workflow:8083

# Discord OAuth
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
DISCORD_BOT_TOKEN=your-discord-bot-token

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Reddit OAuth
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret

# Spotify OAuth
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret

# Slack OAuth
SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret

# Microsoft OAuth (optional)
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your-microsoft-client-id
```

### Getting OAuth Credentials

#### Discord
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Get Client ID and Client Secret from OAuth2 section
4. Create a bot and get Bot Token
5. Add redirect URL: `http://localhost:8084/oauth/discord/callback`

#### GitHub
1. Go to [GitHub Settings → Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Create a new OAuth App
3. Add callback URL: `http://localhost:8084/oauth/github/callback`

#### Reddit
1. Go to [Reddit Apps](https://www.reddit.com/prefs/apps)
2. Create a new app (type: web app)
3. Set redirect URI: `http://localhost:8084/oauth/reddit/callback`

#### Spotify
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create an app
3. Add redirect URI: `http://127.0.0.1:8084/oauth/spotify/callback`

#### Slack
1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Create a new app
3. Configure OAuth scopes and redirect URL: `http://localhost:8084/oauth/slack/callback`

## 🎮 Usage

### Creating Your First Workflow

1. **Sign up** at http://localhost:8081/register
2. **Login** to your account
3. **Connect services** in the Integrations page
4. **Create workflow:**
   - Click "Create Workflow"
   - Choose a trigger (Action): e.g., "GitHub Push"
   - Configure trigger settings
   - Choose a response (Reaction): e.g., "Send Discord Message"
   - Configure response settings
   - Save your workflow

### Example Workflows

**GitHub to Discord Notification:**
- **Trigger**: GitHub Push (repository: owner/repo)
- **Response**: Discord Message (channel, message)

**Daily Reminder:**
- **Trigger**: Timer Daily (time: 09:00)
- **Response**: Discord DM (user, message)

**Spotify to Discord:**
- **Trigger**: Spotify Track Saved
- **Response**: Discord Message (share your new favorite)

## 🔌 Services & Integrations

### GitHub Integration
- **Actions**: Repository push events
- **Configuration**: Repository owner and name
- **Webhook**: Automatically created on workflow creation

### Discord Integration
- **Reactions**: 
  - Send channel messages
  - Send DMs
  - Create channels
  - Add/remove roles
  - Moderate members (kick/ban)
  - Manage messages (edit/delete/react)
- **Configuration**: Bot must be invited to server

### Timer Service
- **Daily**: Trigger at specific time every day (HH:MM)
- **Annual**: Trigger on specific date every year (DD/MM)
- **Future Date**: Trigger once after X days
- **No OAuth**: Always available

### Spotify Integration
- **Actions**: New track saved to library
- **Polling**: Checks every 2 minutes
- **OAuth**: Required

### Reddit Integration
- **Actions**: New post in subreddit
- **Configuration**: Subreddit name (without r/)
- **Polling**: Checks every 2 minutes

### Slack Integration
- **Actions**: New message in channel
- **Configuration**: Channel ID
- **Polling**: Checks every 1 minute

## 🛠 API Documentation

### Main API Endpoints

**Authentication:**
```
POST /signup - Register new user
POST /login - Login user
POST /microsoft/auth - Microsoft OAuth login
```

**Users:**
```
GET /user/me - Get current user
PUT /user/me - Update current user
```

**Workflows:**
```
GET /workflow - Get all workflows
POST /workflow - Create workflow
GET /workflow/:id - Get workflow by ID
DELETE /workflow/:id - Delete workflow
```

**Services:**
```
GET /services - Get all services with actions/reactions
GET /services/:name - Get specific service
```

**Integrations:**
```
GET /connections - Get user's connected services
GET /connections/:serviceName - Get specific connection
DELETE /connections/:serviceName - Disconnect service
GET /oauth/:service - Get OAuth URL
GET /oauth/:service/callback - OAuth callback
```

### Response Format

Success:
```json
{
  "data": { ... }
}
```

Error:
```json
{
  "error": "Error message",
  "context": "Additional context"
}
```

## 🧪 Development

### Running Tests
```bash
npm test
```

### Database Migrations

Create a new migration:
```bash
cd backend/api
npx prisma migrate dev --name migration_name
```

Apply migrations:
```bash
npx prisma migrate deploy
```

Reset database (development only):
```bash
npx prisma migrate reset
```

### Code Style

The project uses TypeScript with strict mode enabled. Follow these guidelines:
- Use TypeScript for all new code
- Follow existing code structure and naming conventions
- Add proper error handling
- Log important actions to the database

### Project Structure

```
frontend/src/
├── app/                 # Next.js app directory
│   ├── (auth)/         # Authentication pages
│   ├── user/           # User dashboard
│   └── ...
├── components/          # Reusable React components
├── contexts/           # React contexts (Auth, Theme)
├── services/           # API service classes
└── utils/              # Utility functions

backend/
├── api/
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── services/      # Business logic
│   │   ├── middlewares/   # Auth, validation
│   │   └── webhook/       # Webhook handlers
│   └── prisma/           # Database schema & migrations
├── auth/                 # Authentication microservice
├── link/                 # OAuth integration service
├── workflow/             # Workflow execution engine
└── shared/               # Shared Prisma client
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Contribution Guidelines
- Write clear commit messages
- Add tests for new features
- Update documentation
- Follow the existing code style
- Test thoroughly before submitting

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Backend powered by [Fastify](https://www.fastify.io/)
- Database managed by [Prisma](https://www.prisma.io/)
- OAuth integrations with Discord, GitHub, Reddit, Spotify, and Slack

## 📧 Support

For support, email support@chadarea.com or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Add more service integrations (Twitter, Google, etc.)
- [ ] Implement workflow templates
- [ ] Add workflow scheduling options
- [ ] Implement webhook testing UI
- [ ] Add workflow analytics dashboard
- [ ] Support for conditional logic in workflows
- [ ] Multi-step workflows (chains of actions)
- [ ] Team collaboration features
- [ ] iOS mobile app

---

Made with ❤️ by the Chad Area Team
