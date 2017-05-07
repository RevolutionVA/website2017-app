// build.js

module.exports = () => {
    return Promise.resolve({
        response: require('../services/builder').run
    });
};
