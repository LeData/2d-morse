'use strict';

let numCheckpoints=5;
let Relez=true;  //State of display for the vector_selector
let playing=false;      //Store.......
let w =1300;
let h=700; //size of the window

let bar_length = 100;
let box_size = 10;
let y_height = 12
let blur=1;
let VectorSelector = [];
let checkpoints = [];
let mainBtn;
let OptBtn;
let colors={
  'zero': [0,0,0],
  'over': [255, 215, 140],
  'std': [130, 30, 130],
  'bg': [110,90,110],
  'start': [30,20,50]
  };

let add_reducer = (accumulator, currentValue) => accumulator + currentValue;

function dot2(x,y){
  return x[0]*y[0] + x[1]*y[1] + x[2]*y[2] + x[3]*y[3]
}


function mouseReleased(){
  Relez=true;
  for (let j=0; j<2; j++) {
    for (let i=0; i<4; i++) {
       VectorSelector[j][i].release();
    }
  }

}

class Checkpoint {

  constructor(plane, tpos) {
    /**
     * Checkpoints for the movie
     * @param {a} array - 4d vector represented as an array
     * @param {b} array - 4d vector represented as an array
     * @param {tpos} float - position of the button
     */
    this.width_s = 6;
    this.width_o = box_size;
    this.pos = tpos;
    this.edit = false;
    this.over = false;
    this.proj_plane = plane;
    console.log("Initialising checkpoint")
  }

  get_btn() {
    fill.apply(this, colors['std']);
    rect(10 + this.pos, 10 - this.width_s /2, this.width_s, this.width_s);
  }

  get_over_btn(flag) {
    if (flag) {
      fill.apply(this, colors['over']);
      rect(10 + this.pos - (this.width_o - this.width_s)/2,
           10 - this.width_o /2,
           this.width_o,
           this.width_o);
    }
  }

  display() {
    if (playing && Relez) {
      this.get_over_btn(this.edit)
      if (this.edit) {
        this.over = overRect(8 + this.pos, 5, 10, 10);
      }
      this.get_btn()
      this.get_over_btn(this.over)
    }
    else {
      this.get_btn()
      if(mainBtn.pressed) {return;}
      this.over = overRect(10 + this.pos, 10 - this.width_s /2, this.width_s, this.width_s);
      this.get_over_btn(this.over)
    }
    if (!mainBtn.pressed) {this.press();}
  }

  press() {
    if (this.over && mouseIsPressed && Relez){
      for (let i=0; i<4; i++) {
        if (this.edit) {
          this.proj_plane.X[i]= float(VectorSelector[0][i].length) / VectorSelector[0][i].fixlength - 1;
          this.proj_plane.Y[i]= float(VectorSelector[1][i].length) / VectorSelector[1][i].fixlength - 1;
        }
        else {
          VectorSelector[0][i].length = round((this.proj_plane.X[i] + 1) * VectorSelector[0][i].fixlength);
          VectorSelector[1][i].length = round((this.proj_plane.X[i] + 1) * VectorSelector[1][i].fixlength);
        }
      }
      playing =! playing;
      Relez = false;
      this.edit =! this.edit
    }
  }
}

class Handle {

  constructor(x, y, length, side, o, caption){
    this.bar = [[x, y], [x + length,y]]
    this.fixlength = length;
    this.slider_x = length/2;
    this.value = 0;

    this.size = side;
    this.others = o;

    this.over = false;
    this.pressed = false;
    this.sliderBtn = new BoxBtn(this.bar[0][0] + this.slider_x, this.bar[0][1], this.size);
    this.sliderBtn.bound(this.bar[0][0], this.bar[1][0], null, null);
    this.lBtn = new BoxBtn(this.bar[0][0] - 5, this.bar[0][1], this.size);
    this.rBtn = new BoxBtn(this.bar[1][0] + 5, this.bar[0][1], this.size);
    this.locked = false;
  }

  set value(value) {
    this.slider_x = this.fixlength * (1 + value) / 2
  }

  get value() {
    return (2 * this.slider_x / this.fixlength) - 1
  }

