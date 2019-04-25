const ltxParse = require('ltx/lib/parse');
const DOMElement = require('ltx/lib/DOMElement');

export const XML_NS = 'http://www.w3.org/XML/1998/namespace';

export function parse(str) {
    const xml = ltxParse(str, {
        Element: DOMElement
    });
    if (xml.nodeType !== 1) {
        return;
    }
    return xml;
}

export function createElement(NS, name, parentNS) {
    const el = new DOMElement(name);
    if (!parentNS || parentNS !== NS) {
        setAttribute(el, 'xmlns', NS);
    }
    return el;
}

export function find(xml, NS, selector) {
    const results = [];
    const children = xml.getElementsByTagName(selector);
    for (let i = 0, len = children.length; i < len; i++) {
        const child = children[i];
        if (child.namespaceURI === NS && child.parentNode === xml) {
            results.push(child);
        }
    }
    return results;
}

export function findOrCreate(xml, NS, selector) {
    const existing = find(xml, NS, selector);
    if (existing.length) {
        return existing[0];
    } else {
        const created = createElement(NS, selector, xml.namespaceURI);
        xml.appendChild(created);
        return created;
    }
}

export function getAttribute(xml, attr, defaultVal) {
    return xml.getAttribute(attr) || defaultVal || '';
}

export function getAttributeNS(xml, NS, attr, defaultVal) {
    return xml.getAttributeNS(NS, attr) || defaultVal || '';
}

export function setAttribute(xml, attr, value, force) {
    if (value || force) {
        xml.setAttribute(attr, value);
    } else {
        xml.removeAttribute(attr);
    }
}

export function setAttributeNS(xml, NS, attr, value, force) {
    if (value || force) {
        xml.setAttributeNS(NS, attr, value);
    } else {
        xml.removeAttributeNS(NS, attr);
    }
}

export function getBoolAttribute(xml, attr, defaultVal) {
    const val = xml.getAttribute(attr) || defaultVal || '';
    return val === 'true' || val === '1';
}

export function setBoolAttribute(xml, attr, value) {
    if (value) {
        xml.setAttribute(attr, '1');
    } else {
        xml.removeAttribute(attr);
    }
}

export function getSubAttribute(xml, NS, sub, attr, defaultVal) {
    const subs = find(xml, NS, sub);
    if (!subs) {
        return '';
    }

    for (let i = 0; i < subs.length; i++) {
        return subs[i].getAttribute(attr) || defaultVal || '';
    }

    return '';
}

export function setSubAttribute(xml, NS, sub, attr, value) {
    const subs = find(xml, NS, sub);
    if (!subs.length) {
        if (value) {
            sub = createElement(NS, sub, xml.namespaceURI);
            sub.setAttribute(attr, value);
            xml.appendChild(sub);
        }
    } else {
        for (let i = 0; i < subs.length; i++) {
            if (value) {
                subs[i].setAttribute(attr, value);
                return;
            } else {
                subs[i].removeAttribute(attr);
            }
        }
    }
}

export function getBoolSubAttribute(xml, NS, sub, attr, defaultVal) {
    const val = xml.getSubAttribute(NS, sub, attr) || defaultVal || '';
    return val === 'true' || val === '1';
}

export function setBoolSubAttribute(xml, NS, sub, attr, value) {
    value = value ? '1' : '';
    setSubAttribute(xml, NS, sub, attr, value);
}

export function getText(xml) {
    return xml.textContent;
}

export function setText(xml, value) {
    xml.textContent = value;
}

export function getSubText(xml, NS, element, defaultVal) {
    const subs = find(xml, NS, element);

    defaultVal = defaultVal || '';

    if (!subs.length) {
        return defaultVal;
    }

    return subs[0].textContent || defaultVal;
}

export const getTextSub = getSubText;

export function setSubText(xml, NS, element, value) {
    const subs = find(xml, NS, element);
    if (subs.length) {
        for (let i = 0; i < subs.length; i++) {
            xml.removeChild(subs[i]);
        }
    }

    if (value) {
        const sub = createElement(NS, element, xml.namespaceURI);
        if (value !== true) {
            sub.textContent = value;
        }
        xml.appendChild(sub);
    }
}

export const setTextSub = setSubText;

export function getMultiSubText(xml, NS, element, extractor) {
    const subs = find(xml, NS, element);
    const results = [];

    extractor =
        extractor ||
        function(sub) {
            return sub.textContent || '';
        };

    for (let i = 0; i < subs.length; i++) {
        results.push(extractor(subs[i]));
    }

    return results;
}

export function setMultiSubText(xml, NS, element, value, builder) {
    const subs = find(xml, NS, element);
    let values = [];
    builder =
        builder ||
        function(val) {
            if (val) {
                const sub = createElement(NS, element, xml.namespaceURI);
                sub.textContent = val;
                xml.appendChild(sub);
            }
        };
    if (typeof value === 'string') {
        values = (value || '').split('\n');
    } else {
        values = value;
    }

    let i;
    let len;
    for (i = 0, len = subs.length; i < len; i++) {
        xml.removeChild(subs[i]);
    }

    for (i = 0, len = values.length; i < len; i++) {
        builder(values[i]);
    }
}

export function getMultiSubAttribute(xml, NS, element, attr) {
    return getMultiSubText(xml, NS, element, function(sub) {
        return getAttribute(sub, attr);
    });
}

export function setMultiSubAttribute(xml, NS, element, attr, value) {
    setMultiSubText(xml, NS, element, value, function(val) {
        const sub = createElement(NS, element, xml.namespaceURI);
        setAttribute(sub, attr, val);
        xml.appendChild(sub);
    });
}

export function getSubLangText(xml, NS, element, defaultLang) {
    const subs = find(xml, NS, element);
    if (!subs.length) {
        return {};
    }

    let lang;
    let sub;
    const results = {};
    const langs = [];

    for (let i = 0; i < subs.length; i++) {
        sub = subs[i];
        lang = sub.getAttributeNS(XML_NS, 'lang') || defaultLang;
        langs.push(lang);
        results[lang] = sub.textContent || '';
    }

    return results;
}

export function setSubLangText(xml, NS, element, value, defaultLang) {
    let sub;
    let lang;
    const subs = find(xml, NS, element);
    if (subs.length) {
        for (let i = 0; i < subs.length; i++) {
            xml.removeChild(subs[i]);
        }
    }

    if (typeof value === 'string') {
        sub = createElement(NS, element, xml.namespaceURI);
        sub.textContent = value;
        xml.appendChild(sub);
    } else if (typeof value === 'object') {
        for (lang in value) {
            if (value.hasOwnProperty(lang)) {
                sub = createElement(NS, element, xml.namespaceURI);
                if (lang !== defaultLang) {
                    sub.setAttributeNS(XML_NS, 'lang', lang);
                }
                sub.textContent = value[lang];
                xml.appendChild(sub);
            }
        }
    }
}

export function getBoolSub(xml, NS, element) {
    const subs = find(xml, NS, element);
    return !!subs.length;
}

export function setBoolSub(xml, NS, element, value) {
    const subs = find(xml, NS, element);
    if (!subs.length) {
        if (value) {
            const sub = createElement(NS, element, xml.namespaceURI);
            xml.appendChild(sub);
        }
    } else {
        for (let i = 0; i < subs.length; i++) {
            if (value) {
                return;
            } else {
                xml.removeChild(subs[i]);
            }
        }
    }
}
