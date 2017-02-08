/*
 * Redirect URL
 */
module.exports = function (req, res, next) {

    let hostname = ( req.headers.host.match(/:/g) )
        ? req.headers.host.slice(0, req.headers.host.indexOf(':'))
        : req.headers.host;

    if (process.env['REDIRECT:' + hostname]) {
        res.redirect(process.env['REDIRECT:' + hostname]);
        return false;
    }

    next();
};