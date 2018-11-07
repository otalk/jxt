const test = require('tape');

import jxt from '../src';

const Registry = jxt.createRegistry();

const Child = Registry.define({
    name: 'child',
    namespace: 'test',
    element: 'childel',
    tags: ['base-extension'],
    fields: {
        foo: jxt.attribute('foo', 'works')
    }
});

// Link Child to Base, before we define Base
Registry.withDefinition('baseel', 'test', function(Base) {
    Registry.extend(Base, Child);
});

test('withDefinition', function(t) {
    const Base = Registry.define({
        name: 'base',
        namespace: 'test',
        element: 'baseel'
    });

    const b = new Base();

    t.ok(b.child);
    t.equals(b.child.foo, 'works');
    t.end();
});

test('tagging', function(t) {
    const defs = Registry.tagged('base-extension');

    t.equals(defs.length, 1);
    t.equals(defs[0], Child);
    t.end();
});

test('withTag', function(t) {
    const tagged = [];

    Registry.withTag('base-extension', function(Stanza) {
        tagged.push(Stanza);
    });

    const Stanza = Registry.define({
        name: 'stanza',
        namespace: 'test',
        element: 'stanza',
        tags: ['base-extension']
    });

    t.equals(tagged.length, 2);
    t.equals(tagged[0], Child);
    t.equals(tagged[1], Stanza);
    t.end();
});
