// promiseObjectResolver

module.exports = function (object) {

    let objectResolved = {};

    const objectKeys = Object.keys(object);

    const allPromises = objectKeys.map(key => {
        return object[key]
            .then(value => objectResolved[key] = value);
    });

    return Promise.all(allPromises)
        .then(() => objectResolved);
};