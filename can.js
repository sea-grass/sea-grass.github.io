var svg_dom = $('#svg_dom'); //the svg, where to place the red square

//Create a document fragment to be inserted into the HTML page
function create(htmlStr) {
  var frag = document.createDocumentFragment(),
      temp = document.createElement('div');
  temp.innerHTML = htmlStr;
  while (temp.firstChild) {
    frag.appendChild(temp.firstChild);
  }
  return frag;
}
var can = $('#canvas'); //the red square, currently

var tri = function() {can.attr('d', 'M 0 0 C 250 250 0 500 L 500 0 L 0 -500 z');}; //change can to a triangle
var rect = function() {can.attr('d', 'M 0 0 L 500 0 L 500 500 L 0 500 z');}; //change can to a rectangle
var col = function() {
  var fill_col = $('#col_field');
  console.log(fill_col);
  if (fill_col && fill_col.val) {
    can.attr('fill',fill_col.val());
  }
}; //change color of can to fill_col
