import test from 'tape';
import jxt from '../src';

const Registry = jxt.createRegistry();

const JXT = Registry.define({
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

const SubJXT = Registry.define({
    name: 'subJXT',
    namespace: 'test',
    element: 'subjxt',
    fields: {
        text: jxt.text()
    }
});

const B64JXT = Registry.define({
    name: 'b64JXT',
    namespace: 'test',
    element: 'b64',
    fields: {
        text: jxt.text(),
        b64Text: jxt.b64Text()
    }
});

const InitJXT = Registry.define({
    name: 'initJXT',
    namespace: 'test',
    element: 'init',
    init: function() {
        this.result = this.test;
    },
    fields: {
        test: jxt.attribute('test'),
        result: jxt.attribute('result')
    }
});

Registry.extend(JXT, SubJXT, 'multiSubs');

test('get definition', function(t) {
    const foundJXT = Registry.getDefinition('jxt', 'test');
    t.equal(JXT, foundJXT);
    t.end();
});

test('basic attribute', function(t) {
    const xml = jxt.createElement('test', 'test');

    jxt.setAttribute(xml, 'attr', 'foo');
    const res = jxt.getAttribute(xml, 'attr');

    t.equal(res, 'foo');
    t.end();
});

test('basic boolAttribute', function(t) {
    const xml = jxt.createElement('test', 'test');

    jxt.setBoolAttribute(xml, 'boolattr', true);
    const res = jxt.getBoolAttribute(xml, 'boolattr');

    t.equal(res, true);
    t.end();
});

test('basic subAttribute', function(t) {
    const xml = jxt.createElement('test', 'test');

    jxt.setSubAttribute(xml, 'test', 'sub', 'attr', 'foo');
    const res = jxt.getSubAttribute(xml, 'test', 'sub', 'attr');

    t.equal(res, 'foo');
    t.end();
});

test('basic boolSub', function(t) {
    const xml = jxt.createElement('test', 'test');

    jxt.setBoolSub(xml, 'test', 'boolsub', true);
    const res = jxt.getBoolSub(xml, 'test', 'boolsub');

    t.equal(res, true);
    t.end();
});

test('basic text', function(t) {
    const xml = jxt.createElement('test', 'test');

    jxt.setText(xml, 'foo');
    const res = jxt.getText(xml);

    t.equal(res, 'foo');
    t.end();
});

test('basic subText', function(t) {
    const xml = jxt.createElement('test', 'test');

    jxt.setSubText(xml, 'test', 'sub', 'foo');
    const res = jxt.getSubText(xml, 'test', 'sub');

    t.equal(res, 'foo');
    t.end();
});

test('basic multiSubText', function(t) {
    const xml = jxt.createElement('test', 'test');

    jxt.setMultiSubText(xml, 'test', 'sub', ['foo', 'bar']);
    const res = jxt.getMultiSubText(xml, 'test', 'sub');

    t.deepEqual(res, ['foo', 'bar']);
    t.end();
});

test('basic multiSubAttributes', function(t) {
    const xml = jxt.createElement('test', 'test');

    jxt.setMultiSubAttribute(xml, 'test', 'subattr', 'id', ['foo', 'bar']);
    const res = jxt.getMultiSubAttribute(xml, 'test', 'subattr', 'id');

    t.deepEqual(res, ['foo', 'bar']);
    t.end();
});

test('basic subLangText', function(t) {
    const xml = jxt.createElement('test', 'test');

    jxt.setSubLangText(xml, 'test', 'sub', { en: 'foo', sv: 'bar' });
    const res = jxt.getSubLangText(xml, 'test', 'sub');

    t.deepEqual(res, { en: 'foo', sv: 'bar' });
    t.end();
});

test('field attribute', function(t) {
    const xml = new JXT();

    xml.attribute = 'foo';
    const res = xml.attribute;

    t.equal(res, 'foo');
    t.end();
});

test('field boolAttribute', function(t) {
    const xml = new JXT();

    xml.boolAttribute = true;
    const res = xml.boolAttribute;

    t.equal(res, true);
    t.end();
});

test('field subAttribute', function(t) {
    const xml = new JXT();

    xml.subAttribute = 'foo';
    const res = xml.subAttribute;

    t.equal(res, 'foo');
    t.end();
});

test('field boolAttribute', function(t) {
    const xml = new JXT();

    xml.boolSub = true;
    const res = xml.boolSub;

    t.equal(res, true);
    t.end();
});

test('field text', function(t) {
    const xml = new SubJXT();

    xml.text = 'foo';
    const res = xml.text;

    t.equal(res, 'foo');
    t.end();
});

test('field subText', function(t) {
    const xml = new JXT();

    xml.subText = 'foo';
    const res = xml.subText;

    t.equal(res, 'foo');
    t.end();
});

test('field multiSubText', function(t) {
    const xml = new JXT();

    xml.multiSubText = ['foo', 'bar'];
    const res = xml.multiSubText;

    t.deepEqual(res, ['foo', 'bar']);
    t.end();
});

test('field multiSubAttribute', function(t) {
    const xml = new JXT();

    xml.multiSubAttribute = ['foo', 'bar'];
    const res = xml.multiSubAttribute;

    t.deepEqual(res, ['foo', 'bar']);
    t.end();
});

test('field subLangText', function(t) {
    const xml = new JXT();

    xml.subLangText = { en: 'foo', sv: 'bar' };
    const res = xml.subLangText;

    t.deepEqual(res, { en: 'foo', sv: 'bar' });
    t.end();
});

test('field langAttribute', function(t) {
    const xml = new JXT();

    xml.langAttribute = 'en';
    const res = xml.langAttribute;

    t.equal(res, 'en');
    t.end();
});

test('field numberAttribute', function(t) {
    t.plan(2);
    const xml = new JXT();

    xml.numberAttribute = 42;
    const res = xml.numberAttribute;

    xml.floatAttribute = 42.2;
    const res2 = xml.floatAttribute;

    t.equal(res, 42);
    t.equal(res2, 42.2);
    t.end();
});

test('field numberSub', function(t) {
    t.plan(2);
    const xml = new JXT();

    xml.numberSub = 42;
    const res = xml.numberSub;

    xml.floatSub = 42.2;
    const res2 = xml.floatSub;

    t.equal(res, 42);
    t.equal(res2, 42.2);
    t.end();
});

test('field dateAttribute', function(t) {
    const xml = new JXT();
    const dt = new Date(2015, 10, 21, 7, 28);

    xml.dateAttribute = dt;
    const res = xml.dateAttribute;

    t.deepEqual(res, dt);
    t.end();
});

test('field dateAttribute string', function(t) {
    const xml = new JXT();
    const dt = new Date(Date.UTC(2015, 9, 21, 7, 28));

    xml.dateAttribute = '2015-10-21T07:28:00Z';
    const res = xml.dateAttribute;

    t.deepEqual(res, dt);
    t.end();
});

test('field dateSub', function(t) {
    const xml = new JXT();
    const dt = new Date(2015, 9, 21, 7, 28);

    xml.dateSub = dt;
    const res = xml.dateSub;

    t.deepEqual(res, dt);
    t.end();
});

test('field dateSubAttribute', function(t) {
    const xml = new JXT();
    const dt = new Date(2015, 9, 21, 7, 28);

    xml.dateSubAttribute = dt;
    const res = xml.dateSubAttribute;

    t.deepEqual(res, dt);
    t.end();
});

test('field b64Text', function(t) {
    const xml = new B64JXT();

    xml.b64Text = 'b64d text';
    const resPlain = xml.b64Text;
    const res64 = xml.text;

    t.equal(resPlain.toString(), 'b64d text');
    t.equal(res64, 'YjY0ZCB0ZXh0');
    t.end();
});

test('extending', function(t) {
    const xml = new JXT();

    xml.subJXT.text = 'foo';
    const res = xml.subJXT.text;

    t.equal(res, 'foo');
    t.end();
});

test('multiExtending', function(t) {
    const xml = new JXT();

    xml.multiSubs = [{ text: 'one' }, { text: 'two' }];
    const res = xml.toJSON();

    t.deepEqual(res, {
        fixed: 'fixedVal',
        multiSubs: [{ text: 'one' }, { text: 'two' }],
        numberSub: 42
    });
    t.end();
});

test('json', function(t) {
    t.plan(2);

    const xml = new JXT();

    xml.attribute = 'foo';
    xml.subJXT.text = 'bar';

    const res = xml.toJSON();

    t.deepEqual(res, {
        fixed: 'fixedVal',
        subJXT: { text: 'bar' },
        attribute: 'foo',
        numberSub: 42,
        multiSubs: [{ text: 'bar' }]
    });

    const xml2 = new JXT(res);
    const res2 = xml2.toJSON();

    t.deepEqual(res2, {
        fixed: 'fixedVal',
        subJXT: { text: 'bar' },
        attribute: 'foo',
        numberSub: 42,
        multiSubs: [{ text: 'bar' }]
    });
    t.end();
});

test('parse', function(t) {
    t.plan(1);

    const str = '<jxt xmlns="test" attr="passed" />';
    const xml = Registry.parse(str);

    t.equal(xml.attribute, 'passed');
    t.end();
});

test('init', function(t) {
    t.plan(1);

    const str = '<init xmlns="test" test="passed" />';
    const xml = Registry.parse(str, InitJXT);

    t.equal(xml.result, 'passed');
    t.end();
});
