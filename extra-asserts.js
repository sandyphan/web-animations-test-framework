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
 /*TO DO:
 - incorperate object notation (JSON) varibles for the test so it is easier to call
 - Add being able to change the timeouts via setupTests
 */

var animObjects = []; //to keep track of all animations
var testStack = []; //holds all tests
var testRefStack = []; //for iteration based checks
var runType; //to keep track of what the dropdown list state is
var state = "Auto"; //current run type of the animation
var testIndex = 0; //Holds which test packet we are up to
var testPacket = []; //Each index holds all the tests that occur at the same time

var pauseTime = 500; //how long to show each manual check for
var testTimeout = 1000; //how long it takes an individual test to timeout
var frameworkTimeout = 20000; //how long it takes for the whole test system to timeout

function testRecord(test, object, property, target, time, message, cssStyle, offsets, isRefTest){
  this.test = test;
  this.object = object;
  this.property = property;
  this.target = target;
  this.time = time;
  this.message = message;
  this.cssStyle = cssStyle;
  this.offsets = offsets;
  this.isRefTest = isRefTest;
}

//a wrapper to add each animation to an array
function testAnimation(a, b, c){
  var x = new Animation(a, b, c);
  x.pause();
  animObjects.push(x);
  return x;
}

//Call this function before setting up any checks
//It generates the testing buttons and log and the testharness setup
function setupTests(timeouts){
  //Use any user stated timeouts
  var supportedProperties = [];
  supportedProperties["frameworkTimeout"] = 0;
  supportedProperties["testTimeout"] = 0;
  for (var candidate in timeouts) {
    if (supportedProperties.hasOwnProperty(candidate)) {
      if(candidate == "frameworkTimeout") frameworkTimeout = timeouts.frameworkTimeout;
      else testTimeout = timeouts.testTimeout;
    }
  }
  
  //Set up padding for option bar
  var padding = document.createElement('div');
  padding.id ="padding";
  padding.style.height = "30px";
  document.body.appendChild(padding);

  //generate options bar
  var optionBar = document.createElement('div');
  optionBar.id ="options";
  var select = document.createElement("select");
  select.setAttribute("id", "runType");
  var button = document.createElement("button");
  button.setAttribute("type", "button");
  button.setAttribute("onclick", "restart()");
  button.innerHTML = "Restart";
  var timeOfAnimation = document.createElement('div');
  timeOfAnimation.id = "animViewerText";
  timeOfAnimation.innerHTML = "Current animation time: 0.00";
  document.body.appendChild(optionBar);
  document.getElementById("options").appendChild(select);
  document.getElementById("options").appendChild(button);
  document.getElementById("options").appendChild(timeOfAnimation);

  //Generate the log div
  var log = document.createElement('div');
  log.id ="log";
  document.getElementById("options").appendChild(log);

  //Set buttons
  runType = document.getElementById("runType");
  runType.options[runType.options.length] = new Option('Auto Run', 'Auto');
  runType.options[runType.options.length] = new Option('Manual Run', 'Manual');
  state = window.location.href.split("?")[1];
  
  //Initalse state and setup
  if(state == "Manual") runType.selectedIndex = 1;
  else {
    state = "Auto";
    runType.selectedIndex = 0;
  }
  setup({ explicit_done: true, timeout: frameworkTimeout});
}

//Adds each test to a list to be processed when runTests is called
function check(object, property, target, time, message){
  //Create new async test
  var test = async_test(message);
  test.timeout_length = testTimeout;
  //store the inital css style of the animated object so it can be used for manual flashing
  var css = object.currentStyle || getComputedStyle(object, null);
  var offsets = [];
  offsets["top"] = getOffset(object).top - parseInt(css.top);
  offsets["left"] = getOffset(object).left- parseInt(css.left);
  if(property[0] == "refTest"){
    var maxTime = 0; 
    for(x in animObjects){
      maxTime = animObjects[x].animationDuration > maxTime ? animObjects[x].animationDuration : maxTime;
    }
    //generate a test for each time you want to check the objects
    for(var x = 0; x < maxTime/time; x++){
      testStack.push(new testRecord(test, object, property, target, time*x, "Property "+property+" is not equal to "+target, css, offsets, true));
    }
    testStack.push(new testRecord(test, object, property, target, time*x, "Property "+property+" is not equal to "+target, css, offsets, "Last refTest"));   
  } else {
    testStack.push(new testRecord(test, object, property, target, time, "Property "+property+" is not equal to "+target, css, offsets, false));
  }
}

