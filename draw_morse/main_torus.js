'use strict';

let w =1300;
let h=700; //size of the window

let blur=1;
let ps;
let mv;
let colors={
  'zero': [0,0,0],
  'over': [255, 215, 140],
  'std': [130, 30, 130],
  'bg': [110,90,110],
  'start': [30,20,50]
  };

/**
* Defining the option bindings for buttons
*/
let manifolds = {}
for (let o of [RP2, Torus, KleinBottle]) {
  manifolds[new o().short_name] = o
}

let sketches = {'squares': plot_squares,
                'lines': plot_lines}

// general mouse release funtion
function mouseReleased(){
  ps.release();
  sb.release()
}

function setup() {
  createCanvas(w, h);
  frameRate(30);
  ps = new planeSelector(4, 50, 20, 200, 20);
  mv = new Movie(manifolds, Torus, 10000, instant_plane(ps), sketches, 'squares')
}

function draw() {
  background(210);
  playing = sb.on

  // updating the UI
  ps.update();
  sketch_btn.update()
  mv.update(mt.value, sketch_btn.value)

  mv.draw(30)
  // displaying
  ps.display();
}