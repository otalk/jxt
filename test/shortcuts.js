'use strict';

var test = require('tape');
var jxt = require('../');
var Registry = jxt.createRegistry();


var Parent = Registry.define({
    name: 'parent',
    namespace: 'test',
    element: 'parent',
    fields: {
        subText: jxt.subText('parent', 'test')
    }
});


var Child = Registry.define({
    name: 'child',
    namespace: 'test',
    element: 'child',
    fields: {
        val: jxt.attribute('val')
    }
});


Registry.extend(Parent, Child);


test('Using subText = true', function (t) {
    var xml = new Parent({
        subText: true
    });

    t.equal(xml.xml.childNodes[0].localName, 'test');
    t.equal(xml.xml.childNodes[0].textContent, '');
    t.end();
});

test('Using childExt = true', function (t) {
    var xml = new Parent({
        child: true
    });

    t.ok(xml._extensions.child);
    t.equal(xml.xml.childNodes[0].localName, 'child');
    t.end();
});
