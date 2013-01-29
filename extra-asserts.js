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
 /*TODO:
 - incorperate object notation (JSON) varibles for the test so it is easier to call
 - Change the pause method for flashing so it doesn't rely on par groups. This requires the 
    ability to either globally pause or check if a animation is currently playing
 - Make sure this is compatible with all browsers
 - handle refTests + JSON better
 * Features to Add
 *  - Templates
 */

var animObjects = []; //to keep track of all animations
var parentAnimation; //The parGroup all animations need to be added to
var testStack = []; //holds all tests
var runType; //to keep track of what the dropdown list state is
var state = "Auto"; //current run type of the animation
var testIndex = 0; //Holds which test packet we are up to
var testPacket = []; //Each index holds all the tests that occur at the same time

var pauseTime = 500; //how long to show each manual check for
var testTimeout = 10000; //how long it takes an individual test to timeout
var frameworkTimeout = 20000; //how long it takes for the whole test system to timeout

function testRecord(test, object, targets, time, message, cssStyle, offsets, isRefTest){
  this.test = test;
  this.object = object;
  this.targets = targets;
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
function check(object, targets, time, message){
  if(testStack.length == 0) reparent();
  //Create new async test
  var test = async_test(message);
  test.timeout_length = testTimeout;
  //store the inital css style of the animated object so it can be used for manual flashing
  var css = object.currentStyle || getComputedStyle(object, null);
  var offsets = [];
  offsets["top"] = getOffset(object).top - parseInt(css.top);
  offsets["left"] = getOffset(object).left- parseInt(css.left);
  console.log(targets.refTest);
  if(targets.refTest == true){
    var maxTime = document.animationTimeline.children[0].animationDuration;
    //generate a test for each time you want to check the objects
    for(var x = 0; x < maxTime/time; x++){
      var temp = new testRecord(test, object, targets, time*x, "Property "+targets+" is not satisfied", css, offsets, true);
      testStack.push(temp);
    }
    var temp = new testRecord(test, object, targets, time*x, "Property "+targets+" is not satisfied", css, offsets, "Last refTest");
    testStack.push(temp);
  } else testStack.push(new testRecord(test, object, targets, time, "Property "+targets+" is not satisfied", css, offsets, false));
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

//Put all the animations into a par group to get around global pause issue/bug
function reparent(){
  var childList = [];
  for (var i = 0; i < document.animationTimeline.children.length; i++) {
    childList.push(document.animationTimeline.children[i]);
  }
  parentAnimation = new ParGroup(childList);
}

//Call this after lining up the tests with check
function runTests(){
  if(testStack.length == 0 && refTestStack.length == 0) reparent();
  animTimeViewer();
  sortTests();
  if(state == "Manual") testRunner();
  else autoTestRunner();
}

function animTimeViewer(){
  var currTime = document.animationTimeline.children[0].iterationTime; 
  if(currTime != null) currTime = currTime.toFixed(2);
  else currTime = 0.00;
  var object = document.getElementById("animViewerText");
  var comp = object.currentStyle || getComputedStyle(object, null);
  object.innerHTML = "Current animation time " + currTime;
  window.webkitRequestAnimationFrame(function(){animTimeViewer();});
}

function sortTests(){
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
  testIndex = 0;
}

function testTimeSort(a,b) {return(a.time - b.time)};

function testRunner(index){
  if(index == null) index = 0;
  var doNextTest = false;
  if(testStack.length > 0) doNextTest = true;
  while(doNextTest && index < testStack.length){
    var currTest = testStack[index];
    if(currTest.time > document.animationTimeline.children[0].animationDuration) currTest.time = document.animationTimeline.children[0].animationDuration;
    if(currTest.time <= document.animationTimeline.children[0].iterationTime){
      doNextTest = true;
      currTest.test.step(function (){
        assert_properties(currTest.object, currTest.targets, currTest.message);
      });
      if(currTest.isRefTest == "Last refTest" || currTest.isRefTest == false) currTest.test.done();
      //if(currTest.isRefTest == false) flashing(currTest);
      index++;
    } else {
      doNextTest = false;
    }
  }
  if(index < testStack.length) window.webkitRequestAnimationFrame(function(){testRunner(index);});
  else done();
}

function autoTestRunner(){
  if(testIndex != 0 && testIndex < testPacket.length + 1){
    for(var x in testPacket[testIndex-1]){
      var currTest = testPacket[testIndex-1][x];
      currTest.test.step(function (){
        assert_properties(currTest.object, currTest.targets, currTest.message);
      });
      if(currTest.isRefTest == false || currTest.isRefTest == "Last refTest") currTest.test.done();
    }
  }
  if(testIndex < testPacket.length){
    //enough to let the first anim frame render
    if(testPacket[testIndex][0].time == 0) testPacket[testIndex][0].time += 0.02;
    document.animationTimeline.children[0].currentTime = testPacket[testIndex][0].time;
    testIndex++;
    window.webkitRequestAnimationFrame(function(){autoTestRunner();});
  } else {
    parentAnimation.pause();
    done();
  }
}

function restart(){
  state = runType.options[runType.selectedIndex].value; //Only gets updated on init and Restart button push
  var url = window.location.href.split("?");
  window.location.href = url[0] + "?" + state;
}

// create elements at appropriate locations and flash the elements for manual testing
function flashing(test) {
  parentAnimation.pause();
  var type = test.object.nodeName;

  //Create a new object of the same type as the thing being tested
  if(type == "DIV") var flash = document.createElement('div');
  else var flash = document.createElementNS("http://www.w3.org/2000/svg", type);
   
  if(type == "DIV") document.getElementById("test").appendChild(flash);
  else document.getElementsByTagName("svg")[0].appendChild(flash);

  if(type == "DIV"){
    flash.style.cssText = test.cssStyle.cssText; //copy the objects orginal css style
    flash.style.position = "absolute";
  } else {
    for(var x = 0; x < test.object.attributes.length; x++){
      flash.setAttribute(test.object.attributes[x].name, test.object.attributes[x].value);
    }
  }
  
  var seenTop = false;
  var seenLeft = false;
  for(var x= 0; x < test.property.length; x++){ 
    var tar = test.target[x];
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
      if(prop == "style") prop = "-webkit-transform";
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

/////////////////////////////////////////////////////////////////////////
//  All asserts below here                                             //
/////////////////////////////////////////////////////////////////////////

//allows you to choose any combination of single number css properties to 
//approximatly check if they are correct e.g checks width, top
//works for colour but other worded/multinumbered properties might not work
//specify your own epsilons if you want or leave for default
function assert_properties(object, targets, message, epsilons){
  console.log("watch now");
  console.log(targets);
  

  //make fake object
  var tempOb = document.createElement(object.nodeName);
  document.querySelector("#log").appendChild(tempOb); 

  //apply properties to it
  for(var propName in targets){
    console.log(propName);
    console.log(targets[propName]);
    tempOb.style[propName] = targets[propName];
  }
  
  var p = document.defaultView.getComputedStyle(tempOb, null);
  var color = p.backgroundColor;
  color = color.replace(/[^0-9,]/g, "");
  var rgbValues = color.split(",");

  //read back properties and compare to objects current properties
  for(var propName in targets){
    console.log(propName);
    console.log(targets[propName]);
    tempOb.style[propName] = targets[propName];
  }
  //clean up
  tempOb.remove();
  
  assert_true(true);
  // var type = object.nodeName;
  // var isSVG = (type != "DIV");
  // var comp = object.currentStyle || getComputedStyle(object, null);
  // var i = 0;
  // var isRefTest = (props[0] == "refTest");
  // if(isRefTest) {
  //   var tar = targets.currentStyle || getComputedStyle(targets, null);
  //   i = 1;
  // }
  
  // for(; i < props.length; i++){
  //   //for anything with the word color in it do the color assert (C is not there because it could be a c or C)
  // 	if(props[i].indexOf("olor") != -1){ 
  // 	  assert_color(object, targets[i], message);
  // 	} else if(props[i] == "style"){
  // 	  if(isRefTest); //TODO
  // 	  else ; //TODO
  // 	  assert_transform(object, targets[i], message);
  // 	} else {
  // 	  var t = targets[i];
  // 	  var c = comp[props[i]];
  // 	  if(isRefTest) t = tar[props[i]];
  // 	  else if(isSVG) c = object.attributes[props[i]].value;
  // 	  assert_approx_equals(parseInt(c), parseInt(t), 10, message);
  // 	}
  // } 
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

//deals with transforms
//TODO: clean this mess up
function assert_transform(object, target, message){
  if(object.nodeName == "DIV"){
    var comp = object.currentStyle || getComputedStyle(object, null);
    var currStyle = comp.getPropertyValue('transform')
     || comp.getPropertyValue('-moz-transform')
     || comp.getPropertyValue('-webkit-transform')
     || comp.getPropertyValue('-ms-transform')
     || comp.getPropertyValue('-o-transform');

    //now convert the target into matrix style format
    var tempDiv = document.createElement("div");
    document.querySelector("#log").appendChild(tempDiv); 
    tempDiv.style["webkitTransform"] = target;

    var p = tempDiv.currentStyle || getComputedStyle(tempDiv, null);
    var target = p.getPropertyValue('transform')
     || p.getPropertyValue('-moz-transform')
     || p.getPropertyValue('-webkit-transform')
     || p.getPropertyValue('-ms-transform')
     || p.getPropertyValue('-o-transform');

    tempDiv.remove();

    currStyle = currStyle.replace(/[^0-9.,]/g, "");
    currStyle = currStyle.split(",");

    target = target.replace(/[^0-9.,]/g, "");
    target = target.split(",");

    for(var x in currStyle){
      if(x < 3) assert_approx_equals(Number(currStyle[x]), Number(target[x]), 0.1, message);
      else assert_approx_equals(Number(currStyle[x]), Number(target[x]), 3, message);
    }

  } else {
    var currStyle = object.attributes["style"].value;
    //currStyle = currStyle.replace(";","");
    currStyle = currStyle.split(":")[1]; //get rid of the begining webkit bit
    currStyle = currStyle.split(/[()]+/);

    target = target.split(":")[1];
    target = target.split(/[()]+/);

    var x = 0;
    while(x < currStyle.length-1){
      assert_equals(currStyle[x], target[x], message);
      x++;
      var c = currStyle[x].split(",");
      var t = target[x].split(",");
      for(var i in c){
        assert_approx_equals(parseInt(c[i]), parseInt(t[i]), 10, message);
      }
      x++;
    }
  }
}
