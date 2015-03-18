'use strict';

var test = require('tape');
var jxt = require('../');
var Registry = jxt.createRegistry();



var JXT = Registry.define({
    name: 'jxtTest',
    namespace: 'test',
    element: 'jxt',
    topLevel: true,
    fields: {
        fixed: {
            value: 'fixedVal'
        },
        attribute: jxt.attribute('attr'),
        boolAttribute: jxt.boolAttribute('boolattr'),
        boolSub: jxt.boolSub('test', 'boolsub'),
        subAttribute: jxt.subAttribute('test', 'subattr', 'attr'),
        subText: jxt.subText('test', 'sub'),
        multiSubText: jxt.multiSubText('test', 'sub'),
        multiSubAttribute: jxt.multiSubAttribute('test', 'subattr', 'id'),
        subLangText: jxt.subLangText('test', 'sublang'),
        lang: jxt.langAttribute(),
        numberAttribute: jxt.numberAttribute('numattr'),
        numberSub: jxt.numberSub('test', 'numsub', false, 42),
        floatAttribute: jxt.numberAttribute('floatattr', true),
        floatSub: jxt.numberSub('test', 'floatsub', true),
        dateAttribute: jxt.dateAttribute('dateattr'),
        dateSub: jxt.dateSub('test', 'datesub'),
        dateSubAttribute: jxt.dateSubAttribute('test', 'datesub', 'dateattr')
    }
});


var SubJXT = Registry.define({
    name: 'subJXT',
    namespace: 'test',
    element: 'subjxt',
    fields: {
        text: jxt.text()
    }
});

var B64JXT = Registry.define({
    name: 'b64JXT',
    namespace: 'test',
    element: 'b64',
    fields: {
        text: jxt.text(),
        b64Text: jxt.b64Text()
    }
});

var InitJXT = Registry.define({
    name: 'initJXT',
    namespace: 'test',
    element: 'init',
    init: function () {
        this.result = this.test;
    },
    fields: {
        test: jxt.attribute('test'),
        result: jxt.attribute('result')
    }
});


Registry.extend(JXT, SubJXT, 'multiSubs');


test('get definition', function (t) {
    var foundJXT = Registry.getDefinition('jxt', 'test');
    t.equal(JXT, foundJXT);
    t.end();
});


test('basic attribute', function (t) {
    var xml = jxt.createElement('test', 'test');

    jxt.setAttribute(xml, 'attr', 'foo');
    var res = jxt.getAttribute(xml, 'attr');

    t.equal(res, 'foo');
    t.end();
});

test('basic boolAttribute', function (t) {
    var xml = jxt.createElement('test', 'test');

    jxt.setBoolAttribute(xml, 'boolattr', true);
    var res = jxt.getBoolAttribute(xml, 'boolattr');

    t.equal(res, true);
    t.end();
});

test('basic subAttribute', function (t) {
    var xml = jxt.createElement('test', 'test');

    jxt.setSubAttribute(xml, 'test', 'sub', 'attr', 'foo');
    var res = jxt.getSubAttribute(xml, 'test', 'sub', 'attr');

    t.equal(res, 'foo');
    t.end();
});

test('basic boolSub', function (t) {
    var xml = jxt.createElement('test', 'test');

    jxt.setBoolSub(xml, 'test', 'boolsub', true);
    var res = jxt.getBoolSub(xml, 'test', 'boolsub');

    t.equal(res, true);
    t.end();
});

test('basic text', function (t) {
    var xml = jxt.createElement('test', 'test');

    jxt.setText(xml, 'foo');
    var res = jxt.getText(xml);

    t.equal(res, 'foo');
    t.end();
});

test('basic subText', function (t) {
    var xml = jxt.createElement('test', 'test');

    jxt.setSubText(xml, 'test', 'sub', 'foo');
    var res = jxt.getSubText(xml, 'test', 'sub');

    t.equal(res, 'foo');
    t.end();
});

test('basic multiSubText', function (t) {
    var xml = jxt.createElement('test', 'test');

    jxt.setMultiSubText(xml, 'test', 'sub', ['foo', 'bar']);
    var res = jxt.getMultiSubText(xml, 'test', 'sub');

    t.deepEqual(res, ['foo', 'bar']);
    t.end();
});

test('basic multiSubAttributes', function (t) {
    var xml = jxt.createElement('test', 'test');

    jxt.setMultiSubAttribute(xml, 'test', 'subattr', 'id', ['foo', 'bar']);
    var res = jxt.getMultiSubAttribute(xml, 'test', 'subattr', 'id');

    t.deepEqual(res, ['foo', 'bar']);
    t.end();
});

test('basic subLangText', function (t) {
    var xml = jxt.createElement('test', 'test');

    jxt.setSubLangText(xml, 'test', 'sub', {'en': 'foo', 'sv': 'bar'});
    var res = jxt.getSubLangText(xml, 'test', 'sub');

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

    t.equal(resPlain.toString(), 'b64d text');
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

    t.deepEqual(res, { fixed: 'fixedVal', multiSubs: [ { text: 'one' }, { text: 'two' } ], numberSub: 42 });
    t.end();
});

test('json', function (t) {
    t.plan(2);

    var xml = new JXT();

    xml.attribute = 'foo';
    xml.subJXT.text = 'bar';

    var res = xml.toJSON();

    t.deepEqual(res, {
        'fixed': 'fixedVal',
        'subJXT': {'text': 'bar'},
        'attribute': 'foo',
        'numberSub': 42,
        'multiSubs': [{'text': 'bar'}]
    });

    var xml2 = new JXT(res);
    var res2 = xml2.toJSON();

    t.deepEqual(res2, {
        'fixed': 'fixedVal',
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
    var xml = Registry.parse(str);

    t.equal(xml.attribute, 'passed');
    t.end();
});

test('init', function (t) {
    t.plan(1);

    var str = '<init xmlns="test" test="passed" />';
    var xml = Registry.parse(str, InitJXT);

    t.equal(xml.result, 'passed');
    t.end();
});
