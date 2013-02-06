function setupTutorialTests() {
  setState("Manual");
  var timeOfAnimation = document.createElement('div');
  timeOfAnimation.id = "animViewerText";
  timeOfAnimation.innerHTML = "Current animation time: 0.00";
  document.body.appendChild(timeOfAnimation);
  pass = true;
  numTests = 0;
  completedTests = 0;
  allDone = false;
}

function async_test(func, name, properties) {
  numTests++;

  step = function(func, this_obj) {
    func();
    if (!pass) {
        console.log("FAIL :(");
        parent.display.fail();
        allDone = true;
    }
  } 

  done = function() {
    completedTests++;
    if(completedTests == numTests && !allDone) {
        console.log("PASS :D");
        allDone = true;
        parent.display.pass();
    }
  }
  return this;
}   

function assert_equals(actual, expected, description) {
  pass = (actual == expected);
}

function assert_approx_equals(actual, expected, epsilon, description) {
  var lowerBound = expected - (epsilon / 2) < actual;
  var upperBound = expected + (epsilon / 2) > actual;
  pass = (lowerBound && upperBound);
}

function setup(func_or_properties, maybe_properties) {
        
}

function add_completion_callback(anything) {
}
