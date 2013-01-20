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
  frames['display'].document.documentElement.innerHTML = htmlVal;
  
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

  console.log(frames['display'].document.getElementsByTagName('head')[0]);

  par = frames['display'].document.getElementsByTagName('style')[0];
  par.innerHTML = cssVal;       
}

var appendObjects = function() {
  var par = frames['display'].document.getElementsByTagName('body')[0];
  par.appendChild(includes);
  par = frames['display'].document.getElementsByTagName('head')[0];
  par.appendChild(cssEle);
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

/*var generateEditor = function() {
  // a wrapper for the whole try it editor section
  var tryIt = document.querySelector('#tryIt');
  console.log(tryIt);
  console.log("hey");

  // create a header banner for the editor
  // button included in the section
  var heading = document.createElement('div');
  heading.className = 'heading';
  heading.innerHTML = 'TRY IT YOURSELF';

  var updateBtn = document.createElement('button');
  updateBtn.setAttribute('onclick', 'update()');
  updateBtn.setAttribute('id', 'update');
  updateBtn.setAttribute('value', 'Update');
  heading.appendChild(updateBtn);

  tryIt.appendChild(heading);

  // create text box elements and assign
  // default values in it
  var code = document.createElement('div');
  code.className = 'code';

  var htmlLabel = document.createElement('div');
  htmlLabel.id = 'label'
  htmlLabel.innerHTML = 'HTML Code';
  code.appendChild(htmlLabel);

  var htmlCode = document.createElement('textarea');
  htmlCode.className = 'code';
  htmlCode.id ='htmlCode';
  htmlCode.innerHTML = '<html>' + '\n' + '  <head>' + '\n' + '    <style>' + '\n' + '    </style>' + '\n' + '  </head>' + '\n' + '  <body>' + '\n' + '    <div id="a" class="anim"></div>' + '\n' + '  </body>' + '\n' + '</html>';
  code.appendChild(htmlCode);

  var cssLabel = document.createElement('div');
  cssLabel.id = 'label';
  htmlLabel.innerHTML = 'CSS Code';
  code.appendChild(cssLabel);

  var cssCode = document.createElement('textarea');
  cssCode.className = 'code';
  cssCode.id = 'cssCode';
  cssCode.innerHTML = '.test {' + '\n' + '  background-color: red;' + '\n' + '  border-radius: 10px;' + '\n' + '  width: 100px;' + '\n' + '  height: 50px;' + '\n' + '  top: 0px;' + '\n' + 'left: 0px;' + '\n' + '}';
  code.appendChild(cssCode);

  var jsLabel = document.createElement('div');
  jsLabel.className = 'label';
  jsLabel.innerHTML = 'Javascript Code';
  code.appendChild(jsLabel);

  var jsCode = document.createElement('textarea');
  jsCode.className = 'code';
  jsCode.id = 'jsCode';
  code.appendChild(jsCode);

  tryIt.appendChild(code);

  // create iframe and append to the section
  var iframe = document.createElement('iframe');
  iframe.id = 'display';
  tryIt.appendChild(iframe);
}*/