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


//global varibles
var animObjects = []; //to keep track of all animations
var testStack = [];
var runType; //to keep track of what the dropdown list state is
var state = "Auto"; //current run type of the animation

//objects
function testRecord(test,object, property, target, time, message, cssStyle, offsets){
  this.test = test;
  this.object = object;
  this.property = property;
  this.target = target;
  this.time = time;
  this.message = message;
  this.cssStyle = cssStyle;
  this.offsets = offsets;
}

//a wrapper to add each animation to an array
function testAnimation(a, b, c){
  var x = new Animation(a, b, c);
  x.pause();
  animObjects.push(x);
  return x;
}

function restart(){
  state = runType.options[runType.selectedIndex].value; //Only gets updated on init and Restart button push
  var url = window.location.href.split("?");
  window.location.href = url[0] + "?" + state;
}

function setupTests(){
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
  document.body.appendChild(optionBar);
  document.getElementById("options").appendChild(select);
  document.getElementById("options").appendChild(button);

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
  else runType.selectedIndex = 0;
  setup({ explicit_done: true, timeout: 7000 });
}

function check(object, property, target, time, message){
  //Create new async test
  var test = async_test(message);
  //store the inital css style of the animated object so it can be used for manual flashing
  var css = object.currentStyle || getComputedStyle(object, null);
  var offsets = [];
  offsets["top"] = getOffset(object).top;
  offsets["left"] = getOffset(object).left;
  testStack.push(new testRecord(test, object, property, target, time, "Property "+property+" is not equal to "+target, css, offsets));
}

var pauseTime = 500; //how long to show each manual check for
// create divs at appropriate locations and flash the divs
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
    if(prop == "left"){
      seenLeft = true;
      tar += parseInt(test.offsets["left"]);
    } else if(prop == "top"){
      seenTop = true;
      tar += parseInt(test.offsets["top"]);
    }
    _newDiv.style[prop] = tar + "px";
  }
  
  if(!seenTop){
    _newDiv.style.top = getOffset(test.object).top+"px";
  }
  console.log(getOffset(test.object).top);
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
      animObjects[x].play();
    }
  }, pauseTime);
}

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

var testIndex = 0;
var testPacket = [];
//call this after lining up the tests with check
function runTests(currTest){
  if(state != "Manual"){
    //if currTest isn't null then do the test for it
    if(currTest != null){
      currTest.test.step(function (){
        assert_properties(currTest.object, currTest.property, currTest.target, currTest.message);
      });
      currTest.test.done();
      console.log("test compelte");
    }
    //takes the top test off testStack
    var nextTest = testStack.pop();
    if(nextTest != null){
      //move the entire animation to the right point in time
      for(x in animObjects){
        animObjects[x]["currentTime"] = nextTest.time;
      }
      window.webkitRequestAnimationFrame(function(){runTests(nextTest);});
    } else {
      done();
    }
  } else {
    //Sort tests by time to set up timeouts properly
    testStack.sort(testTimeSort);

    //Set up a timeout for each test
    for(var x =0; x<testStack.length; x++){
      //check for all tests that happen at the same time
      //And add them to the test packet
      testPacket[testIndex] = [];
      testPacket[testIndex].push(testStack[x]);
      while(x < (testStack.length-1)){
        if(testStack[x].time == testStack[x+1].time){
          console.log("ham");
          x++;
          testPacket[testIndex].push(testStack[x]);
        } else break;
      }

      setTimeout(function() {
        console.log("bam");
        for(x in testPacket[testIndex]){
          testPacket[testIndex][x].test.step(function() {
            assert_properties(testPacket[testIndex][x].object, testPacket[testIndex][x].property, testPacket[testIndex][x].target, testPacket[testIndex][x].message);
          });
          testPacket[testIndex][x].test.done();
          flashing(testPacket[testIndex][x]);
        }
        testIndex++;
      }, (testPacket[testIndex][0].time * 1000)+(pauseTime*testIndex));

      testIndex++;
      console.log(testIndex);
    }
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

/////////////////////////////////////////////////////////////////////////
//  All asserts below here                                             //
/////////////////////////////////////////////////////////////////////////

//allows you to choose any combination of single number css properties to 
//approximatly check if they are correct e.g checks width, top
//won't work for things like colour and worded properties
//specify your own epsilons if you want or leave for default
function assert_properties(object, props, targets, message, epsilons){
  var comp = object.currentStyle || getComputedStyle(object, null);
  for(var i = 0; i < props.length; i++){
    assert_approx_equals(parseInt(comp[props[i]]), targets[i], 10, message);
  }
}