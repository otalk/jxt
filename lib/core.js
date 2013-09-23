"use strict";

var _ = require('lodash');
var find = require('./helpers').find;

var serializer = new XMLSerializer();

var LOOKUP = {};
var LOOKUP_EXT = {};
var TOP_LEVEL_LOOKUP = {};


function topLevel(JXT) {
    var name = JXT.prototype._NS + '|' + JXT.prototype._EL;
    LOOKUP[name] = JXT;
    TOP_LEVEL_LOOKUP[name] = JXT;
}

function toString(xml) {
    return serializer.serializeToString(xml);
}

function toJSON(jxt) {
    var prop;
    var result = {};
    var exclude = {
        constructor: true,
        _EL: true,
        _NS: true,
        _extensions: true,
        _name: true,
        parent: true,
        prototype: true,
        toJSON: true,
        toString: true,
        xml: true
    };

    for (prop in jxt._extensions) {
        if (jxt._extensions[prop].toJSON) {
            result[prop] = jxt._extensions[prop].toJSON();
        }
    }

    for (prop in jxt) {
        if (!exclude[prop] && !((LOOKUP_EXT[jxt._NS + '|' + jxt._EL] || {})[prop]) && !jxt._extensions[prop] && prop[0] !== '_') {
            var val = jxt[prop];
            if (typeof val == 'function') continue;
            var type = Object.prototype.toString.call(val);
            if (type.indexOf('Object') >= 0) {
                if (Object.keys(val).length > 0) {
                    result[prop] = val;
                }
            } else if (type.indexOf('Array') >= 0) {
                if (val.length > 0) {
                    result[prop] = val;
                }
            } else if (!!val) {
                result[prop] = val;
            }
        }
    }

    return result;
}


exports.build = function (xml) {
    var JXT = TOP_LEVEL_LOOKUP[xml.namespaceURI + '|' + xml.localName];
    if (JXT) {
        return new JXT(null, xml);
    }
};

exports.extend = function (ParentJXT, ChildJXT) {
    var parentName = ParentJXT.prototype._NS + '|' + ParentJXT.prototype._EL;
    var name = ChildJXT.prototype._name;
    var qName = ChildJXT.prototype._NS + '|' + ChildJXT.prototype._EL;

    LOOKUP[qName] = ChildJXT;
    if (!LOOKUP_EXT[qName]) {
        LOOKUP_EXT[qName] = {};
    }
    if (!LOOKUP_EXT[parentName]) {
        LOOKUP_EXT[parentName] = {};
    }
    LOOKUP_EXT[parentName][name] = ChildJXT;

    ParentJXT.prototype.__defineGetter__(name, function () {
        if (!this._extensions[name]) {
            var existing = find(this.xml, ChildJXT.prototype._NS, ChildJXT.prototype._EL);
            if (!existing.length) {
                this._extensions[name] = new ChildJXT();
                this.xml.appendChild(this._extensions[name].xml);
            } else {
                this._extensions[name] = new ChildJXT(null, existing[0]);
            }
            this._extensions[name].parent = this;
        }
        return this._extensions[name];
    });
    ParentJXT.prototype.__defineSetter__(name, function (value) {
        var child = this[name];
        _.extend(child, value);
    });
};

exports.define = function (opts) {
    var StanzaConstructor = function (data, xml) {
        var self = this;

        self.xml = xml || document.createElementNS(self._NS, self._EL);
        if (!self.xml.parentNode || self.xml.parentNode.namespaceURI !== self._NS) {
            self.xml.setAttribute('xmlns', self._NS);
        }

        self._extensions = {};

        _.each(self.xml.childNodes, function (child) {
            var childName = child.namespaceURI + '|' + child.localName;
            var ChildJXT = LOOKUP[childName];
            if (ChildJXT !== undefined) {
                var name = ChildJXT.prototype._name;
                self._extensions[name] = new ChildJXT(null, child);
                self._extensions[name].parent = self;
            }
        });

        _.extend(self, data);

        return self;
    };

    StanzaConstructor.prototype = {
        constructor: {
            value: StanzaConstructor
        },
        _name: opts.name,
        _eventname: opts.eventName,
        _NS: opts.namespace,
        _EL: opts.element,
        toString: function () { return toString(this.xml); },
        toJSON: function () { return toJSON(this); }
    };

    var fieldNames = Object.keys(opts.fields || {});
    fieldNames.forEach(function (fieldName) {
        var field = opts.fields[fieldName];

        if (field.get) {
            StanzaConstructor.prototype.__defineGetter__(fieldName, field.get);
        }
        if (field.set) {
            StanzaConstructor.prototype.__defineSetter__(fieldName, field.set);
        }
    });

    if (opts.topLevel) {
        topLevel(StanzaConstructor);
    }

    return StanzaConstructor;
};
