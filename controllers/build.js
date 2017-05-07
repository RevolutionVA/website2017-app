// build.js

module.exports = () => {
    return {
        response: require('../services/builder').run
    };
};
