import test from 'tape';
import jxt from '../src';

const Registry = jxt.createRegistry();

const Parent = Registry.define({
    name: 'parent',
    namespace: 'test',
    element: 'parent',
    fields: {
        subText: jxt.subText('parent', 'test')
    }
});

const Child = Registry.define({
    name: 'child',
    namespace: 'test',
    element: 'child',
    fields: {
        val: jxt.attribute('val')
    }
});

Registry.extend(Parent, Child);

test('Using subText = true', function(t) {
    const xml = new Parent({
        subText: true
    });

    t.equal(xml.xml.childNodes[0].localName, 'test');
    t.equal(xml.xml.childNodes[0].textContent, '');
    t.end();
});

test('Using childExt = true', function(t) {
    const xml = new Parent({
        child: true
    });

    t.ok(xml._extensions.child);
    t.equal(xml.xml.childNodes[0].localName, 'child');
    t.end();
});