//Call this after lining up the tests with check
//For auto state: It is called each frame render to run the currently loaded test
//For manual state: It sets up the appropiate timeout for each group of tests that happen at the same time
function runTests(){
  //Start the animation time running on screen
  window.webkitRequestAnimationFrame(function(){animTimeViewer();});
  //process tests
  //Sort tests by time to set up timeouts properly
  testStack.sort(testTimeSort);
  for(var x =0; x<testStack.length; x++){
    //check for all tests that happen at the same time
    //And add them to the test packet
    testPacket[testIndex] = [];
    testPacket[testIndex].push(testStack[x]);
    while(x < (testStack.length-1)){
      if(testStack[x].time == testStack[x+1].time){
        x++;
        testPacket[testIndex].push(testStack[x]);
      } else break;
    }
    testIndex++;
  }

  if(state == "Auto"){
    testIndex = 0;
    runAutoTest();
  } else {
    //Set up a timeout for each test
    for(testIndex = 0; testIndex<testPacket.length; testIndex++){
      if(testPacket[testIndex][0].time == 0 ) testPacket[testIndex][0].time += 0.02;
      setTimeout(function() {
        for(x in testPacket[testIndex]){
          var currTest = testPacket[testIndex][x];
          currTest.test.step(function() {
            assert_properties(currTest.object, currTest.property, currTest.target, currTest.message);
          });
          if(currTest.isRefTest == false || currTest.isRefTest == "Last refTest") currTest.test.done();
          flashing(currTest);
        }
        testIndex++;
      }, (testPacket[testIndex][0].time * 1000)+(pauseTime * testIndex));
    }
    //Create a timeout to finish the tests
    setTimeout(function() {
      done();
    }, (testPacket[testIndex-1][0].time * 1000)+(pauseTime * testIndex)+500);

    testIndex = 0;
    //start all the animations running
    for(x in animObjects){
      animObjects[x]["currentTime"] = 0;
      animObjects[x].play();
    }
  }
}

function testTimeSort(a,b){
  return(a.time - b.time);
}

function runAutoTest(){
  //if currTest isn't null then do the test for it
  if(testIndex != 0 && testIndex < testPacket.length + 1){
    for(var x in testPacket[testIndex-1]){
      var currTest = testPacket[testIndex-1][x];
      currTest.test.step(function (){
        assert_properties(currTest.object, currTest.property, currTest.target, currTest.message);
      });
      if(currTest.isRefTest == false || currTest.isRefTest == "Last refTest") currTest.test.done();
    }
  }
  if(testIndex < testPacket.length){
    //move the entire animation to the right point in time

    //enough to let the first frame render
    //stops bug: where at time zero if x is blue then is told to animate from red to green
    //and a check is performed at time zero for color red it checked when x was still blue
    if(testPacket[testIndex][0].time == 0 ){
      testPacket[testIndex][0].time += 0.02;
    } 
    for(x in animObjects){
      animObjects[x]["currentTime"] = testPacket[testIndex][0].time;
    }
    testIndex++;
    window.webkitRequestAnimationFrame(function(){runAutoTest();});
  } else {
    done();
  }
}

function animTimeViewer(){
  console.log(animObjects);
  var currTime = animObjects[0].currentTime < animObjects[0].animationDuration ? animObjects[0].currentTime : animObjects[0].animationDuration;
  currTime = currTime.toFixed(2);
  var object = document.getElementById("animViewerText");
  var comp = object.currentStyle || getComputedStyle(object, null);
  object.innerHTML = "Current animation time " + currTime;
  window.webkitRequestAnimationFrame(function(){animTimeViewer();});
}

function restart(){
  state = runType.options[runType.selectedIndex].value; //Only gets updated on init and Restart button push
  var url = window.location.href.split("?");
  window.location.href = url[0] + "?" + state;
}

