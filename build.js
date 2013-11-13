"use strict";

var browserify = require('browserify');
var UglifyJS = require('uglify-js');
var fs = require('fs');


var bundle = browserify();
bundle.add('./index');
bundle.bundle({standalone: 'JXT'}, function (err, js) {
    //var result = UglifyJS.minify(js, {fromString: true}).code;
    fs.writeFileSync('jxt.bundle.js', js);
});
