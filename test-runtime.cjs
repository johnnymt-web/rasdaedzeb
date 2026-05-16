const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const distDir = path.join(__dirname, 'dist', 'assets');
const files = fs.readdirSync(distDir);
const jsFile = files.find(f => f.endsWith('.js') && f.startsWith('index-'));

if (!jsFile) {
  console.log('No index.js found');
  process.exit(1);
}

const jsContent = fs.readFileSync(path.join(distDir, jsFile), 'utf8');

const html = '<!DOCTYPE html><html><head></head><body><div id="root"></div></body></html>';

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  url: 'http://localhost/'
});

// Mock some common APIs
dom.window.matchMedia = () => ({ matches: false, addListener: () => {}, removeListener: () => {} });
dom.window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
dom.window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
dom.window.scrollTo = () => {};

dom.window.addEventListener('error', (event) => {
  console.error('RUNTIME ERROR CAUGHT:', event.error);
});

try {
  dom.window.eval(jsContent);
  console.log('Script evaluated successfully without throwing top-level error.');
  
  // Give it a tiny bit of time for microtasks
  setTimeout(() => {
    console.log('Done waiting.');
  }, 1000);
} catch (err) {
  console.error('ERROR ON EVAL:', err);
}
