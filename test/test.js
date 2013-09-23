"use strict";

var test = require('tape');
var core = require('../lib/core');
var helpers = require('../lib/helpers');
var types = require('../lib/types');


var JXT = core.define({
    name: 'jxtTest',
    namespace: 'test',
    element: 'jxt',
    topLevel: true,
    fields: {
        attribute: types.attribute('attr'),
        boolAttribute: types.boolAttribute('boolattr'),
        boolSub: types.boolSub('test', 'boolsub'),
        subAttribute: types.subAttribute('test', 'subattr', 'attr'),
        subText: types.subText('test', 'sub'),
        multiSubText: types.multiSubText('test', 'sub'),
        subLangText: types.subLangText('test', 'sublang')
    }
});


var SubJXT = core.define({
    name: 'subJXT',
    namespace: 'test',
    element: 'subjxt',
    fields: {
        text: types.text()
    }
});


core.extend(JXT, SubJXT, 'multiSubs');


test('basic attribute', function (t) {
    var xml = helpers.createElement('test', 'test');

    helpers.setAttribute(xml, 'attr', 'foo');
    var res = helpers.getAttribute(xml, 'attr');

    t.equal(res, 'foo');
    t.end();
});

test('basic boolAttribute', function (t) {
    var xml = helpers.createElement('test', 'test');

    helpers.setBoolAttribute(xml, 'boolattr', true);
    var res = helpers.getBoolAttribute(xml, 'boolattr');

    t.equal(res, true);
    t.end();
});

test('basic subAttribute', function (t) {
    var xml = helpers.createElement('test', 'test');

    helpers.setSubAttribute(xml, 'test', 'sub', 'attr', 'foo');
    var res = helpers.getSubAttribute(xml, 'test', 'sub', 'attr');

    t.equal(res, 'foo');
    t.end();
});

test('basic boolSub', function (t) {
    var xml = helpers.createElement('test', 'test');

    helpers.setBoolSub(xml, 'test', 'boolsub', true);
    var res = helpers.getBoolSub(xml, 'test', 'boolsub');

    t.equal(res, true);
    t.end();
});

test('basic text', function (t) {
    var xml = helpers.createElement('test', 'test');

    helpers.setText(xml, 'foo');
    var res = helpers.getText(xml);

    t.equal(res, 'foo');
    t.end();
});

test('basic subText', function (t) {
    var xml = helpers.createElement('test', 'test');

    helpers.setSubText(xml, 'test', 'sub', 'foo');
    var res = helpers.getSubText(xml, 'test', 'sub');

    t.equal(res, 'foo');
    t.end();
});

test('basic multiSubText', function (t) {
    var xml = helpers.createElement('test', 'test');

    helpers.setMultiSubText(xml, 'test', 'sub', ['foo', 'bar']);
    var res = helpers.getMultiSubText(xml, 'test', 'sub');

    t.deepEqual(res, ['foo', 'bar']);
    t.end();
});

test('basic subLangText', function (t) {
    var xml = helpers.createElement('test', 'test');

    helpers.setSubLangText(xml, 'test', 'sub', {'en': 'foo', 'sv': 'bar'});
    var res = helpers.getSubLangText(xml, 'test', 'sub');

    t.deepEqual(res, {'en': 'foo', 'sv': 'bar'});
    t.end();
});

test('field attribute', function (t) {
    var xml = new JXT();

    xml.attribute = 'foo';
    var res = xml.attribute;

    t.equal(res, 'foo');
    t.end();
});

test('field boolAttribute', function (t) {
    var xml = new JXT();

    xml.boolAttribute = true;
    var res = xml.boolAttribute;

    t.equal(res, true);
    t.end();
});

test('field subAttribute', function (t) {
    var xml = new JXT();

    xml.subAttribute = 'foo';
    var res = xml.subAttribute;

    t.equal(res, 'foo');
    t.end();
});

test('field boolAttribute', function (t) {
    var xml = new JXT();

    xml.boolSub = true;
    var res = xml.boolSub;

    t.equal(res, true);
    t.end();
});

test('field text', function (t) {
    var xml = new SubJXT();

    xml.text = 'foo';
    var res = xml.text;

    t.equal(res, 'foo');
    t.end();
});

test('field subText', function (t) {
    var xml = new JXT();

    xml.subText = 'foo';
    var res = xml.subText;

    t.equal(res, 'foo');
    t.end();
});

test('field multiSubText', function (t) {
    var xml = new JXT();

    xml.multiSubText = ['foo', 'bar'];
    var res = xml.multiSubText;

    t.deepEqual(res, ['foo', 'bar']);
    t.end();
});

test('field subLangText', function (t) {
    var xml = new JXT();

    xml.subLangText = {'en': 'foo', 'sv': 'bar'};
    var res = xml.subLangText;

    t.deepEqual(res, {'en': 'foo', 'sv': 'bar'});
    t.end();
});

test('extending', function (t) {
    var xml = new JXT();

    xml.subJXT.text = 'foo';
    var res = xml.subJXT.text;

    t.equal(res, 'foo');
    t.end();
});

test('multiExtending', function (t) {
    var xml = new JXT();

    xml.multiSubs = [{text: 'one'}, {text: 'two'}];
    var res = xml.multiSubs;

    t.deepEqual(res, [{text: 'one'}, {text: 'two'}]);
    t.end();
});

test('json', function (t) {
    t.plan(2);

    var xml = new JXT();

    xml.attribute = 'foo';
    xml.subJXT.text = 'bar';

    var res = xml.toJSON();

    t.deepEqual(res, {attribute: 'foo', subJXT: {text: 'bar'}, multiSubs: [{text: 'bar'}]});

    var xml2 = new JXT(res);
    var res2 = xml2.toJSON();

    t.deepEqual(res2, {attribute: 'foo', subJXT: {text: 'bar'}, multiSubs: [{text: 'bar'}]});

    t.end();
});
