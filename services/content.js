/*
 * Module
 */
const fs = require('fs-extra');

global.dataStore = {};

function getSet(type) {
    global.dataStore[type] =
        global.dataStore[type] || fs.readJsonSync('./content/' + type + '.json');
    return global.dataStore[type];
}

module.exports = {

    getHumans: function () {
        return getSet('humans');
    }

};