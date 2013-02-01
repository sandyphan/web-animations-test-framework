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
var iframeDoc;

// elements such as animation divs and its associated style
// is appended into the body of iframe as well as any associating
// js scripts
var setCssHTML = function() {
  htmlVal = "<div id='test' class='testBox'>" + document.getElementById('htmlCode').value + "\n<div id='dummy' class='test'></div>" + "</div>";
  cssVal = document.getElementById('cssCode').value +"\n" +"#dummy { display: none; }";
  iframeDoc.getElementsByTagName("body")[0].innerHTML = htmlVal;
  iframeDoc.getElementsByTagName('style')[0].innerHTML = cssVal;
}


// executed when button called update is clicked
// extract texts from the 3 text areas,
var update = function() { 
  console.log(document.getElementById("display").src);
  document.getElementById("display").src = document.getElementById("display").src;
  document.getElementById("display").onload =(function() {
    document.getElementById('display').className = 'fail';
    iframeDoc = document.getElementById('display').contentWindow.document;
    setCssHTML();
    iframeDoc.documentElement.getElementsByTagName("body")[0].innerHTML = htmlVal;
    console.log(iframeDoc);
    iframeDoc.getElementsByTagName('style')[0].innerHTML = cssVal;
    console.log(document.getElementsByTagName('script'));
  
    var scriptEle = document.createElement('script');
    jsVal = "setupTutorialTests(); \n" + document.getElementById('jsCode').value +"\nnew testAnimation(document.getElementById('dummy'), {left: '1000px'}, 2);" 
          + "\ncheck(document.querySelector('#a'), {'left': '0px'}, 0, 'Div 2: 0 sec');"
          + "\ncheck(document.querySelector('#a'), {'left': '300px'}, 2, 'Div 2: 2 sec');"
          +" \nrunTests();";
    jsVal = jsVal.replace("new Animation", "new testAnimation");

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
  });  
}

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

function setupTutorialTests() {
  state = "Manual";
  var timeOfAnimation = document.createElement('div');
  timeOfAnimation.id = "animViewerText";
  timeOfAnimation.innerHTML = "Current animation time: 0.00;";
  document.body.appendChild(timeOfAnimation);
}