  display(){
    stroke(0);
    line(this.bar[0][0], this.bar[0][1], this.bar[1][0], this.bar[1][1]);  //slider line
    this.rBtn.display()
    this.lBtn.display()
    this.sliderBtn.display() // previous color trigger : (this.over || this.pressed));
    text(round(100*this.slider_x)/100, this.bar[0][0] - 55, this.bar[0][1] + 4);
    fill(255);
  }

  get otherslocked(){
    for (let i=0; i<this.others.length; i++) {
      if (this.others[i].locked == true) {
        return true;
      }
    }
    return false
  }

  update(){
    //this.boxx = this.bar[0][0] + this.slider_x;
    //this.boxy = this.bar[0][1] - this.size/2;
    if(mainBtn.pressed){return;}
    if (!this.otherslocked) {
      this.over = this.sliderBtn.over;
      this.press_fct();
    }
    if (this.pressed) {
      this.sliderBtn.x = mouseX;
      this.slider_x = 2*(this.sliderBtn.x - this.bar[0][0]) / (this.fixlength) - 1;
    }
    if (this.lBtn.pressed) {this.sliderBtn.x--;}
    if (this.rBtn.pressed) {this.sliderBtn.x++;}
  }

  press_fct() {
    if (this.sliderBtn.pressed || this.locked) {
      this.pressed = true;
      this.locked = true;
    }
    else {this.pressed = false;}
  }

  release() {
    this.locked = false;
  }
}

class Menu {
  constructor() {
    this.type = 0;
    this.types = {
      0: "Torus",
      1: "Klein",
      2: "RP2"};
    this.pressed = false;
    this.x = w-90
    this.y = 3
    this.size_x = 50
    this.size_y = 15
  }

  get_selected() {
    return 0
  }

  get over() {
    return (mouseX >= this.x && mouseX <= this.x + this.size_x && mouseY >= this.y && mouseY <= this.y + this.size_y)
  }

  update() {
    if(this.pressed) {
      this.size_y = 39
      this.pressed = this.over;
    }
    else{
      this.get_selected()
      this.size_y = 15
      this.pressed = this.over;
      return;
    }
    fill(255);
    rect(w-90,3,50,39);
    fill(30,20,50);
    let extra = 0
    for (let key in this.types) {
      if (key == this.type){
        text(this.types[key], w-84, 16);
      }
      else {
        extra += 1;
        let y = y_height * extra
        if(overRect(w-90, 15 + y, 50, 12)){
          fill(255,215,0);
          text(this.types[key], w-84, 16 + y);
          fill(30,20,50);
          if(mouseIsPressed) {
            this.type=key;
            this.pressed=false;
          }
        }
        else {
          text(this.types[key],w-84,16 + y);
        }
      }
    }
  }
}

class Movie {

  constructor(surface_type = 'Torus', starting_plane, ending_plane, frames_per_step, n_points=1000){
    console.log("Initiating movie")
    switch(surface_type){
      case 'RP2':
        this.manifold = new RP2();
        break;
      case 'Torus':
        this.manifold = new Torus();
        break;
      case 'Klein bottle':
        this.manifold = new KleinBottle()
    }
    this.frame_generator = linear_plane_transition(starting_plane, ending_plane, frames_per_step)
    this.n_points = n_points
  }

  plot_point(point, det, plotting_threshold) {
    let thr = plotting_threshold
    if (thr * abs(det) < 1){
          //if(300*(u[0]*x[0]+u[1]*x[1]+u[2]*x[2]+u[3]*x[3])<2&300*(u[4]*x[0]+u[5]*x[1]+u[6]*x[2]+u[7]*x[3])<2){print(X+" and "+Y+"  p ");}
          let c = 200*thr*abs(det)
          stroke(c);
          fill(c);
          //point(w/2+200*(u[0]*x[0]+u[1]*x[1]+u[2]*x[2]+u[3]*x[3]), h/2+200*(u[4]*x[0]+u[5]*x[1]+u[6]*x[2]+u[7]*x[3]));
          //line(w/2+300*(u[0]*x[0]+u[1]*x[1]+u[2]*x[2]+u[3]*x[3])+(random(20)-10), h/2+300*(u[4]*x[0]+u[5]*x[1]+u[6]*x[2]+u[7]*x[3]),w/2+300*(u[0]*x[0]+u[1]*x[1]+u[2]*x[2]+u[3]*x[3])+(random(20)-10), h/2+300*(u[4]*x[0]+u[5]*x[1]+u[6]*x[2]+u[7]*x[3]));
          //for(let g=0;g<5;g++){//point(w/2+200*(u[0]*x[0]+u[1]*x[1]+u[2]*x[2]+u[3]*x[3])+random(5), h/2+200*(u[4]*x[0]+u[5]*x[1]+u[6]*x[2]+u[7]*x[3])+random(5));
          rect(w/2 + 300 * point[0], h/2 + 300* point[1], random(20), random(4));
          //}
      //rect(w/2+200*(u[0]*x[0]+u[1]*x[1]+u[2]*x[2]+u[3]*x[3]), h/2+200*(u[4]*x[0]+u[5]*x[1]+u[6]*x[2]+u[7]*x[3]),5,5);
      }
  }

