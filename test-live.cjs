const fs = require('fs');
const { JSDOM } = require('jsdom');
let jsContent = fs.readFileSync('C:/Users/User/.gemini/antigravity/brain/277fef2b-cca2-4c20-8c60-a06cbf11bd39/.system_generated/steps/301/content.md', 'utf8');

// remove markdown headers
const lines = jsContent.split('\n');
let codeStart = lines.findIndex(l => l.startsWith('<!doctype') || l.includes('import(') || l.includes('var') || l.includes('function'));
// Actually, read_url_content returns a markdown file.
// Format is:
// Title: ...
// Description: ...
// Source: ...
// ---
// <actual content>
const contentSeparatorIndex = lines.indexOf('---');
if (contentSeparatorIndex !== -1) {
  jsContent = lines.slice(contentSeparatorIndex + 2).join('\n');
}

const html = '<!DOCTYPE html><html><head></head><body><div id="root"></div></body></html>';
const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/' });
dom.window.matchMedia = () => ({ matches: false, addListener: () => {}, removeListener: () => {} });
dom.window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
dom.window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
dom.window.scrollTo = () => {};
dom.window.addEventListener('error', (event) => console.error('RUNTIME ERROR CAUGHT:', event.error));

try {
  dom.window.eval(jsContent);
  console.log('Script evaluated successfully.');
  setTimeout(() => {
    console.log('Done waiting.');
  }, 1000);
} catch (err) {
  console.error('ERROR ON EVAL:', err);
}
