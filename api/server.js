require('dotenv').config()
const express = require('express');
const connectDB = require('./database-connection/connection');
const userRoutes = require('./routes/user-routes');
const expenseRoutes = require('./routes/expense-routes')
const authMiddleWare = require('./middleware/auth-middleware')
const cors = require('cors');
connectDB();
const app = express();
app.use(express.json());
// Allow all origins
const allowedOrigins = ["https://expense-tracker-bice-rho.vercel.app"];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server is now listening on: ', process.env.PORT);
})
app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);