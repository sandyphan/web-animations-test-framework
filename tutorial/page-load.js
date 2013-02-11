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
var iframe, exerciseNum;

// waits until all DOM elements are ready to perform
$(document.body).ready(function() {
  if (currentSection == 'references')
    loadReferences();
  else {

    // if one of the side menu is clicked
    // update page content without refreshing the whole page.
    $('.sideMenu li').click(function(e) {
      // get the exercise number from the <li> being clicked.
      // e.g. 'Exercise 1' would return 1
      // Though 'Basic Info' would return 'Info'.
      exerciseNum = $(this).html().split(' ')[1];

      // determines if the input string is actually a number
      // if it is not then load the info page of the section
      if (parseInt(exerciseNum) !== exerciseNum && isNaN(exerciseNum)) {
        $('.content').load(currentSection + '.html' + ' .content', function() {
          $(this).children().unwrap();
        });
      } else {
        console.log("im here");
        var url = currentSection + '-exercise-' + exerciseNum + '.html';
        // checks if a file/link exist before adding contents
        // into page
        // after contents are loaded, load editor
        $.ajax({
          url: url,
          type: 'HEAD',
          success: function() {
            $('.content').load(url + ' .content', function() {
              $(this).children().unwrap();
              var animNum = findDivNum();
              loadEditor(animNum);
            });
          }
        });
      }
    });
  }
  // load_json_content();
});

var loadReferences = function() {
  $(document.body).ready(function() {
    $('.description li').click(function(e) {
      var url = $(this).html().split('(')[0];
      $.ajax({
        url: url + '.html',
        type: 'HEAD',
        success: function() {
          $('.content').load(url + ' .content', function() {
            $(this).children().unwrap();
          });
        },
      });
    });
  });
}

// this loads the editor dynamically into page content
var loadEditor = function(animNum) {
  var html = "", currentId = 'a';

  // generate a number of animation divs according to
  // the requirements of the exercise
  // such as in sequence section
  for (var i = 0; i < animNum; i++) {
    html += '<div id=\"' + currentId + '\" class=\"anim\"></div>' + '\n';
    currentId = nextId(currentId);
  }

  // create a new editor object
  var editor = new TryItDisplay(document.getElementById("tryIt"));
  editor.setDefaultHtml(html);

  // common css for all divs
  var css = '.anim {'
         +'\n' + 'background-color: red;'
         +'\n' + 'border-radius: 10px;'
         +'\n' + 'width: 100px;'
         +'\n' + 'height: 50px;'
         +'\n' + 'top: 0px;'
         +'\n' + 'left: 0px;'
         +'\n' + 'position: relative;'
         +'\n' + 'border: 1px solid black;'
         +'\n' + '}';
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
  var content = $('p').text();
  var match = content.match(/\b(\d+) different animations\b | \b(\d+) children\b | \b(\d+) different items\b/);

  if (match) {
    if (isNumber(match[0])) {
      return parseInt(match[0]);
    }
  }
  return 1;
}

// generate a, b, c, d... as to put in as id
var nextId = function(currentId) {
  return String.fromCharCode(currentId.charCodeAt() + 1);
}

// load solutions using json
var loadTest = function(exerciseNum, editor) {
  var exercise = "exercise" + exerciseNum;
  var tests;
  console.log('loading tests');
  $.getJSON("../tests-to-exercises.json")
    .success(function(data) {
      console.log(data[currentSection]);
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

/*
var load_json_content = function() {
  $.getJSON(currentSection + ".json")
    .success(function(data) {
      console.log(data["sequence-exercise-1"]);
      $.each(data, function() {
        $.each(this, function(k, v)) {
          console.log(k + " " + v);
        }
      })
    })
    .error(function(data, status, xhr) {
      console.log('Error: ' + status );
      console.log('xhr: ' + xhr);
    });
} */