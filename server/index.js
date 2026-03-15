import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Import your files
import connectDB from './database/db.js';
import userRoutes from './routes/user.route.js';
import courseRoute from "./routes/course.route.js";
import lectureRoute from "./routes/lecture.route.js";

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "https://lms-lac-zeta.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// --- GLOBAL MIDDLEWARE (Order is CRITICAL) ---

app.use(cors({
    origin: ["http://localhost:5173", "https://lms-lac-zeta.vercel.app"], // ✅ Added your Vercel URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// 2. Parse JSON bodies
app.use(express.json()); 

// 3. Parse URL-encoded bodies (Important for some form submissions)
app.use(express.urlencoded({ extended: true }));

// 4. Parse Cookies
app.use(cookieParser());

// 5. Debugging Logger (Optional but helpful)
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// --- ROUTES ---

// Health check route
app.get('/', (req, res) => {
  res.send('Server is running! 🚀');
});

// API Routes (Grouped cleanly)
app.use('/api/users', userRoutes);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/lecture", lectureRoute);


// --- SOCKET.IO EVENTS ---
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// --- START SERVER ---
// Changed fallback to 5000 to match your frontend courseApi setup!
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});