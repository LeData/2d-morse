// beginning of manifold.js

function dot2(x,y){
  return x[0]*y[0] + x[1]*y[1] + x[2]*y[2] + x[3]*y[3]
}

function* infinite_random(grid_size) {
  while (true){
    yield random(grid_size) / grid_size
  }
}

function S1_point(theta) {
  return [cos(theta), sin(theta)]
}

class Plane {

  constructor(vector1, vector2){
    this.X = vector1;
    this.Y = this.check_dim(vector2);
  }

  check_dim(v) {
    if (this.X.length != v.length) {
      throw new Error("The vectors are of different length");
    }
    return v
  }

  contains(vector) {
    return this.project(vector) == vector
  }

  project(vector) {
    vector = this.check_dim(vector)
    return [dot2(this.X, vector), dot2(this.Y, vector)]
  }

  shift(dX, dY) {
    let vector1 = this.check_dim(dX)
    let vector2 = this.check_dim(dY)
    for (let i; i<this.X.length; i++){
      this.X[i] += vector1[i]
      this.Y[i] += vector2[i]
    }
  }
}

function* linear_plane_transition(starting_plane, ending_plane, steps=30) {
    console.log('initialising transition generator')
    let plane = starting_plane

    let dX = []
    for (let i=0; i<ending_plane.X.length; i++) {
      dX[i] = (ending_plane.X[i] - starting_plane.X[i]) / steps;
    }
    let dY = []
    for (let i=0; i<ending_plane.X.length; i++) {
      dY[i] = (ending_plane.Y[i] - starting_plane.Y[i]) / steps;
    }
    for (let i = 0; i < steps; i += 1) {
        plane.shift(dX, dY);
        yield plane;
    }
    return plane;
}

class Manifold {
  constructor(granularity=10000) {
    // The granularity is that of the grid of the manifold maps
    this.random_gen = infinite_random(granularity)
  }

  * get_random_point() {
    while (true) {
      let n_1 = this.random_gen.next().value
      let n_2 = this.random_gen.next().value
      yield [n_1, n_2];
    }
  }

  embed(t_1, t_2) {
    let a = [1,0]
    let b = [0,1];
    let plane = new Plane(a, b)
    return [x, plane];
    }

  get_random_projection_onto(plane) {
    let [t_1, t_2] = this.get_random_point();
    let [x, tangent] = this.embed(t_1, t_2);
    // The direct computation above is a few orders of magnitude faster than the one below.
    // det = dot(u.slice(0,4), a) * dot(u.slice(4),b) - dot(u.slice(0,4), b) * dot(u.slice(4), a);
    let det = ((plane.X[0]*tangent.X[0]+plane.X[1]*tangent.X[1]+plane.X[2]*tangent.X[2]+plane.X[3]*tangent.X[3])*(plane.Y[0]*tangent.Y[0]+plane.Y[1]*tangent.Y[1]+plane.Y[2]*tangent.Y[2]+plane.Y[3]*tangent.Y[3])-(plane.X[0]*tangent.Y[0]+plane.X[1]*tangent.Y[1]+plane.X[2]*tangent.Y[2]+plane.X[3]*tangent.Y[3])*(plane.Y[0]*tangent.X[0]+plane.Y[1]*tangent.X[1]+plane.Y[2]*tangent.X[2]+plane.Y[3]*tangent.X[3]));
    return [plane.project(x), det];
  }

}

class KleinBottle extends Manifold{

  constructor(granularity) {
    // The granularity is that of the grid of the manifold maps
    super(granularity)
    console.log("Creating a Klein bottle")
  }

  * get_random_point() {
    while (true) {
      let n_1 = this.random_gen.next().value
      let n_2 = this.random_gen.next().value
      yield [2 * PI * n_1, 2 * PI * n_2];
    }
  }

  embed(t_1, t_2) {
    let X = S1_point(t_1);
    let Y = S1_point(t_2);
    let DY = S1_point(t_2/2);
    let x = [X[0]*Y[0], X[0]*Y[1], 2*X[1]*DY[0], 2*X[1]*DY[1]];
    let a = [-X[1]*Y[0], -X[1]*Y[1], 2*X[0]*DY[0], 2*X[0]*DY[1]];
    let b = [-X[0]*Y[1], X[0]*Y[0], -X[1]*DY[1], X[1]*DY[0]];
    let plane = new Plane(a, b)
    return [x, plane];
  }
}

class RP2 extends Manifold{

  constructor(granularity) {
    // The granularity is that of the grid of the manifold maps
    super(granularity)
    console.log("Creating a Projective Plane");
  }

  get_random_point() {
    let n_1 = this.random_gen.next().value;
    let n_2 = max(0.0000001, this.random_gen.next().value);
    return [PI * n_1, -PI/2 + PI * n_2]
  }

  derivate(X) {
    // This may be a misnomer
    return [X[0] * X[0] - X[1] * X[1], 2 * X[0] * X[1]];
  }

  embed(t_1, t_2) {
     //get the embedded point in R^4 and a basis for the tangent space.
     let X = S1_point(t_1);
     let Y = S1_point(t_2);
     let DX = this.derivate(X);
     let DY = this.derivate(Y);
     let x = [Y[0]*Y[0]*DX[0], Y[0]*Y[0]*DX[1]/2, X[0]*DY[1]/2, X[1]*DY[1]/2];
     let a = [-2*Y[0]*Y[0]*DX[1], Y[0]*Y[0]*DX[0], -X[1]*DY[1], 4*PI*X[0]*DY[1]];
     let b = [DX[0]*DY[1], DX[1]*DY[1]/2, X[0]*DY[0], X[1]*DY[0]];
     let plane = new Plane(a, b)
     return [x, plane];
   }

  get_random_projection_onto(plane) {
    let [t_1, t_2] = this.get_random_point();
    let [x, tangent] = this.embed(t_1, t_2);
    // The direct computation above is a few orders of magnitude faster than the one below.
    // det = dot(u.slice(0,4), a) * dot(u.slice(4),b) - dot(u.slice(0,4), b) * dot(u.slice(4), a);
    let det = ((plane.X[0]*tangent.X[0]+plane.X[1]*tangent.X[1]+plane.X[2]*tangent.X[2]+plane.X[3]*tangent.X[3])*(plane.Y[0]*tangent.Y[0]+plane.Y[1]*tangent.Y[1]+plane.Y[2]*tangent.Y[2]+plane.Y[3]*tangent.Y[3])-(plane.X[0]*tangent.Y[0]+plane.X[1]*tangent.Y[1]+plane.X[2]*tangent.Y[2]+plane.X[3]*tangent.Y[3])*(plane.Y[0]*tangent.X[0]+plane.Y[1]*tangent.X[1]+plane.Y[2]*tangent.X[2]+plane.Y[3]*tangent.X[3]));

    return [plane.project(x), det];
  }
}

class Torus extends Manifold{

  constructor(granularity) {
    // The granularity is that of the grid of the manifold maps
    super(granularity)
    console.log("Creating a Torus")
  }

  get_random_point() {
    let n_1 = this.random_gen.next().value
    let n_2 = this.random_gen.next().value
    return [2 * PI * n_1, 2 * PI * n_2];
  }

  embed(t_1, t_2) {
    let X = S1_point(t_1);
    let Y = S1_point(t_2);
    let x = X.concat(Y);
    let a = [-X[1], X[0], 0, 0];
    let b = [0, 0, -Y[1], Y[0]];
    let plane = new Plane(a, b)
    return [x, plane];
  }
}
// end of manifold.js