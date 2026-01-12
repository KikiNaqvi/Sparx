// ==UserScript==
// @name         SparxCheat
// @namespace    https://itskiyan.xyz/
// @version      1.0
// @description  Loads external scripts based on site
// @match        *://*.sparxmaths.uk/*
// @match        *://maths.sparx-learning.com/*
// @match        *://app.sparxreader.com/*
// @match        *://sparxreader.com/*
// @match        *://reader.sparx-learning.com/*
// @match        *://science.sparx-learning.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(async()=>{const b="https://www.itskiyan.xyz/Scripts/",u=location.href,m={js:["maths/maths.js"]},r={js:["reader/reader.js"],css:[]},s={js:["science/science.js","science/inject.js","maths/deps/h2c.js"],css:[]};let f={js:[],css:[]};if(u.includes("sparxmaths.uk")||u.includes("maths.sparx-learning.com"))f=m;else if(u.includes("app.sparxreader.com")||u.includes("sparxreader.com")||u.includes("reader.sparx-learning.com"))f=r;else if(u.includes("science.sparx-learning.com"))f=s;if(!document.body)await new Promise(r=>document.addEventListener("DOMContentLoaded",r));(f.css||[]).forEach(c=>{const l=document.createElement("link");l.rel="stylesheet";l.href=b+c;document.head.appendChild(l)});for(const j of f.js)try{await new Promise((r,e)=>{const s=document.createElement("script");s.src=b+j;s.onload=r;s.onerror=e;document.body.appendChild(s)})}catch(err){console.error("Failed to load",j,err)}if(f===r)try{await new Promise((r,e)=>{const s=document.createElement("script");s.src=b+"reader/receiver.js";s.onload=r;s.onerror=e;document.body.appendChild(s)})}catch(err){console.error("Failed to load receiver.js",err)}})();