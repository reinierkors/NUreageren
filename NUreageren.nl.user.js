// ==UserScript==
// @name         NUreageren.nl
// @namespace    https://nureageren.nl/
// @version      2.00
// @updateURL    https://github.com/reinierkors/NUreageren/raw/master/NUreageren.nl.user.js
// @description  Deze plugin zorgt ervoor dat jij weer kunt reageren op nu.nl.
// @author       NUreageren.nl
// @match        *://www.nu.nl/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

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
            newButton.innerHTML = '<a href="https://nureageren.nl' + path + '" rel="nofollow"' +
                'class="tracksocial" target="_blank"><span class="nureageren_count counter">-</span>' +
                '<div class="social-button" style="background-color: #eaf0fa; border: none;">' +
                '<div class="button-content"><i class="fc fc-nujij"></i><span class="socialtext">' +
                'Reageer</span></div></div></a>';

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
            setText(elem, xmlHttp.responseText);
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
            count[i].innerHTML = newCount;
        }
    }
})();
