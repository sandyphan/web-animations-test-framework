// get default html values
var htmlVal = document.getElementById('htmlCode').value;
var cssVal = document.getElementById('cssCode').value;

// create new style and scripts object elements

var includes = document.createElement('script');
var cssEle = document.createElement('style');

// elements such as animation divs and its associated style
// is appended into the body of iframe as well as any associating
// js scripts
var displayDefault = function() {
  frames['display'].document.documentElement.innerHTML = htmlVal;
  includes.setAttribute('src', '../../web-animations-js/web-animation.js');
  cssEle.innerHTML = cssVal;
  appendObjects();
}

// executed when button called update is clicked
// extract texts from the 3 text areas,
function update() {
  var scriptEle = document.createElement('script');

  // get values from 3 textboxes
  htmlVal = document.getElementById('htmlCode').value;
  cssVal = document.getElementById('cssCode').value;
  var jsVal = document.getElementById('jsCode').value;

  // change the body and css in value in inframe
  frames['display'].document.documentElement.innerHTML += htmlVal;
  
  var par;

  // change the scripts in iframe
  if (frames['display'].document.getElementsByTagName('script')[1]) {
    var oldScript = frames['display'].document.getElementsByTagName('script')[1];
    scriptEle.innerHTML = "\n" + jsVal + "\n";
    frames['display'].document.getElementsByTagName('body')[0].replaceChild(scriptEle, oldScript);
  } else {
    scriptEle.innerHTML = jsVal;
    par = frames['display'].document.getElementsByTagName('body')[0];
    par.appendChild(scriptEle);
  }

  par = frames['display'].document.getElementsByTagName('style')[0];
   par.innerHTML = defaultCSSVal + cssVal;       
}

var appendObjects = function() {
  var par = frames['display'].document.getElementsByTagName('body')[0];
  par.appendChild(includes);
  par = frames['display'].document.getElementsByTagName('head')[0];
  par.appendChild(cssEle);
}