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
//var i = 0;
//var iframeDoc;

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
var update = function(object, properties, times) { 
   document.getElementById("display").src = document.getElementById("display").src;
  document.getElementById("display").onload =(function() {
    iframeDoc = document.getElementById('display').contentWindow.document;
    setCssHTML();
    iframeDoc.documentElement.getElementsByTagName("body")[0].innerHTML = htmlVal;
    iframeDoc.getElementsByTagName('style')[0].innerHTML = cssVal;
  
    var scriptEle = document.createElement('script');
    getJsVal(iframe);

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

function getJsVal(iframe) {
  jsVal = "setupTutorialTests(); \nstate='Manual'; \n" + document.getElementById('jsCode').value +"\nnew testAnimation(document.getElementById('dummy'), {left: '100px'}, " 
    +iframe.time + ");";
  
  for(var i = 0; i < iframe.checks.length; i++) {
    jsVal += "\n" + iframe.checks[i];
  }
  jsVal += " \nrunTests();";
  jsVal = jsVal.replace("new Animation", "new testAnimation");
}

function Iframe() {
  this.iframe = document.createElement('iframe');
  this.checks = [];
  this.time = 5;

  this.iframe.setAttribute('id', 'display');
  this.iframe.setAttribute('class', 'display');
  this.iframe.setAttribute('src', 'iframe-contents.html');
  document.querySelector('.display').appendChild(this.iframe);

  return this;
}

Iframe.prototype.addCheck = function(object, property, time) {
  this.checks.push("check(" + object + ", " + property + ", " + time + ", 'default');")
}

Iframe.prototype.setTime = function(newTime) {
  this.time = newTime;
}

function display() {
  var heading = document.createElement("div");
  heading.setAttribute("class", "heading");
  heading.setAttribute('id', 'heading')
  heading.innerHTML = "TRY IT YOURSELF";
  document.getElementById("tryIt").appendChild(heading);

  var button = document.createElement('button');
  button.setAttribute('onclick', 'update()');
  button.setAttribute('id', 'update');
  button.innerHTML = "Update";
  document.getElementById('heading').appendChild(button);

   var code = document.createElement('div');
   code.setAttribute('class', 'code');
   code.setAttribute('id', 'allCode');
   document.getElementById("tryIt").appendChild(code);

   var html = document.createElement('div');
   html.setAttribute('class', 'label');
   html.setAttribute('id', 'htmlLabel')
   html.innerHTML = "HTML Code";
   document.getElementById('allCode').appendChild(html);

   var htmlCode = document.createElement('textarea');
   htmlCode.setAttribute('id', 'htmlCode');
   htmlCode.setAttribute('class', 'code');
   htmlCode.innerHTML = "<div id='a' class='test'></div>";
   document.getElementById('allCode').appendChild(htmlCode);

   var css = document.createElement('div');
   css.setAttribute('class', 'label');
   css.setAttribute('id', 'cssLabel')
   css.innerHTML = "CSS Style";
   document.getElementById('allCode').appendChild(css);

   var cssCode = document.createElement('textarea');
   cssCode.setAttribute('id', 'cssCode');
   cssCode.setAttribute('class', 'code');
   cssCode.innerHTML = ".test {"
     +"\n" + "background-color: red;"
     +"\n" + "border-radius: 10px;"
     +"\n" + "width: 100px;"
     +"\n" + "height: 50px;"
     +"\n" + "top: 50px;"
     +"\n" + "left: 0px;"
     +"\n" + "position: absolute;"
     +"\n" + "}";
   document.getElementById('allCode').appendChild(cssCode);

   var js = document.createElement('div');
   js.setAttribute('class', 'label');
   js.setAttribute('id', 'jsLabel')
   js.innerHTML = "Javascript";
   document.getElementById('allCode').appendChild(js);

   var jsCode = document.createElement('textarea');
   jsCode.setAttribute('id', 'jsCode');
   jsCode.setAttribute('class', 'code');
   document.getElementById('allCode').appendChild(jsCode);

   var display = document.createElement('div');
   display.setAttribute('class', 'display');
   document.getElementById('tryIt').appendChild(display);
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