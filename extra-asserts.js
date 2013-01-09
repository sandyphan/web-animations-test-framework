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
//Pass in two animations and verify they are at the same position
 function assert_same(anim1, anim2, message) {
  var object1 = anim1.targetElement;
  var comp1 = object1.currentStyle || getComputedStyle(object1, null);

  var object2 = anim2.targetElement;
  var comp2 = object2.currentStyle || getComputedStyle(object1, null);

  pairings = {
    left: [parseInt(comp1.left), parseInt(comp2.left)],
    top: [parseInt(comp1.top), parseInt(comp2.top)]
  }
  var direction = anim1.animationFunction.property;
  assert_equals(pairings[direction][0], pairings[direction][1], message);
}

//Pass in an animation and error message
//asserts the animation is at the end color
 function assert_end_color(myAnim, message) {
  var object = myAnim.targetElement;
  var endColor = myAnim.animationFunction.frames.frames[1].value;
  assert_color(object, endColor, message);
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

//This function takes an animation object and error message
//and verifies the set end point of the given animation.
function assert_end_location(myAnim, message) {
  var endTarget = parseInt(myAnim.animationFunction.frames.frames[1].value);
  assert_location(myAnim, endTarget, message);
}

//Pass in animation, target location as an integer and error message
//Asserts the animation is at the target location
function assert_location(myAnim, target, message) {
  var object = myAnim.targetElement;
  var comp = object.currentStyle || getComputedStyle(object, null);
  pairings = {
    left: parseInt(comp.left),
    top: parseInt(comp.top)
  }
  var endTarget = parseInt(myAnim.animationFunction.frames.frames[1].value);
  var endLocal = pairings[myAnim.animationFunction.property];
  assert_approx_equals(endLocal, endTarget, calculateEpsilon(myAnim), message);
}

function setLog(bottomAnim) {
  var bottomObject = bottomAnim.targetElement;
  var bottomComp = bottomObject.currentStyle || getComputedStyle(bottomObject, null);
  var bottomPoint = (parseInt(bottomComp.top) + 300) +"px";
  document.getElementById("log").style.top = bottomPoint;
}

//This function calculates the required margin of error for the approx_equals
//assert. It depends on the speed of the moving object.
function calculateEpsilon(givenAnim) {
  var startLocal = parseInt(givenAnim.animationFunction.frames.frames[0].value);
  var endLocal = parseInt(givenAnim.animationFunction.frames.frames[1].value);
  var time = givenAnim.duration;
  var epsilon = Math.max(1, 2 * (endLocal - startLocal)/(100*time*time));
  return epsilon;
}

// pass in the element, the distance it requires to move,
// the animation time for 1 repetition, the number of intervals
// you want the data to be retrieved and the iteration count
// the test should return true if the element passed in is repeated more than 1 time
// and return false if the element is repeated less than or equal to 1 time
var assert_repeat = function(elem, distance, animTime, intervalNum, iterCount, message) {
  var timepercent = 0;
  var disPercent = 0;
  var repeated = false;
  var myTest = async_test(message);
  var timeOutDur = (animTime * 1000) * iterCount + 5;
  var repeatCount = 0;
  var flag = false;
  
  if (timeOutDur > 5000) {
    setup({timeout: 100000});
  }

  var intervalTime = ((animTime * 1000) / intervalNum) - 2;
  var checkPercent = setInterval(function() {
    getPercentRepeat(elem, distance, animTime, iterCount);
  }, intervalTime);
  
  setTimeout(function() {
    clearInterval(checkPercent);
  }, timeOutDur);
  
  var getPercentRepeat = function(elem, distance, animTime, iterCount) {
    var p = getComputedStyle(elem, null);
    var currTime = document.animationTimeline.animationTime;
    while (currTime > animTime + 0.05) {
      currTime = currTime - animTime;
    }
  
    timePercent = Math.round((currTime / animTime) * 1000)/1000;
    distPercent = Math.round((parseInt(p.left) / distance) * 1000)/1000;
    assert_approx_equals(timePercent, distPercent, 0.3, "Check that the time percentage is equal to the distance percentage");
    
    var totalIntervalNum = intervalNum * iterCount;
    flag = true;
    repeatCount++;
    if (repeatCount === totalIntervalNum) {
      if (iterCount <= 1) {
        repeated = false;
      } else {
        repeated = true;
      }
    }
  }
  
  setTimeout(function() {
    myTest.step(function() {
      if (iterCount <= 1) {
        assert_false(repeated, "assert that the element is not repeated");
      } else {
        assert_true(repeated, "assert that the element is repeated");
      }
    });
    myTest.done();
  }, timeOutDur);
}