// create divs at appropriate locations and flash the divs for manual testing
function flashing(test) {
  //pause all animations
  for(x in animObjects){
    animObjects[x].pause();
  }

  var _newDiv = document.createElement('div');
  document.getElementById("test").appendChild(_newDiv);
  _newDiv.style.cssText = test.cssStyle.cssText; //copy the objects orginal css style
  _newDiv.style.position = "absolute";

  var seenTop = false;
  var seenLeft = false;
  for(x in test.property){
    var prop = test.property[x];
    var tar = test.target[x];
    if(test.cssStyle.position == "relative"){
      console.log("Bam");
      if(prop == "left"){
        seenLeft = true;
        tar = parseInt(tar);
        tar += parseInt(test.offsets["left"]);
        console.log("ggg "+tar);
        tar = tar + "px";
      } else if(prop == "top"){
        seenTop = true;
        tar = parseInt(tar);
        tar += parseInt(test.offsets["top"]);
        tar = tar + "px";
      }
    }
    console.log(tar + " " + test.target[x]);
    _newDiv.style[prop] = tar;
  }
  
  if(!seenTop){
    _newDiv.style.top = getOffset(test.object).top+"px";
  }
  if(!seenLeft){
    _newDiv.style.left = getOffset(test.object).left+"px";
  }

  //Set up the border
  _newDiv.style.borderColor = 'black';
  _newDiv.style.borderWidth = 'thick';
  _newDiv.style.borderStyle = 'solid';
  _newDiv.style.opacity = 1;

  setTimeout(function() {
    _newDiv.parentNode.removeChild(_newDiv);
    for(x in animObjects){
      if(animObjects[x]["currentTime"] < animObjects[x]["animationDuration"]){
        animObjects[x].play();
      }
    }
  }, pauseTime);
}

//Helper function which gets the current absolute position of an object
//Shamelessly stolen from http://stackoverflow.com/questions/442404/dynamically-retrieve-the-position-x-y-of-an-html-element
function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}


/////////////////////////////////////////////////////////////////////////
//  All asserts below here                                             //
/////////////////////////////////////////////////////////////////////////

//allows you to choose any combination of single number css properties to 
//approximatly check if they are correct e.g checks width, top
//works for colour but other worded/multinumbered properties might not work
//specify your own epsilons if you want or leave for default
function assert_properties(object, props, targets, message, epsilons){
  var comp = object.currentStyle || getComputedStyle(object, null);
  if(props[0] == "refTest"){
    var tar = targets.currentStyle || getComputedStyle(targets, null);
    for(var i = 1; i < props.length; i++){
      assert_equals(comp[props[i]], tar[props[i]], message);
    }
  } else {
    for(var i = 0; i < props.length; i++){
      if(props[i].indexOf("olor") != -1){ //for anything with the word color in it do the color assert (C is not there because it could be a c or C)
        assert_color(object, targets[i], message);
      } else {
        assert_approx_equals(parseInt(comp[props[i]]), parseInt(targets[i]), 10, message);
      }
    }
  }
}

//Pass in either the css colour name to expectedColor OR 
//a rbg string e.g. "0,0,0". Each number must be separated by a comma
function assert_color(component, expectedColor, message) {
  var params = document.defaultView.getComputedStyle(component, null);
  var color = params.backgroundColor;
  color = color.replace(/[^0-9,]/g, "");
  var rgbValues = color.split(",");

  var parsedColor = expectedColor.replace(/[^0-9,]/g, "");
  if(parsedColor.length != 0) expectedColor = parsedColor.split(",");
  else expectedColor = convertToRgb(expectedColor);

  assert_approx_equals(parseInt(rgbValues[0]), expectedColor[0], 12, "red " +message);
  assert_approx_equals(parseInt(rgbValues[1]), expectedColor[1], 12, "green " +message);
  assert_approx_equals(parseInt(rgbValues[2]), expectedColor[2], 12, "blue " +message);
}

//This whole function is kind of hacky... unsure how to do this properly. Suggestions?
function convertToRgb(englishColor) {
    var tempDiv = document.createElement("div");
    document.querySelector("#log").appendChild(tempDiv); 
    tempDiv.style.backgroundColor = englishColor;
    var p = document.defaultView.getComputedStyle(tempDiv, null);
    var color = p.backgroundColor;
    color = color.replace(/[^0-9,]/g, "");
    var rgbValues = color.split(",");
    tempDiv.remove(); 
    return rgbValues;
}