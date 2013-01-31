//(function () {
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

    
//})