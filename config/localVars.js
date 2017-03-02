/*
 * local vars
 */

const contentService = require('../services/content');

module.exports = {

    socialMedia: contentService.getSocialMedia()

};
