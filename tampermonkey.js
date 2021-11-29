// ==UserScript==
// @name         tampermonkey-test
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  try to take over the world!
// @author
// @match        https://*/*
// @match        http://*/*
// @require      https://cdn.jsdelivr.net/npm/vue@3.2.6/dist/vue.global.min.js
// @updateURL    https://xxxxxxxx.user.js
// @downloadURL  https://xxxxxxxx.user.js

// ==/UserScript==

(function () {
  'use strict'
  if (location.href === 'http://localhost:3000/') return
  var script = document.createElement('script')
  script.type = 'module'
  script.src = 'http://localhost:3000/@vite/client'
  document.body.appendChild(script)
  var script2 = document.createElement('script')
  script2.type = 'module'
  script2.src = 'http://localhost:3000/src/main.js'
  document.body.appendChild(script2)
})()
