# KickChat Analytics

A fullstack JavaScript application for comprehensive Kick.com chat monitoring, analytics, and message management.

## Features

- Real-time chat tracking via WebSockets
- Message moderation and content filtering
- User analytics and statistics
- Data storage and export capabilities
- Channel management
- Keyword notifications with sound alerts

## Tech Stack

- **Frontend:** React with TypeScript
- **Backend:** Node.js/Express
- **Database:** PostgreSQL 
- **ORM:** Drizzle
- **API:** RESTful endpoints + WebSockets
- **UI:** ShadCN components with Tailwind CSS

## Setup and Installation

### Prerequisites

- Node.js 16+ and npm
- PostgreSQL database

### Installation Steps

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file with your database credentials and API keys:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   ```

5. Set up the database schema:
   ```bash
   node scripts/db-push.js
   ```

6. Verify the database connection:
   ```bash
   node scripts/db-check.js
   ```

7. (Optional) Generate test data:
   ```bash
   node scripts/generate-test-data.js
   ```

8. Start the development server:
   ```bash
   npm run dev
   ```

9. Access the application in your browser at `http://localhost:5000`

## Local Development

- The frontend uses Vite for fast development
- The backend server automatically restarts on changes
- Database schema changes require re-running the migration script

## Moderation Features

The application includes comprehensive moderation tools:

- Flag inappropriate messages for review
- Hide messages from view
- Create content filters for automatic moderation
- Replace keywords with alternative text
- Search through message history

## API Endpoints

The application provides a range of API endpoints for interaction:

- `/api/channels` - Channel management
- `/api/messages` - Message retrieval and search
- `/api/messages/moderate` - Moderation actions
- `/api/messages/flagged` - Flagged message retrieval
- `/api/filters` - Content filter management

## WebSocket Integration

Real-time chat tracking is implemented via WebSockets. The application connects to the Kick.com chat API and processes messages through the configured content filters.

## Environment Variables

The application uses the following environment variables:

```
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Application Settings
PORT=5000
NODE_ENV=development

# Kick.com API Settings (replace with your actual API credentials)
KICK_API_KEY=your_kick_api_key
KICK_API_SECRET=your_kick_api_secret

# Session Secret for Express
SESSION_SECRET=your_session_secret_change_this_in_production

# Logging Settings
LOG_LEVEL=info

# Content Filter Settings
ENABLE_CONTENT_FILTER=true
FILTER_SENSITIVITY=medium
```

## Troubleshooting

If you encounter database connection issues:
1. Verify your PostgreSQL service is running
2. Check your database credentials in the .env file
3. Run `node scripts/db-check.js` to diagnose connection problems

## License

MIT