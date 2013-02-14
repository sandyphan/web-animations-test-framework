var scripts = [
  "test-try-it-yourself.js",
  "jquery.js",
  "page-load.js"
];
var layout = generateLayout("Web Animation Tutorials", "tutorial-style-test.css", scripts);

var names = ["Home", "Tutorials", "References", "About"];
var links = ["home-page.html", "#", "references.html", "about.html"];

createMenu(names, links, "top");

var subNames = ["Basic Animations", "Parallel Animations", "Sequence Animations", "Timing Dictionary", "Timing Functions"];
var subLinks = [
  "basic-animation.html",
  "parallel.html",
  "sequence.html",
  "timing-dictionary.html",
  "timing-function.html"
]
createSubMenu("Tutorials", "top", subNames, subLinks);

console.log(layout);

layout.setAttribute('onload', 'load_json_content("home-page")');

// layout.onload() = function() {
//   load_json_content("test-sequence");
// };
