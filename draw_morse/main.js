'use strict';
import {Movie, planeSelector} from "./app.mjs";

function dynamicallyLoadScript(url) {
  let script = document.createElement("script");  // create a script DOM node
  script.src = url;  // set its src to the provided URL

  document.head.appendChild(script);  // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}

dynamicallyLoadScript("https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.2.0/p5.js")
dynamicallyLoadScript("https://unpkg.com/p5.touchgui@0.5.2/lib/p5.touchgui.js")

let playing=false;      //Store.......
let w =1300;
let h=700; //size of the window

let ps;
let mt;
let sb;
let mv;
let sketch_btn;
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


// general mouse release funtion
function mouseReleased(){
  ps.release();
  sb.release()
}

function setup() {
  createCanvas(w, h);
  frameRate(30);
  ps = new planeSelector(4, 50, 20, 200, 20);
  mt = new DropDown(Object.keys(manifolds), 300, 20, 50, 20);
  sketch_btn = new DropDown(Object.keys(sketches), 350, 20, 50, 20);
  sb = new SwitchBtn(400, 20, 50, 20, 'Stop','Start', colors['over']);
  mv = new Movie(mt.value, 10000, instant_plane(ps), sketch_btn.value)
}

function draw() {
  background(210);
  playing = sb.on

  // updating the UI
  ps.update();
  mt.update();
  sketch_btn.update()
  mv.update(mt.value, sketch_btn.value)

  if (playing) {
    mv.draw(30)
  }
  sb.update();

  // displaying
  ps.display();
  mt.display();
  sb.display();
  sketch_btn.display()
}