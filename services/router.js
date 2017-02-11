/*
 * Router
 */

module.exports = (routes) => (req, res) => {

    let route = routes.find(req.path);

    let data = route.data || {};

    if (typeof(data) === 'function') {
        data = data();
    }

    res.render(route.view, data);

};