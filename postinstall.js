const builder = require('./services/builder');


builder.build()
    .then(function () {
        console.log('Build Complete!');
        return builder.startScheduler();
    })
    .catch(err => {
        console.error(err);
    });