  draw(plotting_threshold){
    let frame = this.frame_generator.next();
    for (let i=0; i<this.n_points; i++){
      let [point, det] = this.manifold.get_random_projection_onto(frame.value);
      this.plot_point(point, det, plotting_threshold)
      }
    return frame.done
  }
}

class Start {

  constructor(planes) {
    this.pressed = false;
    this.step = 0;
    this.playBtn = new SwitchBtn(220, 3, 50, 15, null, null,null,null,null);
    this.ran = 120000;
    this.planes = planes;
    this.movie = null;
  }

  display() {
    this.playBtn.display();
  }

  update() {
    if(this.playBtn.over && !this.pressed && Relez) {
      Relez = false;
      this.pressed = true;
    }
  }

  path() {
    if(this.playBtn.pressed && this.pressed && Relez) {
      Relez=false;
      this.pressed = false;
      return;
    }
    if (!this.movie) {
      this.movie = new Movie('RP2', this.planes[this.step], this.planes[this.step +1], 30);
    }

    let new_step = this.movie.draw(20);
    if (new_step){
      this.step++;
      this.movie = null;
    }
    if(this.step==(numCheckpoints-1)) {
      this.step=0;
      this.pressed=false;
    }
  }
}


function setup() {
  createCanvas(w, h);
  frameRate(30);
  let initial_plane = new Plane([-1, 0, 0, 1], [0, 1, 1, 0]);  //Defining initial VectorSelector
  let planes = []
  for (let i=0;i<numCheckpoints;i++) {
    planes.push(initial_plane)
    checkpoints[i] = new Checkpoint(initial_plane, 190*i/(numCheckpoints-1));
  }

  mainBtn = new Start(planes);
  OptBtn = new Menu();

  let handle_x = 65
  let handle_section = 25
  let truc = 50-10/2
  for (let j=0; j<2; j++) {
    VectorSelector[j] = []
    for (let i=0; i<4; i++) {
        let shift = j* handle_section + (4*j + i) * 15
        let label = j==0 ? "u["+i+"]" : "v["+i+"]"
        VectorSelector[j][i] = new Handle(handle_x, 35 + shift, truc, box_size, VectorSelector, label);
    }
  }
}

function draw_menu() {
  let drop_down_size = playing ? 150 : 0;
  fill.apply(this, colors['bg']);
  stroke(0);
  rect(0,0,280,30 + drop_down_size);
  line(10, y_height, 200, y_height);
  rect(w-100,0,w,24);
}

function draw() {
  background(210);
  if(mainBtn.pressed){
    playing=false
    mainBtn.path();
  }

  draw_menu()

  if(mainBtn.pressed) {
    stroke(200+random(55));
    line(10,y_height,10+190/(numCheckpoints-1)*(mainBtn.step+float(mainBtn.counter)/30),y_height);
    //OptBtn.display();
  }
  else {
    mainBtn.update();
    //OptBtn.update();
  }

  for (let i=0;i<numCheckpoints;i++) {
    if(mainBtn.pressed && i>mainBtn.step){stroke(0);}
    checkpoints[i].display();}
    for (let j=0; j<2; j++) {
      for (let i=0;i<4;i++) {
        if(playing/*||PlayBtn.pressed*/) {
          VectorSelector[j][i].display();
          VectorSelector[j][i].update();
        }
      }
    }
    mainBtn.display();
}