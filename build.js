var bundle = require('browserify')(),
    fs = require('fs');


bundle.add('./jxt');
bundle.bundle({standalone: 'jxt'}).pipe(fs.createWriteStream('jxt.bundle.js'));
