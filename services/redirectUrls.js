'use strict';

/*
 * Redirect URL
 */
module.exports = (req, res, next) => {

    const redirectFrom = req.protocol + '://' + req.headers.host + req.url;
    let redirectTo = null;

    const hostname = ( req.headers.host.match(/:/g) )
        ? req.headers.host.slice(0, req.headers.host.indexOf(':'))
        : req.headers.host;

    let redirectionType = 'None';

    if (process.env['REDIRECT:' + hostname]) {
        redirectionType = 'environment variable';
        redirectTo = process.env['REDIRECT:' + hostname];
    }    else if (process.env.SSL_REDIRECT && 'http' === req.headers['x-forwarded-proto']) {
        redirectionType = 'ssl redirect';
        redirectTo = 'https://' + req.headers.host + req.url;
    }

    if (redirectTo && redirectTo !== redirectFrom) {
        console.log('Redirecting ' + redirectFrom + ' to ' + redirectTo + ' via ' + redirectionType);
        res.redirect(redirectTo);
        return false;
    }

    return next();
};
