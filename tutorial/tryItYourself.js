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
 // jsVal = jsVal.replace("Animation", "testAnimation");
  console.log(jsVal);

  console.log(htmlVal + "\n" + "<script src='../../web-animations-js/web-animation.js'></script>"
  + "<script src='../testharness/testharness.js'></script>"
  + "<script src='../testharness/testharnessreport.js'></script>"
  + "<script src='../extra-asserts.js'></script>"
  + "<link rel='stylesheet' href='../testharness/testharness.css'>"
  + "<link rel='stylesheet' type='text/css' href='../animation-test-style.css'>"); 

  // change the body and css in value in inframe
  frames['display'].document.documentElement.innerHTML = htmlVal;
  
  var par;
  

  // change the scripts in iframe
  var includes = document.createElement('script');
  //includes.setAttribute('src', '../../web-animations-js/web-animation.js');
  //var includeAgain = document.createElement('script');
  //includeAgain.setAttribute("src", "../extra-asserts.js");
  //console.log(includes);
  //console.log(includeAgain);
  includes.onload = function() {
    if (frames['display'].document.getElementsByTagName('script')[1]) {
      var oldScript = frames['display'].document.getElementsByTagName('script')[1];
      scriptEle.innerHTML = '\n' + jsVal + '\n';
      frames['display'].document.getElementsByTagName('body')[0].replaceChild(scriptEle, oldScript);
    } else {
      scriptEle.innerHTML = jsVal;
      par = frames['display'].document.getElementsByTagName('body')[0];
      par.appendChild(scriptEle);
    }
  }
  frames['display'].document.getElementsByTagName('body')[0].appendChild(includes);

  cssVal = document.getElementById('cssCode').value;
  frames['display'].document.getElementsByTagName('style')[0].innerHTML = cssVal;

  
  console.log(innerDoc.getElementById("a"));
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
