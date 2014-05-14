'use strict';

var _ = require('underscore');
var fromB64 = require('atob');
var toB64 = require('btoa');

var helpers = require('./helpers');
var find = helpers.find;


var field = exports.field = function (getter, setter) {
    return function () {
        var args = _.toArray(arguments);
        return {
            get: function () {
                return getter.apply(null, [this.xml].concat(args));
            },
            set: function (value) {
                setter.apply(null, ([this.xml].concat(args)).concat([value]));
            }
        };
    };
};

exports.field = field;
exports.boolAttribute = field(helpers.getBoolAttribute,
                              helpers.setBoolAttribute);
exports.subAttribute = field(helpers.getSubAttribute,
                             helpers.setSubAttribute);
exports.boolSubAttribute = field(helpers.getSubBoolAttribute,
                                 helpers.setSubBoolAttribute);
exports.text = field(helpers.getText,
                     helpers.setText);
exports.subText = field(helpers.getSubText,
                        helpers.setSubText);
exports.multiSubText = field(helpers.getMultiSubText,
                             helpers.setMultiSubText);
exports.multiSubAttribute  = field(helpers.getMultiSubAttribute,
                                   helpers.setMultiSubAttribute);
exports.subLangText = field(helpers.getSubLangText,
                            helpers.setSubLangText);
exports.boolSub = field(helpers.getBoolSub,
                        helpers.setBoolSub);

exports.langAttribute = field(
    function (xml) {
        return xml.getAttributeNS(helpers.XML_NS, 'lang') || '';
    },
    function (xml, value) {
        xml.setAttributeNS(helpers.XML_NS, 'lang', value);
    }
);

exports.b64Text = field(
    function (xml) {
        if (xml.textContent && xml.textContent !== '=') {
            return fromB64(xml.textContent);
        }
        return '';
    },
    function (xml, value) {
        xml.textContent = toB64(value) || '=';
    }
);

exports.dateAttribute = function (attr, now) {
    return {
        get: function () {
            var data = helpers.getAttribute(this.xml, attr);
            if (data) {
                return new Date(data);
            }
            if (now) {
                return new Date(Date.now());
            }
        },
        set: function (value) {
            if (!value) {
                return;
            }
            if (typeof value !== 'string') {
                value = value.toISOString();
            }
            helpers.setAttribute(this.xml, attr, value);
        }
    };
};

exports.dateSub = function (NS, sub, now) {
    return {
        get: function () {
            var data = helpers.getSubText(this.xml, NS, sub);
            if (data) {
                return new Date(data);
            }
            if (now) {
                return new Date(Date.now());
            }
        },
        set: function (value) {
            if (!value) {
                return;
            }
            if (typeof value !== 'string') {
                value = value.toISOString();
            }
            helpers.setSubText(this.xml, NS, sub, value);
        }
    };
};

exports.dateSubAttribute = function (NS, sub, attr, now) {
    return {
        get: function () {
            var data = helpers.getSubAttribute(this.xml, NS, sub, attr);
            if (data) {
                return new Date(data);
            }
            if (now) {
                return new Date(Date.now());
            }
        },
        set: function (value) {
            if (!value) {
                return;
            }
            if (typeof value !== 'string') {
                value = value.toISOString();
            }
            helpers.setSubAttribute(this.xml, NS, sub, attr, value);
        }
    };
};

exports.numberAttribute = function (attr, isFloat, defaultVal) {
    return {
        get: function () {
            var parse = isFloat ? parseFloat : parseInt;
            var data = helpers.getAttribute(this.xml, attr, '');
            if (!data) {
                return defaultVal;
            }
            var parsed = parse(data, 10);
            if (isNaN(parsed)) {
                return defaultVal;
            }

            return parsed;
        },
        set: function (value) {
            helpers.setAttribute(this.xml, attr, value.toString());
        }
    };
};

exports.numberSub = function (NS, sub, isFloat, defaultVal) {
    return {
        get: function () {
            var parse = isFloat ? parseFloat : parseInt;
            var data = helpers.getSubText(this.xml, NS, sub, '');
            if (!data) {
                return defaultVal;
            }

            var parsed = parse(data, 10);
            if (isNaN(parsed)) {
                return defaultVal;
            }

            return parsed;
        },
        set: function (value) {
            helpers.setSubText(this.xml, NS, sub, value.toString());
        }
    };
};

exports.attribute = function (name, defaultVal) {
    return {
        get: function () {
            return helpers.getAttribute(this.xml, name, defaultVal);
        },
        set: function (value) {
            helpers.setAttribute(this.xml, name, value);
        }
    };
};

exports.attributeNS = function (NS, name, defaultVal) {
    return {
        get: function () {
            return helpers.getAttributeNS(this.xml, NS, name, defaultVal);
        },
        set: function (value) {
            helpers.setAttributeNS(this.xml, NS, name, value);
        }
    };
};

exports.extension = function (ChildJXT) {
    return {
        get: function () {
            var self = this;
            var name = ChildJXT.prototype._name;
            if (!this._extensions[name]) {
                var existing = find(this.xml, ChildJXT.prototype._NS, ChildJXT.prototype._EL);
                if (!existing.length) {
                    this._extensions[name] = new ChildJXT({}, null, self);
                    this.xml.appendChild(this._extensions[name].xml);
                } else {
                    this._extensions[name] = new ChildJXT(null, existing[0], self);
                }
                this._extensions[name].parent = this;
            }
            return this._extensions[name];
        },
        set: function (value) {
            var child = this[ChildJXT.prototype._name];
            _.extend(child, value);
        }
    };
};

exports.multiExtension = function (ChildJXT) {
    return {
        get: function () {
            var self = this;
            var data = find(this.xml, ChildJXT.prototype._NS, ChildJXT.prototype._EL);
            var results = [];

            _.forEach(data, function (xml) {
                results.push(new ChildJXT({}, xml, self).toJSON());
            });
            return results;
        },
        set: function (value) {
            var self = this;
            var existing = find(this.xml, ChildJXT.prototype._NS, ChildJXT.prototype._EL);

            _.forEach(existing, function (item) {
                self.xml.removeChild(item);
            });

            _.forEach(value, function (data) {
                var content = new ChildJXT(data, null, self);
                self.xml.appendChild(content.xml);
            });
        }
    };
};
