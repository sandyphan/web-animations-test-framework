/*
 * Copyright 2013 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 

// get default html values
var htmlVal = document.getElementById('htmlCode').value;
htmlVal += "\n" + "<div id='b' class='test'></div>";
var cssVal = document.getElementById('cssCode').value;

// create new style and scripts object elements
var cssEle = document.createElement('style');

// elements such as animation divs and its associated style
// is appended into the body of iframe as well as any associating
// js scripts
var displayDefault = function() {
  frames['display'].document.documentElement.innerHTML = htmlVal;
  cssEle.innerHTML = cssVal;
  frames['display'].document.getElementsByTagName('style')[0].innerHTML = cssVal;
}

// executed when button called update is clicked
// extract texts from the 3 text areas,
var update = function() {  
  var iframe = document.getElementById('display');
  var innerDoc = iframe.contentDocument || iframe.contentWindow.document;

  var scriptEle = document.createElement('script');
  scriptEle.async = false;

  // get values from 3 textboxes
  if (contentNotEqual(htmlVal, document.getElementById('htmlCode').value)) {
    htmlVal = document.getElementById('htmlCode').value;
    htmlVal += "\n" + "<div id='b' class='test'></div>";
    innerDoc.documentElement.innerHTML = htmlVal;
  }

  var jsVal = document.getElementById('jsCode').value;

  // change the body and css in value in inframe
  innerDoc.documentElement.innerHTML = htmlVal;
  var par;
  
  var includeScripts = new Array();
  includeScripts[0] =  "../../web-animations-js/web-animation.js";
  includeScripts[1] = "../testharness/testharness.js";
  includeScripts[2] = "../testharness/testharnessreport.js";
  includeScripts[3] = "../extra-asserts.js";
  var includeLinks = new Array();
  includeLinks[0] = "../testharness/testharness.css";
  includeLinks[1] = "../animation-test-style.css";

  var scriptDivs = new Array();
  var linkDivs = new Array();
  for (var i = 0; i < includeScripts.length; i++) {
    scriptDivs[i] = document.createElement('script');
    scriptDivs[i].setAttribute('src', includeScripts[i]);
    scriptDivs[i].setAttribute('defer', 'defer');
    innerDoc.getElementsByTagName('body')[0].appendChild(scriptDivs[i]);
  }
  for(var i = 0; i < includeLinks.length; i++) {
    linkDivs[i] = document.createElement('link');
    linkDivs[i].setAttribute('href', includeLinks[i]);
    innerDoc.getElementsByTagName('body')[0].appendChild(linkDivs[i]);
  }

  jsVal += ("\n" +"links = document.getElementsByTagName('script');" 
    + "\n" + "console.log(links[0]);"
    //+ "\n" + "var anim = function() {new Animation(document.querySelector('#b'), {left: '300px'}, 2);}"
   // + "\n" + "window.load();"
    + "\n" + "new Animation(document.querySelector('#b'), {left: '300px'}, 2);");

  // change the scripts in iframe  
  var addAnimScript = function() {
    if (innerDoc.getElementsByTagName('script')[scriptDivs.length]) {
      var oldScript = frames['display'].document.getElementsByTagName('script')[scriptDivs.length];
      scriptEle.innerHTML = '\n' + jsVal + '\n';
      innerDoc.getElementsByTagName('body')[0].replaceChild(scriptEle, oldScript);
    } else {
      scriptEle.innerHTML = jsVal;
      par = innerDoc.getElementsByTagName('body')[0];
      par.appendChild(scriptEle);
    }
  }
  iframe.contentWindow.onload = addAnimScript();

  cssVal = document.getElementById('cssCode').value;
  frames['display'].document.getElementsByTagName('style')[0].innerHTML = cssVal;
  console.log("file:");
  console.log(innerDoc);
}

// make the solution box toggleable
var toggleSolution = function() {
  var ele = document.getElementById('toggleText');
  var p = getComputedStyle(ele, null);
  var label = document.getElementById('hideLabel');

  if (p.display === 'none') {
    ele.style.display = 'block';
    label.innerHTML = 'Hide Solution';
  } else if (p.display === 'block') {
    ele.style.display = 'none';
    label.innerHTML = 'Show Solution';
  }
}

var contentNotEqual = function(oldText, newText) {
  if (oldText !== newText) {
    return true;
  }
  return false;
}
