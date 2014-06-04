'use strict';

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
        multiSubAttribute: types.multiSubAttribute('test', 'subattr', 'id'),
        subLangText: types.subLangText('test', 'sublang'),
        lang: types.langAttribute(),
        numberAttribute: types.numberAttribute('numattr'),
        numberSub: types.numberSub('test', 'numsub', false, 42),
        floatAttribute: types.numberAttribute('floatattr', true),
        floatSub: types.numberSub('test', 'floatsub', true),
        dateAttribute: types.dateAttribute('dateattr'),
        dateSub: types.dateSub('test', 'datesub'),
        dateSubAttribute: types.dateSubAttribute('test', 'datesub', 'dateattr')
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

var B64JXT = core.define({
    name: 'b64JXT',
    namespace: 'test',
    element: 'b64',
    fields: {
        text: types.text(),
        b64Text: types.b64Text()
    }
});

var InitJXT = core.define({
    name: 'initJXT',
    namespace: 'test',
    element: 'init',
    init: function () {
        this.result = this.test;
    },
    fields: {
        test: types.attribute('test'),
        result: types.attribute('result')
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

test('basic multiSubAttributes', function (t) {
    var xml = helpers.createElement('test', 'test');

    helpers.setMultiSubAttribute(xml, 'test', 'subattr', 'id', ['foo', 'bar']);
    var res = helpers.getMultiSubAttribute(xml, 'test', 'subattr', 'id');

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

test('field multiSubAttribute', function (t) {
    var xml = new JXT();

    xml.multiSubAttribute = ['foo', 'bar'];
    var res = xml.multiSubAttribute;

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

test('field langAttribute', function (t) {
    var xml = new JXT();

    xml.langAttribute  = 'en';
    var res = xml.langAttribute;

    t.equal(res, 'en');
    t.end();
});

test('field numberAttribute', function (t) {
    t.plan(2);
    var xml = new JXT();

    xml.numberAttribute  = 42;
    var res = xml.numberAttribute;

    xml.floatAttribute = 42.2;
    var res2 = xml.floatAttribute;

    t.equal(res, 42);
    t.equal(res2, 42.2);
    t.end();
});

test('field numberSub', function (t) {
    t.plan(2);
    var xml = new JXT();

    xml.numberSub = 42;
    var res = xml.numberSub;

    xml.floatSub = 42.2;
    var res2 = xml.floatSub;

    t.equal(res, 42);
    t.equal(res2, 42.2);
    t.end();
});

test('field dateAttribute', function (t) {
    var xml = new JXT();
    var dt = new Date(2015, 10, 21, 7, 28);

    xml.dateAttribute = dt;
    var res = xml.dateAttribute;

    t.deepEqual(res, dt);
    t.end();
});

test('field dateAttribute string', function (t) {
    var xml = new JXT();
    var dt = new Date(Date.UTC(2015, 9, 21, 7, 28));

    xml.dateAttribute = '2015-10-21T07:28:00Z';
    var res = xml.dateAttribute;

    t.deepEqual(res, dt);
    t.end();
});

test('field dateSub', function (t) {
    var xml = new JXT();
    var dt = new Date(2015, 9, 21, 7, 28);

    xml.dateSub = dt;
    var res = xml.dateSub;

    t.deepEqual(res, dt);
    t.end();
});

test('field dateSubAttribute', function (t) {
    var xml = new JXT();
    var dt = new Date(2015, 9, 21, 7, 28);

    xml.dateSubAttribute = dt;
    var res = xml.dateSubAttribute;

    t.deepEqual(res, dt);
    t.end();
});



test('field b64Text', function (t) {
    var xml = new B64JXT();

    xml.b64Text = 'b64d text';
    var resPlain = xml.b64Text;
    var res64 = xml.text;

    t.equal(resPlain, 'b64d text');
    t.equal(res64, 'YjY0ZCB0ZXh0');
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
    var res = xml.toJSON();

    t.deepEqual(res, { multiSubs: [ { text: 'one' }, { text: 'two' } ], numberSub: 42 });
    t.end();
});

test('json', function (t) {
    t.plan(2);

    var xml = new JXT();

    xml.attribute = 'foo';
    xml.subJXT.text = 'bar';

    var res = xml.toJSON();

    t.deepEqual(res, {
        'subJXT': {'text': 'bar'},
        'attribute': 'foo',
        'numberSub': 42,
        'multiSubs': [{'text': 'bar'}]
    });

    var xml2 = new JXT(res);
    var res2 = xml2.toJSON();

    t.deepEqual(res2, {
        'subJXT': {'text': 'bar'},
        'attribute': 'foo',
        'numberSub': 42,
        'multiSubs': [{'text': 'bar'}]
    });
    t.end();
});

test('parse', function (t) {
    t.plan(1);

    var str = '<jxt xmlns="test" attr="passed" />';
    var xml = core.parse(str, JXT);

    t.equal(xml.attribute, 'passed');
    t.end();
});

test('init', function (t) {
    t.plan(1);

    var str = '<init xmlns="test" test="passed" />';
    var xml = core.parse(str, InitJXT);

    t.equal(xml.result, 'passed');
    t.end();
});
