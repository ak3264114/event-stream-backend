const createError = require('http-errors');
const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const { errorHandler } = require('./helpers/errorHelper');
require('dotenv').config({ path: '.env' });
const Mongoose = require('./models/index');
const usersRouter = require('./routes/users.routes');
const eventsRouter = require('./routes/event.routes');
const getAdminRouter = require('./routes/admin.routes');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    cors({
        origin: 'https://event-stream.vercel.app',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    })
);

const getApp = async () => {
    await Mongoose.connect();
    app.use('/admin', await getAdminRouter());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use('/users', usersRouter);
    app.use('/events', eventsRouter);

    app.use((req, res, next) => {
        next(createError(404));
    });

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
        console.log(`Listening on http://localhost:${PORT}`);
    });

    // Error handler
    app.use(errorHandler);

    return app;
};
getApp();
