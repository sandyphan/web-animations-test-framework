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
//Maybe change so you pass in the colour name e.g. green
function assert_color(component, red, green, blue, message) {
  var params = document.defaultView.getComputedStyle(component, null);
  var color = params.backgroundColor;
  color = color.replace(/[^0-9,]/g, "");
  var rgbValues = color.split(",");
  assert_approx_equals(parseInt(rgbValues[0]), red, 2, "red " +message);
  assert_approx_equals(parseInt(rgbValues[1]), green, 2, "green " +message);
  assert_approx_equals(parseInt(rgbValues[2]), blue, 2, "blue " +message);
}

function calculateEpsilon(givenAnim) {
  var startLocal = parseInt(givenAnim.animationFunction.frames.frames[0].value);
  var endLocal = parseInt(givenAnim.animationFunction.frames.frames[1].value);
  var time = givenAnim.duration;
  var epsilon = Math.max(1, 2 * (endLocal - startLocal)/(100*time*time));
  return epsilon;
}