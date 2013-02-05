var pass;
var numTests;
var allDone;
var completedTests;

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
  this.name = name;
  this.timeout_id = null;
  this.is_done = false;

  this.properties = properties;
  this.timeout_length = 10000;

  this.message = null;

  var this_obj = this;

  numTests++;
  done = false;

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
  pass = (expected + (epsilon / 2) > actual && expected - (epsilon / 2) < actual );
}

function setup(func_or_properties, maybe_properties) {
        
}

function add_completion_callback(anything) {
}


function endTests() {
  for(var j = 0; j < pass.length; j++) {
    if (!pass[j]) {
      console.log("fail");
      return;
    }
  }
  console.log(document);
  var object = document.getElementById('display');
  object.className = "pass"
}