// start of UI.js
class RectBtn {

  constructor(center_x, center_y, side_x, side_y, label = null,
               bg_color = [255,255,255], over_color = [210,210,210],
               pressed_color = [160, 10,70]) {
    this.size_x = side_x;
    this.size_y = side_y;
    this._x = center_x - this.size_x / 2;
    this._y = center_y - this.size_y / 2;
    this.colors = {
      'bg': bg_color,
      'over': over_color,
      'pressed': pressed_color
    };
    this.label = label;
  }

  get x() {
    return this._x
  }

  set x(value) {
    if (this.max_x) {value = min(value, this.max_x)}
    if (this.min_x) {value = max(value, this.min_x)}
    this._x = value
  }

  get y() {
    return this._y
  }

  set y(value) {
    if (this.max_y) {value = min(value, this.max_y)}
    if (this.min_y) {value = max(value, this.min_y)}
    this._y = value
  }

  get center_x() {
    return this._x + this.size_x / 2
  }

  set center_x(value) {
    this.x = value - this.size_x / 2
  }

  get center_y() {
    return this._y + this.size_y / 2
  }

  set center_y(value) {
    this.y = value - this.size_y / 2
  }

  bound (min_x, max_x, min_y, max_y) {
    this.min_x = min_x
    this.max_x = max_x
    this.min_y = min_y
    this.max_y = max_y
  }

  get over() {
    return (mouseX >= this.x && mouseX <= this.x + this.size_x && mouseY >= this.y && mouseY <= this.y + this.size_y)
  }

  get pressed() {
    return this.over && mouseIsPressed
  }

  display() {
    let c;
    if (this.pressed) {
      c = this.colors['pressed'];
    }
    else if (this.over) {
      c = this.colors['over'];
    }
    else {
      c = this.colors['bg']
    }
    fill.apply(this, c);
    stroke(0)
    rect(this.x, this.y, this.size_x, this.size_y);
    if (this.label) {
      fill(30, 20, 50);
      text(this.label, this.x + this.size_x/10, this.y + 9*this.size_y/10);
    }
  }
}

class BoxBtn extends RectBtn{

  constructor(center_x, center_y, side, label, bg_color, over_color, pressed_color){
    super(center_x, center_y, side, side, label, bg_color, over_color, pressed_color)
  }

  get size() {
    return this.size_x
  }
}

class SwitchBtn extends RectBtn{
  constructor(center_x, center_y, side_x, side_y, on_label, off_label,
               bg_color, over_color,
               pressed_color) {
    super(center_x, center_y, side_x, side_y, off_label,
               bg_color, over_color,
               pressed_color)
    this.on = false
    this.labels = {'on': on_label,
                  'off': off_label}
    this.available = true
  }

  update(){
    if(this.pressed && this.available) {
      this.available = false
      this.on = !this.on;
      this.label = this.on ? this.labels['on'] : this.labels['off']
    }
  }

  release() {
    this.available = true
  }
}

class Slider {
  // replaces Handle
  constructor(x, y, length, height) {
    this.x = x
    this.y = y
    this.height = height
    this.spacing = height;

    this.lBtn = new BoxBtn(x, y, height);
    this.rBtn = new BoxBtn(x + length - height, y, height);

    this.bar = [[this.lBtn.x + this.lBtn.size + this.spacing/2, y],
                [this.rBtn.x - this.spacing/2,y]];
    this.bar_length = this.bar[1][0] - this.bar[0][0]

    this.pressed = false;

    this.sliderBtn = new BoxBtn(this.bar[0][0] + this.bar_length/2, this.bar[0][1], this.height);
    this.sliderBtn.bound(this.bar[0][0] - height/2, this.bar[1][0] -  height/2, null, null);
  }

  set value(value) {
    this.sliderBtn.center_x = this.bar[0][0] + (1 + value) / 2 * this.bar_length
  }

  get value() {
    let relative_position = this.sliderBtn.center_x - this.bar[0][0]
    return (2 * relative_position / this.bar_length) - 1
  }

  display(){
    this.print_bar()  //slider line
    this.rBtn.display()
    this.lBtn.display()
    this.sliderBtn.display()
    this.print_value();
    fill(255);
  }

  print_value() {
    stroke(255)
    fill(0)
    text(round(100*this.value)/100, this.x - this.height - this.spacing, this.y + 4);
  }

  print_bar() {
    stroke(0);
    line(this.bar[0][0], this.bar[0][1], this.bar[1][0], this.bar[1][1]);
  }

  update(available=true){
    if (available) {this.press();}
    if (this.pressed) {this.sliderBtn.x = mouseX;}
    if (this.lBtn.pressed) {this.sliderBtn.x--;}
    if (this.rBtn.pressed) {this.sliderBtn.x++;}
  }

  press() {
    if (this.sliderBtn.pressed) {this.pressed = true;}
  }

  release() {
    this.pressed = false;
  }
}

class DropDown {

  constructor(options, x, y, width, height) {
    this.options = options
    this.choiceBtns = []
    for (let i = 0; i<this.options.length; i++){
      this.choiceBtns[i] = new RectBtn(x, y + i* height, width, height,
                                       this.options[i])
    }
    this.opened = false
  }

  get value() {
    return this.choiceBtns[0].label
  }

  put_first(option) {
    let labels = this.options.filter(item => item !== option);
    labels.unshift(option);
    for (let i=0; i< this.options.length; i++) {
      this.choiceBtns[i].label = labels[i];}
  }

  get over(){
    if (this.opened) {
      for (let o of this.choiceBtns) {
        if (o.over) {return true;}
      }
    }
    else {
      this.opened = this.choiceBtns[0].over
      return this.opened
    }
  }

  display() {
    if (this.over && this.opened){
      for (let b of this.choiceBtns){
        b.display()
      }
    }
    else {
      this.choiceBtns[0].display()}
  }

  update() {
    if (this.opened){
      for (let o of this.choiceBtns) {
        if (o.pressed) {
          this.put_first(o.label);
          this.opened=false
          return;
        }
      }
    }
  }
}
// end of UI.js