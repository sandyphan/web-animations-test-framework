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
 /*Features: Just the menu bars and the page structure
 */

(function() {
// To keep track of what the dropdown list state is.
var runType;
// The current run type of the animation.
var state = "Auto";

// How long it takes an individual test to timeout.
var testTimeout = 10000;
// How long it takes for the whole test system to timeout.
var frameworkTimeout = 20000;

// Call this function before setting up any checks.
// It generates the testing buttons and log and the testharness setup.
function setupTests(timeouts){
  // Use any user stated timeouts
  for (var x in timeouts) {
    if (timeouts[x] == "frameworkTimeout") frameworkTimeout = timeouts[x];
    else if (timeouts[x] == "testTimeout") testTimeout = timeouts[x];
  }

  // Set up padding for option bar
  var padding = document.createElement('div');
  padding.id = "padding";
  padding.style.height = "30px";
  document.body.appendChild(padding);

  // Generate options bar
  var optionBar = document.createElement('div');
  optionBar.id = "options";
  var select = document.createElement("select");
  select.setAttribute("id", "runType");
  var button = document.createElement("button");
  button.setAttribute("type", "button");
  button.setAttribute("onclick", "restart()");
  button.innerHTML = "Restart";
  document.body.appendChild(optionBar);
  document.getElementById("options").appendChild(select);
  document.getElementById("options").appendChild(button);

  // Generate the log div
  var log = document.createElement('div');
  log.id = "log";
  document.getElementById("options").appendChild(log);

  // Set buttons
  runType = document.getElementById("runType");
  runType.options[runType.options.length] =
      new Option('Auto Run', 'Auto');
  runType.options[runType.options.length] =
      new Option('Manual Run', 'Manual');
  setState(window.location.href.split("?")[1]);

  // Initalse state and setup
  if (state == "Manual") runType.selectedIndex = 1;
  else {
    state = "Auto";
    runType.selectedIndex = 0;
  }
  setup({ explicit_done: true, timeout: frameworkTimeout});
}

// Allows tutorial harness to edit state
function setState(newState){
  state = newState;
}

// Adds each test to a list to be processed when runTests is called.
function check(object, targets, time, message){
}

//Call this after lining up the tests with check
function runTests(){
}

function restart(){
  // State only gets updated on init and Restart button push.
  setState(runType.options[runType.selectedIndex].value);
  var url = window.location.href.split("?");
  window.location.href = url[0] + "?" + state;
}

///////////////////////////////////////////////////////////////////////////////
//  Exposing functions to be accessed externally                             //
///////////////////////////////////////////////////////////////////////////////
window.setupTests = setupTests;
window.check = check;
window.runTests = runTests;
window.restart = restart;
window.setState = setState;
})();