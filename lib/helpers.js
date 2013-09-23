"use strict";

var _ = require('lodash');
var XML_NS = 'http://www.w3.org/XML/1998/namespace';


exports.getParser = function () {
    return new DOMParser();
};

exports.createElement = function (NS, name) {
    return document.createElement(NS, name);
};

var find = exports.find = function (xml, NS, selector) {
    var children = xml.querySelectorAll(selector);
    return _.filter(children, function (child) {
        return child.namespaceURI === NS && child.parentNode == xml;
    });
};

exports.findOrCreate = function (xml, NS, selector) {
    var existing = exports.find(xml, NS, selector);
    if (existing.length) {
        return existing[0];
    } else {
        var created = document.createElementNS(NS, selector);
        xml.appendChild(created);
        return created;
    }
};

exports.getAttribute = function (xml, attr, defaultVal) {
    return xml.getAttribute(attr) || defaultVal || '';
};

exports.setAttribute = function (xml, attr, value, force) {
    if (value || force) {
        xml.setAttribute(attr, value);
    } else {
        xml.removeAttribute(attr);
    }
};

exports.getBoolAttribute = function (xml, attr, defaultVal) {
    var val = xml.getAttribute(attr) || defaultVal || '';
    return val === 'true' || val === '1';
};

exports.setBoolAttribute = function (xml, attr, value) {
    if (value) {
        xml.setAttribute(attr, '1');
    } else {
        xml.removeAttribute(attr);
    }
};

exports.getSubAttribute = function (xml, NS, sub, attr, defaultVal) {
    var subs = find(xml, NS, sub);
    if (!subs) {
        return '';
    }

    for (var i = 0; i < subs.length; i++) {
        if (subs[i].namespaceURI === NS) {
            return subs[i].getAttribute(attr) || defaultVal || '';
        }
    }

    return '';
};

exports.setSubAttribute = function (xml, NS, sub, attr, value) {
    var subs = find(xml, NS, sub);
    if (!subs.length) {
        if (value) {
            sub = document.createElementNS(NS, sub);
            sub.setAttribute(attr, value);
            xml.appendChild(sub);
        }
    } else {
        for (var i = 0; i < subs.length; i++) {
            if (subs[i].namespaceURI === NS) {
                if (value) {
                    subs[i].setAttribute(attr, value);
                    return;
                } else {
                    subs[i].removeAttribute(attr);
                }
            }
        }
    }
};

exports.getText = function (xml) {
    return xml.textContent;
};

exports.setText = function (xml, value) {
    xml.textContent = value;
};

exports.getSubText = function (xml, NS, element, defaultVal) {
    var subs = find(xml, NS, element);

    defaultVal = defaultVal || '';

    if (!subs) {
        return defaultVal;
    }

    for (var i = 0; i < subs.length; i++) {
        if (subs[i].namespaceURI === NS) {
            return subs[i].textContent || defaultVal;
        }
    }

    return defaultVal;
};

exports.setSubText = function (xml, NS, element, value) {
    var subs = find(xml, NS, element);
    if (!subs.length) {
        if (value) {
            var sub = document.createElementNS(NS, element);
            sub.textContent = value;
            xml.appendChild(sub);
        }
    } else {
        for (var i = 0; i < subs.length; i++) {
            if (subs[i].namespaceURI === NS) {
                if (value) {
                    subs[i].textContent = value;
                    return;
                } else {
                    xml.removeChild(subs[i]);
                }
            }
        }
    }
};

exports.getMultiSubText = function (xml, NS, element, extractor) {
    var subs = find(xml, NS, element);
    var results = [];

    extractor = extractor || function (sub) {
        return sub.textContent || '';
    };

    for (var i = 0; i < subs.length; i++) {
        if (subs[i].namespaceURI === NS) {
            results.push(extractor(subs[i]));
        }
    }

    return results;
};

exports.setMultiSubText = function (xml, NS, element, value, builder) {
    var subs = find(xml, NS, element);
    var values = [];
    builder = builder || function (value) {
        var sub = document.createElementNS(NS, element);
        sub.textContent = value;
        xml.appendChild(sub);
    };
    if (typeof value === 'string') {
        values = (value || '').split('\n');
    } else {
        values = value;
    }
    _.forEach(subs, function (sub) {
        xml.removeChild(sub);
    });
    _.forEach(values, function (val) {
        if (val) {
            builder(val);
        }
    });
};

exports.getSubLangText = function (xml, NS, element, defaultLang) {
    var subs = find(xml, NS, element);
    if (!subs) {
        return {};
    }

    var lang, sub;
    var results = {};
    var langs = [];

    for (var i = 0; i < subs.length; i++) {
        sub = subs[i];
        if (sub.namespaceURI === NS) {
            lang = sub.getAttributeNS(XML_NS, 'lang') || defaultLang;
            langs.push(lang);
            results[lang] = sub.textContent || '';
        }
    }

    return results;
};

exports.setSubLangText = function (xml, NS, element, value, defaultLang) {
    var sub, lang;
    var subs = find(xml, NS, element);
    if (subs.length) {
        for (var i = 0; i < subs.length; i++) {
            sub = subs[i];
            if (sub.namespaceURI === NS) {
                xml.removeChild(sub);
            }
        }
    }

    if (typeof value === 'string') {
        sub = document.createElementNS(NS, element);
        sub.textContent = value;
        xml.appendChild(sub);
    } else if (typeof value === 'object') {
        for (lang in value) {
            if (value.hasOwnProperty(lang)) {
                sub = document.createElementNS(NS, element);
                if (lang !== defaultLang) {
                    sub.setAttributeNS(XML_NS, 'lang', lang);
                }
                sub.textContent = value[lang];
                xml.appendChild(sub);
            }
        }
    }
};
