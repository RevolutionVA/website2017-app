// module.js - what is that?

const csv = require('csvtojson');
const fs = require('fs-extra');
const path = require('path');
const Jimp = require('Jimp');
const program = require('commander');

const humans_dir = './.content-build/humans/';

const images_dir = './.speaker-images/';

function addDirs() {

    const rows = [];

    const csvStr = fs.readFileSync('./data.csv', 'utf8');
    csv({noheader: false})
        .fromString(csvStr)
        .on('json', (row) => {
            rows.push(row);
        })
        .on('done', () => {

            const humans = rows.map(row => {

// this chunk is failing undef check
/*eslint-disable */
                [firstName, lastName, other_name] =
                    row.Name.split(' ').filter((name) => {
                        return !name.includes('.');
                    });

                if (other_name) {
                    lastName = other_name;
                }

                if (!lastName || !firstName) {
                    return false;
                }

                let name_dir = [lastName, firstName].join('_').toLowerCase();

                if (row.Status.trim(' ').toLowerCase() !== 'accepted')
                    name_dir = '_' + name_dir;

                const human_dir = humans_dir + name_dir;

                if (!fs.existsSync(human_dir)) {
                    fs.mkdirSync(human_dir);
                }

                const details = {
                    'title': '',
                    'slug': [firstName, lastName].join('-').toLowerCase(),
                    'role': ['Speaker'],
                    'twitter': '',
                    'facebook': '',
                    'linkedin': '',
                    'personalWebsite': '',
                    'companyWebsite': '',
                    'companyName': row.Employer,
                    'firstName': firstName,
                    'lastName': lastName
                };
/*eslint-enable */

                const bioPath = human_dir + '/bio.md';
                const detailsPath = human_dir + '/details.json';

                if (!fs.existsSync(bioPath)) {
                    fs.writeFileSync(bioPath, row.Bio);
                }

                if (!fs.existsSync(detailsPath)) {
                    fs.writeJSONSync(detailsPath, details);
                }

                return true;
            });

            console.log(humans);
        });
}

function addImages() {
    fs.readdir(images_dir, (err, files) => {
        files.forEach(file => {

            const ext = path.extname(file);

            const basename = path.basename(file, ext);

            const imagePath = images_dir + '/' + file;

            let savePath = null;

            if (fs.existsSync(humans_dir + basename)) {
                savePath = humans_dir + basename;
            }            else if (fs.existsSync(humans_dir + '_' + basename)) {
                savePath = humans_dir + '_' + basename;
            }

            if (1) {
                Jimp.read(imagePath, (err, image) => {
                    if (err) throw err;

                    image
                        .resize(1000, Jimp.AUTO)
                        .quality(80)
                        .write(savePath + '/profile.png');

                    console.log('added');
                });
            }


        });
    });
}

program
    .version('0.0.1')
    .option('-d, --directories', 'add directories')
    .option('-i,  --images', 'add image')
    .parse(process.argv);

if(program.directories){
    addDirs();
}

if(program.images){
    addImages();
}
