// ==UserScript==
// @name         NUreageren.nl
// @namespace    https://nureageren.nl/
// @version      1.1
// @updateURL    https://github.com/reinierkors/NUreageren/raw/master/NUreageren.nl.user.js
// @description  Deze plugin zorgt ervoor dat jij weer kunt reageren op nu.nl.
// @author       NUreageren.nl
// @match        *://www.nu.nl/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    $(function() {
        var url = window.location.pathname;
        var social = $('.social-buttons');

        if (url != '/' && social.length) {
            social.prepend('<li><a href="https://nureageren.nl' + url + '" rel="nofollow" class="tracksocial" target="_blank"><span id="count" class="counter">-</span><div class="social-button" style="background-color: #eaf0fa; border: none;"><div class="button-content"><i class="fc fc-nujij"></i><span class="socialtext">Reageer</span></div></div></a><div class="clear"></div></li>');
            httpGetAsync("https://nureageren.nl/api/count/" + url.split('/')[2]);
        }
    });
})();

// http://stackoverflow.com/questions/247483/http-get-request-in-javascript
function httpGetAsync(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        console.log(xmlHttp.readyState);
        console.log(xmlHttp.status);

        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            $('span#count').text(xmlHttp.responseText);
        }
    };
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
}