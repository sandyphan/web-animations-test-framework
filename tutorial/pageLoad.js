// get the name of current page the user is at
// e.g. if the main page of the section is called parallel
// currentSection would be 'parallel'
var currentSection = window.location.href.split("/").pop();
currentSection = currentSection.split(".")[0];

// waits until all DOM elements are ready to perform
$(document.body).ready(function() {
  // if one of the side menu is clicked
  // update page content without refreshing the whole page
  $(".sideMenu li").click(function(e) {
    var exerciseNum = $(this).html().split(" ")[1];
    if ($(this).attr("id") === "menuLabel") {
      return;
    } else if (parseInt(exerciseNum) !== exerciseNum && isNaN(exerciseNum)) {
      $(".content").load(currentSection + ".html" + " .content", function() {
        $(this).children().unwrap();
      });
    } else {
      var url = currentSection + "Exercise" + exerciseNum + ".html";
      // checks if a file/link exist before adding contents
      // into page
      $.ajax({
        url: url,
        type: 'HEAD',
        success: function() {
          $(".content").load(url + " .content", function() {
            $(this).children().unwrap();
            loadEditor();
          });
        }
      });
    }
  });
});

// this loads the editor dynamically into page content
var loadEditor = function() {
  var html;
  console.log(currentSection);
  if (currentSection === 'parallel' || currentSection === 'sequence')
    html = "<div id=\"a\" class=\"anim\"></div>"
           + '\n' + "<div id=\"b\" class=\"anim\"></div>"
           + '\n' + "<div id=\"c\" class=\"anim\"></div>";
  else 
    html = "<div id=\"a\" class=\"anim\"></div>";

  display();
  setDefaultHTML(html);
  var css = ".anim {"
         +"\n" + "background-color: red;"
         +"\n" + "border-radius: 10px;"
         +"\n" + "width: 100px;"
         +"\n" + "height: 50px;"
         +"\n" + "top: 50px;"
         +"\n" + "left: 0px;"
         +"\n" + "position: absolute;"
         +"\n" + "}";
  setDefaultCSS(css);
  setDefaultJS("");
  var iframe = new Iframe();
  console.log(document.querySelector("#tryIt"));
}