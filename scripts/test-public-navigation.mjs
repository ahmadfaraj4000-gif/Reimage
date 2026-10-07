import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Exercise the controller's event ordering without replacing native navigation.
class Element extends EventTarget {
  constructor() {
    super();
    this.children = [];
    this.attributes = new Map();
    const classes = new Set();
    this.classList = {
      remove: value => classes.delete(value),
      contains: value => classes.has(value),
      toggle(value, force = !classes.has(value)) {
        force ? classes.add(value) : classes.delete(value);
        return force;
      },
    };
  }
  contains(target) { return this === target || this.children.some(child => child.contains(target)); }
  setAttribute(name, value) { this.attributes.set(name, value); }
  removeAttribute(name) { this.attributes.delete(name); }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  cloneNode() { return this; }
  replaceWith() {}
  focus() { this.focused = true; }
}

function fixture() {
  const document = new Element();
  const window = new Element();
  const navbar = new Element();
  const nav = new Element();
  const menu = new Element();
  const summary = new Element();
  const button = new Element();
  const links = ['/careers.html', '/market-signals.html'].map(path => Object.assign(new Element(), {href: `https://reimagebs.com${path}`}));
  const footer = new Element();
  const timers = [];
  menu.children = [summary, ...links];
  nav.children = [menu];
  navbar.children = [nav, button];
  menu.querySelector = selector => selector === 'summary' ? summary : null;
  menu.querySelectorAll = () => links;
  nav.querySelector = selector => selector === '.nav-more' ? menu : links[0];
  nav.querySelectorAll = () => links;
  navbar.querySelectorAll = () => links;
  document.querySelector = selector => selector === '.navbar' ? navbar : footer;
  document.getElementById = id => id === 'menuBtn' ? button : nav;
  document.body = new Element();
  document.readyState = 'complete';
  window.location = {href: 'https://reimagebs.com/', pathname: '/'};
  vm.runInNewContext(fs.readFileSync(new URL('../public-shell.js', import.meta.url), 'utf8'), {
    document, window, URL, Date, setTimeout: callback => timers.push(callback),
  });
  menu.open = true;
  return {document, window, menu, summary, button, nav, links, timers};
}

function focusout(element, relatedTarget) {
  const event = new Event('focusout');
  Object.defineProperty(event, 'relatedTarget', {value: relatedTarget});
  element.dispatchEvent(event);
}

test('pointer blur without a focus destination keeps links available for activation', () => {
  const {menu, links, timers} = fixture();
  focusout(menu, null);
  assert.equal(menu.open, true);
  links[0].dispatchEvent(new Event('click'));
  assert.equal(menu.open, true, 'link must remain visible through native click activation');
  timers.forEach(callback => callback());
  assert.equal(menu.open, true, 'cross-page activation never hides the link before navigation');
});

test('keyboard focus moves within the dropdown without hiding it, and dismisses on exit', () => {
  const {document, menu, links, button} = fixture();
  const tab = new Event('keydown');
  Object.defineProperty(tab, 'key', {value: 'Tab'});
  document.dispatchEvent(tab);
  focusout(menu, links[0]);
  focusout(menu, links[1]);
  assert.equal(menu.open, true);
  focusout(menu, button);
  assert.equal(menu.open, false);
});

test('Escape dismisses More and returns focus to its summary', () => {
  const {menu, summary} = fixture();
  const event = new Event('keydown', {cancelable: true});
  Object.defineProperty(event, 'key', {value: 'Escape'});
  menu.dispatchEvent(event);
  assert.equal(menu.open, false);
  assert.equal(summary.focused, true);
  assert.equal(event.defaultPrevented, true);
});

test('outside click dismisses More', () => {
  const {document, menu} = fixture();
  document.dispatchEvent(new Event('click'));
  assert.equal(menu.open, false);
});


test('touch focus changes cannot dismiss the submenu before a tap activates', () => {
  const {document, menu, button} = fixture();
  const tab = new Event('keydown');
  Object.defineProperty(tab, 'key', {value: 'Tab'});
  document.dispatchEvent(tab);
  document.dispatchEvent(new Event('pointerdown'));
  focusout(menu, button);
  assert.equal(menu.open, true);
});

test('mobile cross-page links remain available until pagehide, then Back restores a closed menu', () => {
  for (const index of [0, 1]) {
    const {window, menu, nav, links, timers} = fixture();
    nav.classList.toggle('open', true);
    links[index].dispatchEvent(new Event('click'));
    timers.forEach(callback => callback());
    assert.equal(nav.classList.contains('open'), true);
    assert.equal(menu.open, true);
    window.dispatchEvent(new Event('pagehide'));
    assert.equal(nav.classList.contains('open'), false);
    assert.equal(menu.open, false);
    nav.classList.toggle('open', true);
    menu.open = true;
    window.dispatchEvent(new Event('pageshow'));
    assert.equal(nav.classList.contains('open'), false);
    assert.equal(menu.open, false);
  }
});

test('same-page anchors still dismiss the mobile menu after click activation', () => {
  const {menu, nav, links, timers} = fixture();
  nav.classList.toggle('open', true);
  links[0].href = 'https://reimagebs.com/#home';
  links[0].dispatchEvent(new Event('click'));
  assert.equal(menu.open, true);
  timers.forEach(callback => callback());
  assert.equal(menu.open, false);
  assert.equal(nav.classList.contains('open'), false);
});
