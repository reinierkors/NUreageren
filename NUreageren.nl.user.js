// ==UserScript==
// @name         NUreageren.nl
// @namespace    https://nureageren.nl/
// @version      2.11
// @updateURL    https://github.com/reinierkors/NUreageren/raw/master/NUreageren.nl.user.js
// @description  Deze plugin zorgt ervoor dat jij weer kunt reageren op nu.nl.
// @author       NUreageren.nl
// @match        *://www.nu.nl/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    jsonToDOM.namespaces = {
        html: "http://www.w3.org/1999/xhtml",
        xul: "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
    };
    jsonToDOM.defaultNamespace = jsonToDOM.namespaces.html;
    function jsonToDOM(jsonTemplate, doc, nodes) {
        function namespace(name) {
            var reElemNameParts = /^(?:(.*):)?(.*)$/.exec(name);
            return { namespace: jsonToDOM.namespaces[reElemNameParts[1]], shortName: reElemNameParts[2] };
        }

        // Note that 'elemNameOrArray' is: either the full element name (eg. [html:]div) or an array of elements in JSON notation
        function tag(elemNameOrArray, elemAttr) {
            // Array of elements?  Parse each one...
            if (Array.isArray(elemNameOrArray)) {
                var frag = doc.createDocumentFragment();
                Array.forEach(arguments, function(thisElem) {
                    frag.appendChild(tag.apply(null, thisElem));
                });
                return frag;
            }

            // Single element? Parse element namespace prefix (if none exists, default to defaultNamespace), and create element
            var elemNs = namespace(elemNameOrArray);
            var elem = doc.createElementNS(elemNs.namespace || jsonToDOM.defaultNamespace, elemNs.shortName);

            // Set element's attributes and/or callback functions (eg. onclick)
            for (var key in elemAttr) {
                var val = elemAttr[key];
                if (nodes && key == "key") {
                    nodes[val] = elem;
                    continue;
                }

                var attrNs = namespace(key);
                if (typeof val == "function") {
                    // Special case for function attributes; don't just add them as 'on...' attributes, but as events, using addEventListener
                    elem.addEventListener(key.replace(/^on/, ""), val, false);
                }
                else {
                    // Note that the default namespace for XML attributes is, and should be, blank (ie. they're not in any namespace)
                    elem.setAttributeNS(attrNs.namespace || "", attrNs.shortName, val);
                }
            }

            // Create and append this element's children
            var childElems = Array.prototype.slice.call(arguments, 2);
            childElems.forEach(function(childElem) {
                if (childElem !== null) {
                    elem.appendChild(
                        childElem instanceof doc.defaultView.Node ? childElem :
                            Array.isArray(childElem) ? tag.apply(null, childElem) :
                                doc.createTextNode(childElem));
                }
            });

            return elem;
        }

        return tag.apply(null, jsonTemplate);
    }

    var path = window.location.pathname;
    var site = window.location.hostname;
    var sites = ["www.nu.nl"];

    if(!include(sites, site) || path == '/') {
        return;
    }

    switch(site) {
        case 'www.nu.nl':
            nu_nl();
            break;
        default:
            console.log("Deze site word nog niet ondersteund.");
            break;
    }

    function nu_nl() {
        var buttons = document.getElementsByClassName('social-buttons');
        if(buttons.length) {
            var newButton = document.createElement('li');
            var json =
            ['html:a', {href:'https://nureageren.nl' + path, rel:'nofollow', class:'tracksocial', target:'_blank'},
                ['html:span', {class:'nureageren_count counter'}, '-'],
                ['html:div', {class:'social-button', style:'background-color: #eaf0fa; border: none;'},
                    ['html:div', {class:'button-content'},
                        ['html:i', {class:'fc fc-nujij'}],
                        ['html:span', {class:'socialtext'}, 'Reageer'],
                    ]
                ]
            ];
            newButton.appendChild(jsonToDOM(json, document, {}));

            for (var i = 0; i < buttons.length; i++) {
                buttons[i].insertBefore(newButton, buttons[i].firstChild);
            }

            setCount("nureageren_count");
        }
    }

    function setCount(elem) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            setText(elem, parseInt(xmlHttp.responseText));
        }};
        xmlHttp.open("GET", "https://nureageren.nl/api/count/" + path.split('/')[2], true);
        xmlHttp.send(null);
    }

    function include(arr, obj) {
        return (arr.indexOf(obj) != -1);
    }

    function setText(id, newCount) {
        var count = document.getElementsByClassName(id);
        for (var i = 0; i < count.length; i++) {
            count[i].firstChild.nodeValue = newCount;
        }
    }
})();
