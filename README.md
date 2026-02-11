# Time2Play
Game session tracker that allows users to monitor their playtime and gaming habits.

Requirements:

- Node.js v18+
- Docker Desktop
- VS Code (recommended)
- Live Server extension

To run this project:

1. Start the database:
docker compose up -d

2. Install backend dependencies:
cd backend
npm install

3. Push the database schema (first time only):
npx drizzle-kit push

4. Start the backend server:
npm run dev

5. Install frontend dependencies:
cd ../frontend
npm install

6. Start the frontend using Live Server.
Do NOT open index.html as a static file.

