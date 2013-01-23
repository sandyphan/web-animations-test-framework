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
var jsVal

// elements such as animation divs and its associated style
// is appended into the body of iframe as well as any associating
// js scripts
var displayDefault = function() {
  htmlVal = document.getElementById('htmlCode').value;
  htmlVal = "<div id='test' class='testBox'>"
  + "\n" + htmlVal
  + "\n" + "<div id='b' class='ref'></div>"
  + "\n" + "</div>";
  cssVal = document.getElementById('cssCode').value;
  cssVal += "\n" + ".ref {"
  + "\n" + "background-color: red;"
  + "\n" + "opacity:0;"
  + "\n" + "border-radius: 10px;"
  + "\n" + "width: 100px;"
  + "\n" + "height: 50px;"
  + "\n" + "top: 0px;"
  + "\n" + "left: 0px;"
  + "\n" + "position: absolute;"
  + "\n" +"}"
  + "\n" + ".testBox {"
  + "\n" + "height: 50px;"
  + "\n" + "}";

  frames['display'].document.documentElement.getElementsByTagName("body")[0].innerHTML = htmlVal;
  console.log(frames['display'].document);
  frames['display'].document.getElementsByTagName('style')[0].innerHTML = cssVal;
}

// executed when button called update is clicked
// extract texts from the 3 text areas,
var update = function() {  

  displayDefault();
  jsVal = document.getElementById('jsCode').value;
  jsVal = "setupTests({testTimeout: 20000});" + jsVal;
  jsVal = jsVal.replace("new Animation", "var anim = new testAnimation");
  jsVal += "\n" + "var ref = new testAnimation(document.querySelector('.ref'), {left: '300px'}, 2);"
  //+ "\n" + "check(document.querySelector('#a'), ['left'],['0px'], 0, 'Start position check');"
  //+ "\n" + "check(document.querySelector('#a'), ['refTest','left'], document.querySelector('.ref'), 1, 'Ref Test');"
  + "\n" + "runTests();";

  iframeDoc = frames['display'].document;
  var scriptEle = document.createElement('script');

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

  /*
  // innerDoc the solution box toggleable
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
  }*/
}

var contentNotEqual = function(oldText, newText) {
  if (oldText !== newText) {
    return true;
  }
  return false;
}
