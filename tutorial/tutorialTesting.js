function async_test(func, name, properties) {
  console.log("in async_test");


  this.name = name;
  this.timeout_id = null;
  this.is_done = false;

  this.properties = properties;
  this.timeout_length = 10000;

  this.message = null;

  var this_obj = this;
  this.steps = [];


  step = function(func, this_obj) {
    console.log("in step");
  } 

  done = function() {
    console.log("done!");
  }
  return this;
}

    

function assert_equals(actual, expected, description) {
  console.log("in assert_equals");
}

function assert_approx_equals(actual, expected, epsilon, description) {
  conole.log("in assert_approx_equals");
}

function setup(func_or_properties, maybe_properties) {
        
}

function add_completion_callback(anything) {
  console.log("in add_complettion_callback");
}


function endTests(time) {
  setTimeout(function() {
    for(var j = 0; j < pass.length; j++) {
      if (!pass[j]) {
        console.log("fail");
        return;
      }
    }
    console.log("PASS");
    var object = document.getElementById('display');
    object.className = "pass"
  }, time+50)
}

function setupTutorialTests() {
  state = "Manual";
  var timeOfAnimation = document.createElement('div');
  timeOfAnimation.id = "animViewerText";
  timeOfAnimation.innerHTML = "Current animation time: 0.00";
  document.body.appendChild(timeOfAnimation);
}