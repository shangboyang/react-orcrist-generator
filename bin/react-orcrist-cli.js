#!/usr/bin/env node

const path = require('path');
const program = require('commander');
const colors = require('colors');
const mkdirp = require('mkdirp');
const shell = require('shelljs');
const fs = require('fs');
const pkg = require('../package.json');

//自定义
const util = require('../util');// build
const mode = util.mode;

let target, source;
let version = pkg.version;

const commands = ['--init'];

program
  .version(version, '   --version')
  .option('-i, --init [dirname]', 'Created a dir[dirname] for your application', '')
  .parse(process.argv);

if (commandIsEmpty()) {
  if (process.argv[2]) {
    printWithColor(' ');
    printWithColor(`${process.argv[2]} is not exist`);
  }
  printWithColor(' ');
  program.outputHelp();
}

if (program.init) {
  if ((/[^\w\-]/ig).test(program.init)) {
    printWithColor('Only number or string!');
    return;
  }
  ROOT = './' + program.init;
} else {
  ROOT = '.';
}

if (mode === 'dev') {
  ROOT = './test';
}

const _name = ROOT;
const _app = '/app';
const _build = '/build';

emptyDirectory(ROOT, function (empty, path) {
  if (empty) {
    createApp(ROOT);
  } else {
    if (ROOT == '.') {
      createApp(ROOT);
    } else {
      printWithColor('Please choose an empty Dir');
      printWithColor(path.substring(2) + ' is a not empty..');
    }
    return;
  }
});

function commandIsEmpty() {
  const arg = process.argv[2];
  return !commands.includes(arg);
}

function createApp(dest) {
  if (dest !== '.') {
    mkdir(dest, function () {
      execute(dest);
    });
  } else {
    execute(dest);
  }
}

function printWithColor(text, opt) {
  console.log('   ' + colors[opt == undefined ? 'red' : opt](text));
}

function printCreateInfo(text) {
  console.log('   \x1b[36mcreate\x1b[0m : ' + text);
}

function mkdir(path, fn) {
  mkdirp(path, function (err) {
    if (err) throw err;
    console.log('   \x1b[36mcreate\x1b[0m : ' + path);
    fn && fn();
  });
}

function copy(from, to) {
  shell.cp('-R', from, to);
}

function emptyDirectory(path, fn) {
  fs.readdir(path, function (err, files) {
    if (err && err.code !== 'ENOENT') throw err
    fn(!files || !files.length, path)
  })
}

function execute(dest) {
  copy(path.join(__dirname, '..', 'libs/index.html'), dest);
  printCreateInfo(dest + '/index.html');

  copy(path.join(__dirname, '..', 'libs/package-lock.json'), dest);
  printCreateInfo(dest + '/package-lock.json');

  copy(path.join(__dirname, '..', 'libs/package.json'), dest);
  printCreateInfo(dest + '/package.json');

  copy(path.join(__dirname, '..', 'libs/README.md'), dest);
  printCreateInfo(dest + '/README.md');

  copy(path.join(__dirname, '..', 'libs/server.js'), dest);
  printCreateInfo(dest + '/server.js');

  copy(path.join(__dirname, '..', 'libs/.babelrc'), dest);
  printCreateInfo(dest + '/.babelrc');

  copy(path.join(__dirname, '..', 'libs/.editorconfig'), dest);
  printCreateInfo(dest + '/.editorconfig');

  copy(path.join(__dirname, '..', 'libs/.gitignore'), dest);
  printCreateInfo(dest + '/.gitignore');

  copy(path.join(__dirname, '..', 'libs/app/'), dest + '/app');
  printCreateInfo(dest + '/app');

  copy(path.join(__dirname, '..', 'libs/build/'), dest + '/build');
  printCreateInfo(dest + '/build');

  copy(path.join(__dirname, '..', 'public/favicon.ico'), dest);
  printCreateInfo('Logo');
  printWithColor('Please wait away...', 'green');

  setTimeout(function () {
    copy(path.join(__dirname, '..', 'vendor/3rd'), dest + '/app');
    printCreateInfo('Third core for Native');
  }, 1500);
}
