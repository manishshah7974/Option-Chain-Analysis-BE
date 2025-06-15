require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const routesMapper = require("./routes/route");
const app = express();
const PORT = process.env.PORT || 443;
const HOST_NAME = process.env.HOST_NAME || "0.0.0.0";
require("./cronJobs/optionChainCron");

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1-minute window
  max: 50,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again after some time.",
    });
  },
  standardHeaders: false,
  legacyHeaders: false,
});

app.use(limiter);

// Routes
app.use("/", routesMapper);

// const options = {
//   key: fs.readFileSync('/etc/letsencrypt/live/api.softwizzards.com/privkey.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/api.softwizzards.com/fullchain.pem')
// };

// Start HTTPS server for production
// https.createServer(options, app).listen(443, () => {
//   console.log('✅ HTTPS server running on port 443');
// });

// Start server for local development
app.listen(PORT, HOST_NAME, () => {
  console.log(`✅ Server running at http://${HOST_NAME}:${PORT}`);
});