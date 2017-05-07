// schedule.js

const promiseObjectResolver = require('../modules/promise-object-resolver');

module.exports = () => {

    const content = require('../services/content')();
    const moment = require('moment');

    return promiseObjectResolver({
        socialMedia: content.getSocialMedia(),
        pages: content.getPages(),
        schedule: content.getSchedule()
    })
        .then(results => ({
            locals: {
                title: 'Schedule',
                socialMedia: results.socialMedia,
                bodyClass: 'page-schedule'
            },
            moment: moment,
            intro: results.pages.schedule.intro,
            schedule: results.schedule
        }));
}
