var scripts = [
  "../jquery.js",
  "../page-load.js",
  "../try-it-yourself.js"
];
generateLayout("Web Animation Tutorials", "../tutorial-style.css", scripts);

var names = ["Home", "Tutorials", "References", "About"];
var links = ["home-page.html", "#", "references.html", "about.html"];

createMenu(names, links, "top");

var subNames = ["Basic Animations", "Parallel Animations", "Sequence Animations", "Timing Dictionary", "Timing Functions"];
var subLinks = [
  "basic-animations/basic-animation.html",
  "parallel/parallel.html",
  "sequence/sequence.html",
  "timing-dictionary/timing-dictionary.html",
  "timing-functions/timing-function.html"
]
createSubMenu("Tutorials", "top", subNames, subLinks);