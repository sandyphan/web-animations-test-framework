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
var htmlVal;
var cssVal;
var jsVal;
var pass = new Array();
var i = 0;

// elements such as animation divs and its associated style
// is appended into the body of iframe as well as any associating
// js scripts
var displayDefault = function() {
  htmlVal = document.getElementById('htmlCode').value;
  cssVal = document.getElementById('cssCode').value;
  frames['display'].document.documentElement.getElementsByTagName("body")[0].innerHTML = htmlVal;
  frames['display'].document.getElementsByTagName('style')[0].innerHTML = cssVal;
}

// executed when button called update is clicked
// extract texts from the 3 text areas,
var update = function() { 
  pass = [];
  i = 0;
  document.getElementById('display').className = 'fail';
  displayDefault();
  iframeDoc = frames['display'].document;
  var scriptEle = document.createElement('script');
  jsVal = document.getElementById('jsCode').value;

  var addAnimScript = function() {
    var scriptDivs = iframeDoc.getElementsByTagName('script');
    if (scriptDivs[scriptDivs.length]) {
      var oldScript = frames['display'].document.getElementsByTagName('script')[scriptDivs.length];
      scriptEle.innerHTML = '\n' + jsVal + '\n';
      iframeDoc.getElementsByTagName('body')[0].replaceChild(scriptEle, oldScript);
    } else {
      scriptEle.innerHTML = jsVal;
      par = iframeDoc.getElementsByTagName('body')[0];
      par.appendChild(scriptEle);
    }
  }
  window.onload = addAnimScript();
  var pass = assertLocation(iframeDoc.getElementById('a'), "left", "0px", 0, "Your block starts in the right location");
  assertLocation(iframeDoc.getElementById('a'), "left", "300px", 2000, "Your block ends in the right location");
  var styleDivs = iframeDoc.getElementsByTagName('script');
  console.log(iframeDoc.getElementById('a'));
  endTests(2000);
  
  // innerDoc the solution box toggleable*/
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
}

var contentNotEqual = function(oldText, newText) {
  if (oldText !== newText) {
    return true;
  }
  return false;
}

function assertLocation (object, property, location, time, message) {
  setTimeout(function(){
    css = object.currentStyle || getComputedStyle(object, null);
    console.log((Math.abs(parseInt(css.left) - parseInt(location)) <= 10));
    pass[i] = (Math.abs(parseInt(css.left) - parseInt(location)) <= 10);
    i++;
    }, time)
}

function endTests(time) {
  setTimeout(function() {
    for(var j = 0; j < pass.length; j++) {
      if (!pass[j]) {
        console.log("fail");
        return;
      }
    }
    console.log("PASS");
    var object = document.getElementById('display');
    object.className = "pass"
  }, time+50)
}