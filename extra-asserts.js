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
 - Change the pause method for flashing so it doesn't rely on par groups. This requires the 
    ability to either globally pause or check if a animation is currently playing 
 */

var animObjects = []; //to keep track of all animations
var parentAnimation; //The parGroup all animations need to be added to
var testStack = []; //holds all tests
var refTestStack = [];//to run ref tests in manual mode
var testRefStack = []; //for iteration based checks
var runType; //to keep track of what the dropdown list state is
var state = "Auto"; //current run type of the animation
var testIndex = 0; //Holds which test packet we are up to
var testPacket = []; //Each index holds all the tests that occur at the same time

var pauseTime = 500; //how long to show each manual check for
var testTimeout = 1000; //how long it takes an individual test to timeout
var frameworkTimeout = 2000; //how long it takes for the whole test system to timeout

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
function testAnimation(a, b, c, d){
  var x = new Animation(a, b, c, d);
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
  //console.log("chheeeeee");
  if(testStack.length == 0 && refTestStack.length == 0) reparent();
  //Create new async test
  var test = async_test(message);
  test.timeout_length = testTimeout;
  //store the inital css style of the animated object so it can be used for manual flashing
  var css = object.currentStyle || getComputedStyle(object, null);
  var offsets = [];
  offsets["top"] = getOffset(object).top - parseInt(css.top);
  offsets["left"] = getOffset(object).left- parseInt(css.left);
  if(property[0] == "refTest"){
    var maxTime = document.animationTimeline.children[0].animationDuration;
    //generate a test for each time you want to check the objects
    for(var x = 0; x < maxTime/time; x++){
      var temp = new testRecord(test, object, property, target, time*x, "Property "+property+" is not equal to "+target, css, offsets, true);
      if(state == "Auto") testStack.push(temp);
      else refTestStack.push(temp);
    }
    var temp = new testRecord(test, object, property, target, time*x, "Property "+property+" is not equal to "+target, css, offsets, "Last refTest");
    if(state == "Auto") testStack.push(temp);
    else refTestStack.push(temp);  
  } else {
    testStack.push(new testRecord(test, object, property, target, time, "Property "+property+" is not equal to "+target, css, offsets, false));
  }
}

function reparent(){
  //Put all the animations into a par group to get around global pause issue/bug
  //console.log(document.animationTimeline.children);
  var childList = [];
  for (var i = 0; i < document.animationTimeline.children.length; i++) {
    childList.push(document.animationTimeline.children[i]);
  }
  //parentAnimation = new ParGroup(document.animationTimeline.children);
  parentAnimation = new ParGroup(childList);
  //console.log(document.animationTimeline.children);
}

//Call this after lining up the tests with check
//For auto state: It is called each frame render to run the currently loaded test
//For manual state: It sets up the appropiate timeout for each group of tests that happen at the same time
function runTests(){
  if(testStack.length == 0 && refTestStack.length == 0) reparent();
  //Start the animation time running on screen
  window.webkitRequestAnimationFrame(function(){animTimeViewer();});
  //process tests
  //Sort tests by time to set up timeouts properly
  testStack.sort(testTimeSort);
  refTestStack.sort(testTimeSort);
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
    //Start running the refTests
    refTestRunner();
    testIndex = 0;
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
    // for(x in animObjects){
    //   //animObjects[x]["currentTime"] = testPacket[testIndex][0].time;
    // }
    document.animationTimeline.children[0].currentTime = testPacket[testIndex][0].time;
    testIndex++;
    window.webkitRequestAnimationFrame(function(){runAutoTest();});
  } else {
    parentAnimation.pause();
    done();
  }
}

function animTimeViewer(){
  var currTime = document.animationTimeline.children[0].iterationTime; 
  //console.log(document.animationTimeline.children[0]);
  //currTime = currTime.toFixed(2);
  var object = document.getElementById("animViewerText");
  var comp = object.currentStyle || getComputedStyle(object, null);
  object.innerHTML = "Current animation time " + currTime;
  window.webkitRequestAnimationFrame(function(){animTimeViewer();});
}

