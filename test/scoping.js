import test from 'tape';
import jxt from '../src';

const Registry = jxt.createRegistry();

const Parent = Registry.define({
    name: 'parent',
    namespace: 'parent',
    element: 'test'
});

const OtherParent = Registry.define({
    name: 'otherparent',
    namespace: 'otherparent',
    element: 'test'
});

const Foo1 = Registry.define({
    name: 'foo',
    namespace: 'test',
    element: 'foo-1',
    fields: {
        val1: jxt.attribute('val')
    }
});

const Foo2 = Registry.define({
    name: 'foo',
    namespace: 'test',
    element: 'foo-2',
    fields: {
        val2: jxt.attribute('val')
    }
});

Registry.extend(Parent, OtherParent);
Registry.extend(Parent, Foo1);
Registry.extend(OtherParent, Foo2);

test('JXT names are scoped to parent objects', function(t) {
    const xml = new Parent({
        foo: {
            val1: 'foo-1'
        },
        otherparent: {
            foo: {
                val2: 'foo-2'
            }
        }
    });

    t.equal(xml.foo.val1, 'foo-1');
    t.equal(xml.otherparent.foo.val2, 'foo-2');
    t.end();
});
