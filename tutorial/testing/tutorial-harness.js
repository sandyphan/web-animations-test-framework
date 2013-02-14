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
 *
 * Written by Sandy Phan.
 */

var head = document.getElementsByTagName('head')[0];

// pass in the name of the website as the title
// scripts is optional, only pass in scripts when
// there are scripts to be inlcuded inside the page
// scripts and styles can be either strings or arrays
var generateLayout = function(webTitle, styles, scripts) {
  var body = document.body;
  var main = createObject('div', 'main', '', 'id');
  var title = createObject('div', 'title', webTitle, 'id');
  var line = createObject('div', 'line-separator', '', 'class');
  var line2 = createObject('div', 'line-separator', '', 'class');
  var content = createObject('div', 'content', '', 'class');

  main.appendChild(title);
  main.appendChild(line);
  main.appendChild(content);
  main.appendChild(line2);
  body.insertBefore(main, document.getElementsByTagName('script'));

  if (scripts)
  	addScripts(scripts);
  if (styles)
  	addStyles(styles);
  return(document.body);
}

// This appends the passed in scripts into
// <head>
var addScripts = function(scripts) {
  // console.log(scripts);
  var script = document.createElement('script');
  script.type = 'text/Javascript';
  if (typeof scripts === 'string') {
  	// console.log('scripts is a string');
    script.src = scripts;
    head.appendChild(script);
  } else {
  	// console.log('scripts is an array');
    for (var i = 0; i < scripts.length; i++) {
  	  script.src = scripts[i];
  	  head.appendChild(script);
      script = document.createElement('script');
  	}
  }
}

// This appends the passed in styles
// into <head>
var addStyles = function(styles) {
  var style = document.createElement('link');
  style.rel = 'stylesheet';
  style.type = 'text/css';
  if (typeof styles === 'string') {
    style.href = styles;
    head.appendChild(style);
  } else {
    for (var i = 0; i < styles.length; i++) {
  	  style.href = styles[i];
  	  head.appendChild(style);
  	}
  }
}

// This creates and return a HTML element.
// Specify the type of element to create,
// the name for identification and the inner text
// of the element.
// 'text' can be null which will append nothing to
// the element.
var createObject = function(type, name, text, identifier) {
  var elem = document.createElement(type);
  if (identifier)
    elem.setAttribute(identifier, name);
  elem.innerHTML = text;
  return elem;
}

// Creates a menu bar according to the menuType being
// passed in. 'menuType' can be 'top' or 'side'.
// 'top' menuType will be automatically classed as 'topMenu'
// 'side' menuType will be automatically classed as 'sideMenu'
// 'names' and 'links' should be arrays.
// 'names' are being assigned to the innerHTML of <a>
// 'links' are being assigned to the 'href' or <a>
var createMenu = function(names, links, menuType) {
  var ul;
  if (menuType == 'top')
    ul = createObject('ul', 'topMenu', '', 'class');
  else if (menuType == 'side')
    ul = createObject('ul', 'sideMenu', '', 'class');

  for (var i = 0; i < names.length; i++) {
    ul = addItems(ul, names[i], links[i]);
  }

  if (ul.className == 'sideMenu') {
    ul.childNodes[0].id = 'menuLabel';
  }
  document.body.insertBefore(ul, document.getElementById('main'));
};

// This function searches for a button with the same name
// as 'parentName' and append a new sub-menu bar into this button
// 'menuType' is passed in to specify which menu to look into rather
// than look into both menu bars if both existed.
var createSubMenu = function(parentName, menuType, names, links) {
  var ul = createObject('ul', 'subMenu', '', 'class');
  var menu;
  if (menuType == 'top') {
    menu = document.querySelector('.topMenu');
  } else if (menuType == 'side') {
    menu = document.querySelector('.sideMenu');
  }

  for (var i = 0; i < menu.childNodes.length; i++) {
    var child = menu.childNodes[i].childNodes[0];

    if (child.innerHTML == parentName) {
      for (var j = 0; j < names.length; j++)
        addItems(ul, names[j], links[j]);

      child.appendChild(ul);
      return;
    }
  }
};

// This add a list of <li> items with passed in
// name and link and append the newly created <li>
// to the passed in parent.
// For side menu bars, links are not required,
// therefore, 'link' is not being used.
var addItems = function(parent, name, link) {
  var li = document.createElement('li');
  var a = document.createElement('a');
  if (link) {
    a.setAttribute('href', link);
    a.innerHTML = name;
    li.appendChild(a);
  } else if (parent.className == 'sideMenu') {
    li.innerHTML = name;
  }

  parent.appendChild(li);
  return parent;
};

/*
 * Get the current topic of tutorial the user is in
 * E.g. If the user is currently at basic-animation.html
 * currentSection will equals to basic-animation.
 * This variable is used to determine the name of a file.
 * E.g. To get the name of the exercise 1 of basic-animation
 * would add currentSection to '-exercise-' and the number 
 * in the <li> being clicked
 */
var currentSection = window.location.href.split('/').pop();
currentSection = currentSection.split('.')[0];
var exerciseNum;



