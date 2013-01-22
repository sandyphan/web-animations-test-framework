/**
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
    frames['display'].document.documentElement.innerHTML = htmlVal;
  }

  var jsVal = document.getElementById('jsCode').value;
  /*jsVal = jsVal.replace("new Animation", "var animA = testAnimation");
  jsVal += ("\n" +"var refAnim = new testAnimation(document.querySelector('b'), {left: '300px'}, 2);"
    + "\n" +"check(animA, ['refTest','left'], refAnim, 1, 'Ref Test');"
    +"\n" +"runTests();");*/
  //console.log(jsVal);

  /*htmlVal = (htmlVal + "\n" 
    + "\n" + "<script src='../../web-animations-js/web-animation.js'></script>"
    + "\n" + "<script src='../testharness/testharness.js'></script>"
    + "\n" + "<script src='../testharness/testharnessreport.js'></script>"
    + "\n" + "<script src='../extra-asserts.js'></script>"
    + "\n" + "<link rel='stylesheet' href='../testharness/testharness.css'>"
    + "\n" + "<link rel='stylesheet' type='text/css' href='../animation-test-style.css'>"
    ); */

  // change the body and css in value in inframe
  frames['display'].document.documentElement.innerHTML = htmlVal;
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
  var linkDivs = new Array(1);
    for(var i = 0; i < includeScripts.length; i++) {
    scriptDivs[i] = document.createElement('script');
    scriptDivs[i].setAttribute('src', includeScripts[i]);
    console.log(scriptDivs[i]);
  }
  for(var i = 0; i < includeLinks.length; i++) {
    linkDivs[i] = document.createElement('link');
    linkDivs[i].setAttribute('href', includeLinks[i]);
    console.log(linkDivs[i]);
  }

for(var i = 0; i < scriptDivs.length; i++) {
    frames['display'].document.getElementsByTagName('body')[0].appendChild(scriptDivs[i]);
  }
  for(var i = 0; i < linkDivs.length; i++) {
    frames['display'].document.getElementsByTagName('body')[0].appendChild(linkDivs[i]);
  }

  // change the scripts in iframe
  /*var includes = document.createElement('script');
  includes.setAttribute('src', '../../web-animations-js/web-animation.js');
  includes.setAttribute('src', '../testharness/testharness.js');*/
  linkDivs.onload = function() {
    if (frames['display'].document.getElementsByTagName('script')[scriptDivs.length]) {
      var oldScript = frames['display'].document.getElementsByTagName('script')[scriptDivs.length];
      scriptEle.innerHTML = '\n' + jsVal + '\n';
      console.log(scriptEle.innerHTML);
      console.log("if");
      frames['display'].document.getElementsByTagName('body')[0].replaceChild(scriptEle, oldScript);
    } else {
      scriptEle.innerHTML = jsVal;
      par = frames['display'].document.getElementsByTagName('body')[scriptDivs.length];
      par.appendChild(scriptEle);
      console.log("else");
    }
  }

  
  //frames['display'].document.getElementsByTagName('body')[0].appendChild(includes);

  cssVal = document.getElementById('cssCode').value;
  frames['display'].document.getElementsByTagName('style')[0].innerHTML = cssVal;

  console.log(document.getElementsByTagName('script'));
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
