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

  assert_approx_equals(parseInt(rgbValues[0]), expectedColor[0], 2, "red " +message);
  assert_approx_equals(parseInt(rgbValues[1]), expectedColor[1], 2, "green " +message);
  assert_approx_equals(parseInt(rgbValues[2]), expectedColor[2], 2, "blue " +message);
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

//This function finds the end point of the animation and verifies the animation is there
function assert_end_location(myAnim, message) {
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

//This function calculates the required margin of error for the approx_equals
//assert. It depends on the speed of the moving object.
function calculateEpsilon(givenAnim) {
  var startLocal = parseInt(givenAnim.animationFunction.frames.frames[0].value);
  var endLocal = parseInt(givenAnim.animationFunction.frames.frames[1].value);
  var time = givenAnim.duration;
  var epsilon = Math.max(1, 2 * (endLocal - startLocal)/(100*time*time));
  return epsilon;
}