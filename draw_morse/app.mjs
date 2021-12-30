// noinspection EqualityComparisonWithCoercionJS
// start of app.mjs
import {KleinBottle, RP2, Torus} from "./manifolds.mjs";
import {plot_lines, plot_squares} from "./painting.mjs";
import {nVector} from "./dimensions.mjs"

/**
 * Defining the option bindings for buttons
 */
let manifolds = {}
for (let o of [RP2, Torus, KleinBottle]) {
  manifolds[new o().short_name] = o
}

let sketches = {'squares': plot_squares,
  'lines': plot_lines}

class vectorSelector {

  /**
   * Builds a set of n sliders to select a vector in [-1,1]^n.
   * @param {number} n_dim - number of dimensions of the vector
   * @param {number} x - x position of the selector in the window
   * @param {number} y - y position of the selector in the windoy
   * @param {number} width - width of the selector in the window
   * @param {number} height - height of one element of the selector in the window
   */
  constructor(n_dim, x, y, width, height) {
    this.sliders = []
    this.height = 0;
    this.width = width
    let spacing = 0.2 * height;
    for (let i=0; i<n_dim; i++) {
      this.sliders.push(new Slider(x, y + this.height, this.width, this.height))
      this.height += height
      if (i < n_dim - 1 ) {this.height += spacing}
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

export class planeSelector {
  /**
  * Builds a set of two Vector selectors in [-1, 1]^n, defining a plane (most of the time)
  * @param {number} n_dim - number of dimensions of the vector
  * @param {number} x - x position of the selector in the window
  * @param {number} y - y position of the selector in the windoy
  * @param {number} width - width of the selector in the window
  * @param {number} height - height of one element of the selector in the window
  */
  constructor(n_dim, x, y, width, height) {
    let spacing = height
    this._X = new vectorSelector(n_dim, x, y, width, height);
    this._Y = new vectorSelector(n_dim, x, y + this._X.height + spacing, width, height);
    this.height = this._X.height + this._Y.height + spacing
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

class j34PlaneSelector {

  constructor(x, y, width, height) {
    let spacing = 10;
    let size = (height - spacing) / 2;
    let jx = createJoystick("x", x, 400 - size - spacing, size, size, -1, 1, 1, -1);
    let jy = createJoystick("y", x, 400 - 2* size - spacing, size, size, -1, 1, 1, -1);
    this._X = nVector([0, 0, 1, 0])
    this._Y = nVector([0, 0, 0, 1])
  }

  update() {
    this._X.x += jx.x
    this._X.y += jx.y
    this._Y.x += jy.x
    this._Y.y += jy.y
  }

  get X() {
    return this._X.normalize()
  }

  get Y() {
    return this._Y.normalize()
  }

}

export class Movie {

  constructor(manifold = 'Torus', frame_generator, sketch){
    console.log("Initiating movie")
    this.frame_generator = frame_generator
    this.update(manifold, sketch)
  }

  draw(plotting_threshold=10){
    let frame = this.frame_generator.next();
    let projection_function = frame.value.dproj.bind(frame.value)
    this.manifold.get_random_grid()
    let point_list = this.manifold.get_critical_values_of(projection_function, 1 / plotting_threshold)
    this.sketch(point_list)
    return frame.done
  }

  update(surface_type, sketch_type) {
    if (surface_type != this.manifold.short_name || !this.manifold) {
      this.manifold = new manifolds[surface_type]()
    }
    if (sketch_type != this.sketch) {
      this.sketch = sketches[sketch_type]
    }
  }
}
// end of app.mjs