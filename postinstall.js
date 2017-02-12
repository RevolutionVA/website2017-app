require('./services/builder').build()
    .then(function () {
        console.log('Build Complete!');
    })
    .catch(err => {
        console.error(err);
    });