# Alignbox Chat Application

A fullstack chat application built with HTML, CSS, JavaScript, Node.js, and PostgreSQL. Features real-time messaging, anonymous chat mode, and user authentication.

## How to Test the app
If you want to test with existing users, the seed data created these test accounts:
- Email: john@example.com, Password: password123
- Email: jane@example.com, Password: password123
- Email: bob@example.com, Password: password123

## Features

- 🔐 User authentication (Login/Register)
- 💬 Real-time messaging with Socket.IO
- 🎭 Anonymous chat mode
- 📱 Mobile-responsive design
- 🎨 Modern UI matching the provided design
- 🔄 Group-based chat system
- 📊 Message history and pagination
- 🗄️ PostgreSQL database with Prisma ORM

## Tech Stack

### Frontend
- HTML5
- CSS3 (with Tailwind CSS)
- Vanilla JavaScript
- Socket.IO Client

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- Socket.IO
- JWT Authentication
- bcryptjs for password hashing

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd chat-web-app-alignbox-assignment
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a database named `chat_app`
3. Update the `.env` file in the backend directory:
```env
PORT=8000
API_VERSION=1.0.0
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/chat_app
JWT_SECRET=your_jwt_secret_key_here
```

#### Option B: Remote PostgreSQL Hosting (Recommended)

Here are some popular remote PostgreSQL hosting services:

##### 1. **Supabase** (Recommended)
- **URL**: https://supabase.com/
- **Features**: PostgreSQL, real-time subscriptions, authentication
- **Free Tier**: 500MB database, 2GB bandwidth, 50MB file storage
- **Setup**: 
  1. Sign up at Supabase
  2. Create a new project
  3. Get connection details from Settings > Database
  4. Update your `.env` file with the provided DATABASE_URL

##### 2. **Neon** (Recommended)
- **URL**: https://neon.tech/
- **Features**: Serverless PostgreSQL, branching, automatic scaling
- **Free Tier**: 3GB storage, 10GB transfer/month
- **Setup**: 
  1. Sign up at Neon
  2. Create a new project
  3. Get connection details from the dashboard
  4. Update your `.env` file with the provided DATABASE_URL

##### 3. **Railway**
- **URL**: https://railway.app/
- **Features**: Easy deployment, PostgreSQL addon available
- **Free Tier**: $5 credit monthly
- **Setup**: 
  1. Sign up at Railway
  2. Create a new project
  3. Add PostgreSQL service
  4. Get connection details

##### 4. **PlanetScale**
- **URL**: https://planetscale.com/
- **Features**: Serverless MySQL, branching, automatic scaling
- **Free Tier**: 1 database, 1 billion reads/month, 1 million writes/month
- **Note**: Uses MySQL, but Prisma can work with it

##### 5. **Aiven**
- **URL**: https://aiven.io/
- **Features**: Managed PostgreSQL, high availability
- **Free Tier**: 1 month trial
- **Setup**: 
  1. Sign up at Aiven
  2. Create PostgreSQL service
  3. Get connection details

### 4. Environment Configuration
Create a `.env` file in the backend directory:
```env
PORT=8000
API_VERSION=1.0.0
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your_jwt_secret_key_here
```

### 5. Database Migration and Seeding
```bash
cd backend
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or run migrations (for production)
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

### 6. Start the Backend Server
```bash
cd backend
npm run dev
```

The server will start on `http://localhost:8000`

### 7. Frontend Setup
```bash
cd frontend
# Open index.html in a web browser or use a local server
# For example, using Python:
python -m http.server 3000
```

Or simply open `frontend/index.html` in your browser.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Chat
- `POST /api/chat/groups` - Create a new group
- `GET /api/chat/groups` - Get user's groups
- `POST /api/chat/groups/:groupId/join` - Join a group
- `POST /api/chat/messages` - Send a message
- `GET /api/chat/groups/:groupId/messages` - Get group messages
- `PUT /api/chat/anonymous-mode` - Toggle anonymous mode

## Database Schema

The application uses Prisma ORM with the following models:

- **User**: User accounts and authentication
- **Group**: Chat groups
- **GroupMember**: Group membership (many-to-many relationship)
- **Message**: Chat messages

## Prisma Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database (development)
npm run db:push

# Create and run migrations (production)
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database with sample data
npm run db:seed
```

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Join Group**: The app automatically joins a default group for demo purposes
3. **Send Messages**: Type messages in the input field and press Enter or click send
4. **Anonymous Mode**: Toggle the incognito button to send anonymous messages
5. **Real-time Updates**: Messages appear instantly for all connected users

## Project Structure

```
chat-web-app-alignbox-assignment/
├── backend/
│   ├── constants/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── index.ts
│   └── package.json
├── frontend/
│   ├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
```

## Development Notes

- The application uses Socket.IO for real-time communication
- JWT tokens are used for authentication
- Passwords are hashed using bcryptjs
- The frontend is built with vanilla JavaScript (no frameworks)
- Tailwind CSS is used for styling
- The design matches the provided mobile chat interface

## Troubleshooting

### Common Issues

1. **Database Connection Error**: Ensure PostgreSQL is running and DATABASE_URL is correct
2. **Prisma Client Error**: Run `npm run db:generate` to generate the Prisma client
3. **CORS Error**: Check that the frontend URL is included in CORS_ORIGINS
4. **Socket Connection Failed**: Verify the backend server is running on the correct port
5. **Authentication Issues**: Check JWT_SECRET is set in environment variables

### Recommended Remote PostgreSQL Setup

For the best experience, I recommend using **Supabase** or **Neon** as they provide:
- Serverless PostgreSQL (no connection limits)
- Automatic scaling
- Easy branching for development
- Generous free tiers
- Simple setup process
- Built-in connection pooling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
