// page.js

const promiseObjectResolver = require('../modules/promise-object-resolver');

module.exports = urlParams => {

    const content = require('../services/content')();

    return promiseObjectResolver({
        socialMedia: content.getSocialMedia(),
        pages: content.getPages()
    })
        .then(results => {

            if (results.pages.hasOwnProperty(urlParams.pageSlug)) {

                let data = {
                    locals: {
                        socialMedia: results.socialMedia,
                        bodyClass: 'page ' + urlParams.pageSlug
                    }
                };

                return Object.assign(data, results.pages[urlParams.pageSlug]);
            }

            return {
                view: 'pages/404',
                locals: {
                    title: 'Page not Found',
                    socialMedia: results.socialMedia,
                    bodyClass: '404',
                    body: ''
                }
            };
        });
};
