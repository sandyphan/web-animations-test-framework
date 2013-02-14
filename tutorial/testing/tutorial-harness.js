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