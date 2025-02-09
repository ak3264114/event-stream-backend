const mongoose = require('mongoose');
mongoose.Promise = Promise;
exports.connect = function () {
    const promise = new Promise((resolve) =>
        mongoose.connect(
            process.env.MONGO_DB_URI,
            {
                useFindAndModify: false,
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true
            },
            () => {
                console.log('Database Connected');
                resolve();
            }
        )
    );
    if (!process.env.cron) mongoose.set('debug', true);
    mongoose.connection.on('error', () => {
        console.log(
            'MongoDB connection error. Please make sure that MongoDB is running.'
        );
        // eslint-disable-next-line no-process-exit
        process.exit(1);
    });
    return promise;
};
