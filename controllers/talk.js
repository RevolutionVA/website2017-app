// talk.js

const promiseObjectResolver = require('../modules/promise-object-resolver');

module.exports = urlParams => {

    const content = require('../services/content')();

    return promiseObjectResolver({
        socialMedia: content.getSocialMedia(),
        talk: content.getTalk(urlParams.talkSlug)
    })
        .then(results => {

            if (!results.talk) {
                return {
                    redirect: '/404'
                };
            }

            return {
                locals: {
                    title: ' Talk - ' + results.talk.title,
                    keywords: results.talk.tags.join(','),
                    socialMedia: results.socialMedia,
                    bodyClass: 'page-speaker'
                },
                intro: '',
                talk: results.talk
            };
        });
}
