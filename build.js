var bundle = require('browserify')();
var fs = require('fs');


bundle.add('./index');
bundle.bundle({standalone: 'jxt'}).pipe(fs.createWriteStream('jxt.bundle.js'));
