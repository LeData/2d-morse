'use strict';

let numCheckpoints=5;
let playing=false;      //Store.......
let w =1300;
let h=700; //size of the window

let blur=1;
let ps;
let mt;
let sb;
let mv;
let colors={
  'zero': [0,0,0],
  'over': [255, 215, 140],
  'std': [130, 30, 130],
  'bg': [110,90,110],
  'start': [30,20,50]
  };
let manifolds = {}
for (let o of [RP2, Torus, KleinBottle]) {
  manifolds[new o().short_name] = o
}
// start of app.js
class vectorSelector {

  constructor(n_dim, x, y, length, height) {
    this.sliders = []
    this.height = 0;
    this.length = length
    let spacing = 0.2 * height;
    for (let i=0; i<n_dim; i++) {
      this.sliders.push(new Slider(x, y + this.height, length, height))
      this.height += height
      if (i!=n_dim) {this.height += spacing}
    }
    this.sliders[0].value = 1;
    this.pressed = false
  }

  get vector() {
    let output = []
    for (let s of this.sliders) {
      output.push(s.value)
    }
    return output
  }

  display(){
    for(let s of this.sliders) {
      s.display()
    }
  }

  update(){
    for (let s of this.sliders) {
      if (s.pressed) {
        s.update(true);
        this.pressed = true;
        return;
      }
    }
    for(let s of this.sliders) {
      this.pressed = false
      s.update();
    }
  }

  release(){
    for(let s of this.sliders) {
      s.release()
    }
  }
}

class planeSelector {

  constructor(n_dim, x, y, width, height) {
    let spa = height
    this._X = new vectorSelector(n_dim, x, y, width, height);
    this._Y = new vectorSelector(n_dim, x, y + this._X.height + spa, width, height);
    this.height = this._X.height + this._Y.height + spa
  }

  get X() {
    return this._X.vector
  }

  get Y() {
    return this._Y.vector
  }

  display(){
    this._X.display();
    this._Y.display();
  }

  update(){
    if (!this._Y.pressed && !this._X.pressed) {
      this._X.update();
      this._Y.update();
    }
    else if (!this._Y.pressed) {this._X.update(); return;}
    else {this._Y.update(); return;}

  }

  release(){
    this._X.release();
    this._Y.release();
  }

}

class Movie {

  constructor(manifolds, manifold = 'Torus', n_points, frame_generator, center_x, center_y){
    console.log("Initiating movie")
    this.manifolds = manifolds
    this.frame_generator = frame_generator
    this.n_points = n_points
    this.manifold = new this.manifolds[manifold]()
    this.center = [center_x, center_y]
  }

  plot_point(point, det, plotting_threshold) {
    let thr = plotting_threshold
    if (thr * abs(det) < 1){
          let c = 200*thr*abs(det)
          stroke(c);
          fill(c);
          rect(this.center[0] + 300 * point[0], this.center[1] + 300* point[1],
               random(10), random(4));
          //}
      //rect(w/2+200*(u[0]*x[0]+u[1]*x[1]+u[2]*x[2]+u[3]*x[3]), h/2+200*(u[4]*x[0]+u[5]*x[1]+u[6]*x[2]+u[7]*x[3]),5,5);
      }
  }

  draw(plotting_threshold=10){
    let frame = this.frame_generator.next();
    for (let i=0; i<this.n_points; i++){
      let [point, det] = this.manifold.get_random_projection_onto(frame.value);
      this.plot_point(point, det, plotting_threshold)
      }
    return frame.done
  }

  update(surface_type) {
    this.select_manifold(surface_type)
  }

  select_manifold(surface_type) {
    if (surface_type != this.manifold.short_name || !this.manifold) {
      this.manifold = new this.manifolds[surface_type]()
    }
  }
}
// end of app.js


// start of main.js

function mouseReleased(){
  ps.release();
  sb.release()
}

function* instant_plane(planesel) {
  while (true){
    yield new Plane(planesel.X, planesel.Y)
  }
}

function setup() {
  createCanvas(w, h);
  frameRate(30);
  ps = new planeSelector(4, 50, 20, 200, 20);
  mt = new DropDown(Object.keys(manifolds), 300, 20, 50, 20);
  sb = new SwitchBtn(350, 20, 50, 20, 'Stop','Start', colors['over']);
  mv = new Movie(manifolds, mt.value, 12000, instant_plane(ps), w/2, h/2)
}

function draw() {
  background(210);
  playing = sb.on

  ps.update();
  mt.update();
  if(mt.value != mv.manifold.short_name){
    mv.update(mt.value)
  }
  if (playing) {
    mv.draw(30)
  }
  sb.update();
  ps.display();
  mt.display();
  sb.display();
}