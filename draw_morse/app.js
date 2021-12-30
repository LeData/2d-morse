// start of app.js
class vectorSelector {

  /**
  * Builds a set of n sliders to select a vector in [-1,1]^n.
  *
  */
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

class SchubertPlaneSelector {

  constructor(){
  }

  get X() {
    return this._X.vector
  }

  get Y() {
    return this._Y.vector
  }

}

class planeSelector {
  /**
  * Builds a set of two Vector selectors in [-1, 1]^n, defining a plane (most of the time)
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

class Movie {

  constructor(manifolds, manifold = 'Torus', frame_generator, sketches, sketch){
    console.log("Initiating movie")
    this.frame_generator = frame_generator
    this.manifolds = manifolds
    this.sketches = sketches
    this.update(manifold, sketch)
  }

  draw(plotting_threshold=10, adjust=true){
    let frame = this.frame_generator.next();
    projection_function = frame.value.dproj.bind(frame.value)
    this.manifold.get_random_grid()
    let point_list = this.manifold.get_critical_values_of(projection_function, 1 / plotting_threshold)
    this.sketch(point_list)
    return frame.done
  }

  update(surface_type, sketch_type) {
    if (surface_type != this.manifold.short_name || !this.manifold) {
      this.manifold = new this.manifolds[surface_type]()
    }
    if (sketch_type != this.sketch) {
      this.sketch = sketch_type
    }
  }
}
// end of app.js