// waits until all DOM elements are ready to perform
$(document.body).ready(function() {
  // load_json_content();
  if (currentSection == 'references')
    loadReferences();
  else {
    $('.sideMenu li').click(function(e) {
      exerciseNum = $(this).html().split(' ')[1];
      if (parseInt(exerciseNum) !== exerciseNum && isNaN(exerciseNum)) {
       load_json_content(currentSection);
      } else {
        load_json_content(currentSection + '-exercise-' + exerciseNum);
      }
    });
  }
});

var loadReferences = function() {
  $(document.body).ready(function() {
    $('.description li').click(function(e) {
      var url = $(this).html().split('(')[0];
      url = url.replace(' ', '');
      $.ajax({
        url: url + '.html',
        type: 'HEAD',
        success: function() {
          $('.content').load(url + ' .content', function() {
            $(this).children().unwrap();
          });
        }
      });
    });
  });
}

// this loads the editor dynamically into page content
var loadEditor = function() {
  var html = '', currentId = 'a';

 var animNum = findDivNum();
  // Generate a number of animation divs according to
  // the requirements of the exercise
  // such as in sequence section.
  // This is specific for Web Animation Tutorials.
  for (var i = 0; i < animNum; i++) {
    html += '<div id=\"' + currentId + '\" class=\"anim\"></div>' + '\n';
    currentId = nextId(currentId);
  }

  // create a new editor object
  var editor = new TryItDisplay(document.getElementById("tryIt"));
  editor.setDefaultHtml(html);

  // common css for all divs
  var css = '.anim {' + 
    '\n' + 'background-color: red;' + 
    '\n' + 'border-radius: 10px;' + 
    '\n' + 'width: 100px;' + 
    '\n' + 'height: 50px;' + 
    '\n' + 'top: 0px;' + 
    '\n' + 'left: 0px;' + 
    '\n' + 'position: relative;' + 
    '\n' + 'border: 1px solid black;' + 
    '\n' + '}';
  editor.setDefaultCss(css);
  editor.update();

  // load solutions for exercises store in json files
  // add the solutions into tests
  loadTest(exerciseNum, editor);
}

var isNumber = function(str) {
  str = parseInt(str);
  if (isNaN(str))
    return false;
  return true;
}

// check if the exercise needs more than 1
// animation divs
// by default returns 1
var findDivNum = function() {
  var value = document.querySelector('.animNum').innerHTML;
  value = parseInt(value);
  return value;
}

// generate a, b, c, d... as to put in as id
var nextId = function(currentId) {
  return String.fromCharCode(currentId.charCodeAt() + 1);
}

// load solutions using json
var loadTest = function(exerciseNum, editor) {
  var exercise = "exercise" + exerciseNum;
  var tests;
  $.getJSON("../tests-to-exercises.json")
    .success(function(data) {
      tests = data[currentSection][0][exercise];
      for (var i = 0; i < tests.length; i++) {
        editor.addCheck(tests[i].element, tests[i].property, tests[i].timeProp);
      }
    })
    .error(function(data, status, xhr) {
      console.log('Error: ' + status );
      console.log('xhr: ' + xhr);
    });
}


var load_json_content = function(content) {
  $.getJSON(currentSection + ".json")
    .success(function(data) {
      document.querySelector('.content').innerHTML = '';
      console.log(data);
      console.log(content);
      var obj = data[content];
      for (var i = 0; i < obj.length; i++) {
        traverse_json_object(obj[i], '');
      }
      loadEditor();
    })
    .error(function(data, status, xhr) {
      console.log('Error: ' + status );
      console.log('xhr: ' + xhr);
    });
}

var traverse_json_object = function(obj, className) {
  var name = className, ele;
  for (var prop in obj) {
    var flag = false;
    if (obj.hasOwnProperty(prop)) {
      name += prop;
      if (isObject(obj[prop])) {
        name += ' ';
        if (prop == 'ul' || prop == 'ol') {
          ele = loadList(obj[prop], prop);
          flag = true;
        } else if (prop == 'iframe') {
          ele = loadIframe(obj[prop]);
          flag = true;
        } else {
          traverse_json_object(obj[prop], name);
          flag = true;
        }
        document.querySelector('.content').appendChild(ele);  
        name = '';   
      }
    }
    if (flag == false) {
      if (prop == 'hideLabel' || prop == 'tryIt') {
        ele = createObject('div', name, obj[prop], 'id');
        if (prop == 'hideLabel')
          ele.setAttribute('onclick', 'toggleSolution()');
      } else {
        if (prop == 'toggleText codeSamples' || prop == 'codeSamples')
          ele = createObject('code', name, obj[prop], 'class');
        else if (prop == 'description')
          ele = createObject('p', name, obj[prop], 'class');
        else
          ele = createObject('div', name, obj[prop], 'class');
      }
      document.querySelector('.content').appendChild(ele);
    }

    name = name.replace(prop, '');
  }
}

var loadList = function(obj, type) {
  var ele;
  if (type == 'ul')
    ele = createObject('ul', 'description', '', 'class');
  if (type == 'ol')
    ele = createObject('ol', 'description', '', 'class');
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      var li = createObject('li', '', obj[prop], '');
      ele.appendChild(li);
    }
  }
  return ele;
}

var loadIframe = function(obj) {
  var iframe = createObject('iframe', obj.name, 'Your browser does not support iframes', 'class');
  iframe.src = obj.src;
  return iframe;
}

var isObject = function(data) {
  return (typeof data === 'object');
}