//Running setTimeout for ref tests which the iteration time too small cause the other tests
//to lag, causing them to fail. This method should test as often as auto (no more or no less)
function refTestRunner(index){
  if(index == null) index = 0;
  //as soon as the current frame time is over a ref test then pop it off and run the test
  var doNextTest = false;
  if(refTestStack.length > 0) doNextTest = true;
  while(doNextTest && index < refTestStack.length){
    var currTest = refTestStack[index];
    if(currTest.time <= document.animationTimeline.children[0].iterationTime){
      //console.log(currTest);
      doNextTest = true;
      //console.log(currTest.object);
      //console.log(currTest.target);
      currTest.test.step(function (){
        assert_properties(currTest.object, currTest.property, currTest.target, currTest.message);
      });
      if(currTest.isRefTest == "Last refTest") currTest.test.done();
      index++;
    } else {
      doNextTest = false;
    }
  }
  if(index < refTestStack.length) window.webkitRequestAnimationFrame(function(){refTestRunner(index);});
}

function restart(){
  state = runType.options[runType.selectedIndex].value; //Only gets updated on init and Restart button push
  var url = window.location.href.split("?");
  window.location.href = url[0] + "?" + state;
}

// create divs at appropriate locations and flash the divs for manual testing
function flashing(test) {
  parentAnimation.pause();
  var type = test.object.nodeName;

  //Create a new object of the same type as the thing being tested
  if(type == "DIV") var flash = document.createElement('div');
  else {
    var flash = document.createElementNS("http://www.w3.org/2000/svg", type);
  }
   
  console.log(flash);

  if(type == "DIV") document.getElementById("test").appendChild(flash);
  else document.getElementsByTagName("svg")[0].appendChild(flash);

  if(type == "DIV"){
    flash.style.cssText = test.cssStyle.cssText; //copy the objects orginal css style
    flash.style.position = "absolute";
  } else {
    console.log("banana");
    for(var x = 0; x < test.object.attributes.length; x++){
      flash.setAttribute(test.object.attributes[x].name, test.object.attributes[x].value);
    }
  }
  
  var seenTop = false;
  var seenLeft = false;
  for(var x= 0; x < test.property.length; x++){ 
    if(test.property[0] == "refTest"){
      x++;
      var comp = test.target.currentStyle || getComputedStyle(test.target, null);
      var tar = comp[test.property[x]];
    } else {
      var tar = test.target[x];
    }
    var prop = test.property[x];

    if(type == "DIV"){
      if(test.cssStyle.position == "relative"){
        if(prop == "left"){
          seenLeft = true;
          tar = parseInt(tar);
          tar += parseInt(test.offsets["left"]);
          tar = tar + "px";
        } else if(prop == "top"){
          seenTop = true;
          tar = parseInt(tar);
          tar += parseInt(test.offsets["top"]);
          tar = tar + "px";
        }
      } else {
        if(prop == "left") seenLeft = true;
        else if(prop == "top") seenTop = true;
      }
      flash.style[prop] = tar;
    } else {
        flash.setAttribute(prop, tar);
    }
  }
  
  if(type == "DIV"){
    if(!seenTop){
      flash.style.top = getOffset(test.object).top+"px";
    }
    if(!seenLeft){
      flash.style.left = getOffset(test.object).left+"px";
    }
  }
  
  //Set up the border
  if(type == "DIV"){
    if(test.property[0] == "refTest") flash.style.borderColor = 'black';
    else flash.style.borderColor = 'black';
    flash.style.borderWidth = 'thick';
    flash.style.borderStyle = 'solid';
    flash.style.opacity = 1;
  } else {
    flash.setAttribute("stroke", "black");
    flash.setAttribute("stroke-width", "5px");
  }
  
  setTimeout(function() {
    flash.parentNode.removeChild(flash);
    if(document.animationTimeline.children[0].iterationTime 
        < document.animationTimeline.children[0].animationDuration - 0.01) parentAnimation.play();
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
  var type = object.nodeName;
  if(type == "DIV"){
    var comp = object.currentStyle || getComputedStyle(object, null);
    if(props[0] == "refTest"){
      var tar = targets.currentStyle || getComputedStyle(targets, null);
      for(var i = 1; i < props.length; i++){
        assert_approx_equals(parseInt(comp[props[i]]), parseInt(tar[props[i]]), 3, message);
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
  } else {
    console.log("it's a svg image");
    for(var x in props){
      assert_approx_equals(parseInt(object.attributes[props[x]].value), parseInt(targets[x]), 10, message);
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