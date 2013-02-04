var pass;

function setupTutorialTests() {
  setState("Manual");
  var timeOfAnimation = document.createElement('div');
  timeOfAnimation.id = "animViewerText";
  timeOfAnimation.innerHTML = "Current animation time: 0.00";
  document.body.appendChild(timeOfAnimation);
  pass = [];
}

function async_test(func, name, properties) {
  this.name = name;
  this.timeout_id = null;
  this.is_done = false;

  this.properties = properties;
  this.timeout_length = 10000;

  this.message = null;

  var this_obj = this;
  this.steps = [];


  step = function(func, this_obj) {
    console.log(func);
    func();
  } 

  done = function() {
    console.log("done!");
    console.log(pass);
  }
  return this;
}

    

function assert_equals(actual, expected, description) {
    consloe.log("in assert_equals");
    console.log(actual == expected);
  pass.push(actual == expected);
}

function assert_approx_equals(actual, expected, epsilon, description) {
    console.log("In approx equals");
    console.log("actual = " +actual);
    console.log("expected = " +expected);
    
  pass.push(expected + (epsilon / 2) > actual && expected - (epsilon / 2) < actual );
}

function setup(func_or_properties, maybe_properties) {
        
}

function add_completion_callback(anything) {
  
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