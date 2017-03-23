// module.js - what is that?

const csv = require('csvtojson');
const fs = require('fs-extra');
const path = require('path');
const Jimp = require('Jimp');
const program = require('commander');

const talks_dir = './.content-build/talks/';

function addDirs() {

    let rows = [];

    let csvStr = fs.readFileSync('./data.csv', 'utf8');
    csv({noheader: false})
        .fromString(csvStr)
        .on('json', (row) => {
            rows.push(row);
        })
        .on('done', () => {

            let allTags = [];

            let humans = rows.map(row => {

                [firstName, lastName, other_name] =
                    row.Name.split(' ').filter(function (name) {
                        return !name.includes('.');
                    });

                if (other_name) {
                    lastName = other_name;
                }

                if (!lastName || !firstName) {
                    return false;
                }

                let speakerSlug = [firstName, lastName].join('-').toLowerCase();

                let tags = row.Tags.replace(' ', ',').split(',').map(t => t.trim()).filter(t => t.trim());

                let slug = slugify(row.Title);

                let talk_dir = talks_dir + slug;

                let descriptionPath = talk_dir + '/description.md';
                let detailsPath = talk_dir + '/details.json';

                let details =
                    {
                        'title': row.Title,
                        'slug': slug,
                        'speaker': speakerSlug,
                        'summary': row.Abstract,
                        'tags': tags
                    };

                if (!fs.existsSync(talk_dir)) {
                    fs.mkdirSync(talk_dir);
                }

                if (!fs.existsSync(descriptionPath)) {
                    fs.writeFileSync(descriptionPath, row.Description);
                }

                if (!fs.existsSync(detailsPath)) {
                    fs.writeJSONSync(detailsPath, details);
                }

            });

            allTags = [...new Set(allTags)];

            allTags.sort();

            console.log(allTags);
        });
}

program
    .version('0.0.1')
    .option('-d, --directories', 'add directories')
    .parse(process.argv);

if (program.directories) {
    addDirs();
}

function uniqueArray(arrArg) {
    return arrArg.filter(function (elem, pos, arr) {
        return arr.indexOf(elem) == pos;
    });
}

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}