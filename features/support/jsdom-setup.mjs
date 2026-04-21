import { JSDOM } from 'jsdom';

function defineGlobalValue(key, value) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value,
  });
}

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
});
const win = dom.window;

defineGlobalValue('window', win);
defineGlobalValue('document', win.document);
defineGlobalValue('navigator', win.navigator);
defineGlobalValue('self', win);
defineGlobalValue('HTMLElement', win.HTMLElement);
defineGlobalValue('HTMLParagraphElement', win.HTMLParagraphElement);
defineGlobalValue('Node', win.Node);
defineGlobalValue('Text', win.Text);
defineGlobalValue('Event', win.Event);
defineGlobalValue('MouseEvent', win.MouseEvent);
defineGlobalValue('KeyboardEvent', win.KeyboardEvent);
defineGlobalValue('CustomEvent', win.CustomEvent);
defineGlobalValue('MutationObserver', win.MutationObserver);
defineGlobalValue('getComputedStyle', win.getComputedStyle.bind(win));
defineGlobalValue('localStorage', win.localStorage);
defineGlobalValue('sessionStorage', win.sessionStorage);
defineGlobalValue(
  'requestAnimationFrame',
  win.requestAnimationFrame
    ? win.requestAnimationFrame.bind(win)
    : (callback) =>
        setTimeout(() => {
          callback(Date.now());
        }, 0)
);
defineGlobalValue(
  'cancelAnimationFrame',
  win.cancelAnimationFrame
    ? win.cancelAnimationFrame.bind(win)
    : (id) => clearTimeout(id)
);
defineGlobalValue('IS_REACT_ACT_ENVIRONMENT', true);

if (!win.requestAnimationFrame) {
  Object.defineProperty(win, 'requestAnimationFrame', {
    writable: true,
    value: globalThis.requestAnimationFrame,
  });
}

if (!win.cancelAnimationFrame) {
  Object.defineProperty(win, 'cancelAnimationFrame', {
    writable: true,
    value: globalThis.cancelAnimationFrame,
  });
}

if (!win.matchMedia) {
  Object.defineProperty(win, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
