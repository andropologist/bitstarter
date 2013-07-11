#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

+ cheerio
- https://github.com/MatthewMueller/cheerio
- http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
- http://maxogden.com/scraping-with-node.html

+ commander.js
- https://github.com/visionmedia/commander.js
- http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

+ JSON
- http://en.wikipedia.org/wiki/JSON
- https://developer.mozilla.org/en-US/docs/JSON
- https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var sys = require('util');

var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
console.log("%s does not exist. Exiting.", instr);
process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    console.log("Function cheerioHtmlFile ran with: " + htmlfile);
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    console.log("Function loadChecks ran with: " + checksfile);
    return JSON.parse(fs.readFileSync(checksfile));
};

// takes in a string of HTML and a checks file and tests it
var checkHtml = function(html, checksfile) {
    console.log("Function checkHtml ran with html:" + html + "and checksfile:" + checksfile);
    $ = html;
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
var present = $(checks[ii]).length > 0;
out[checks[ii]] = present;
    }
    return out;
};

var processFormat = function(htmlfile, url, checksfile) {
    console.log("RAN: processFormat(" + htmlfile + ", " + url + ", " + checksfile);
    if (!htmlfile) { // we are using url
rest.get(url).on('complete', function(result) {
console.log("rest.get is complete");
var out = checkHtml(cheerio.load(result, checksfile));
return out;
});
    } else {
return checkHtml(cheerioHtmlFile(htmlfile), checksfile);
    }
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists))
.option('-u, --url <url>', 'URL to check')
.parse(process.argv);
    var checkJson = processFormat(program.file, program.url, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtml = checkHtml;
}
