/*
 * Redirect URL
 */
module.exports = function (req, res, next) {

    let redirectFrom = req.protocol + '://' + req.headers.host + req.url;
    let redirectTo = null;

    let hostname = ( req.headers.host.match(/:/g) )
        ? req.headers.host.slice(0, req.headers.host.indexOf(':'))
        : req.headers.host;

    if (process.env['REDIRECT:' + hostname]) {
        redirectTo = process.env['REDIRECT:' + hostname];
    }

    else if (process.env.SSL_REDIRECT && 'http' === req.headers['x-forwarded-proto']) {
        redirectTo = 'https://' + req.headers.host + req.url;
    }

    if (redirectTo && redirectTo !== redirectFrom) {
        console.log('Redirecting ' + redirectFrom + ' to ' + redirectTo);
        res.redirect(redirectTo);
        return false;
    }

    return next();
};