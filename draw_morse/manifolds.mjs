// beginning of manifold.js

/**
 * Computes the dot product of two vectors
 * kept for performance reasons
 * @param {nVector} x - The first vector
 * @param {nVector} y - The second vector
 */
function dot2(x,y){
    let product = 0
    for (let i=0; i<x.length(); i++){
        product += x[i]*y[i]
    }
  return product
}

/**
 * returns a random number between 0 and 1 with a given resolution
 * @param {int} grid_size - size of the grid to use
 */
function* infinite_random(grid_size) {
  while (true){
    yield random(grid_size) / grid_size
  }
}

/**
 * returns the cartesian coordinates of a point on the the unit circle in R2
 * @param {float} theta - angle between 0 and 2 pi
 */
function S1_point(theta) {
  return [cos(theta), sin(theta)]
}

function* instant_plane(planesel) {
  while (true){
    yield new Plane(planesel.X, planesel.Y)
  }
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

  dproj(manifold_point) {
    let det_1 = dot2(this.X, manifold_point.dp.X) * dot2(this.Y,manifold_point.dp.Y);
    let det_2 = dot2(this.X, manifold_point.dp.Y) * dot2(this.Y, manifold_point.dp.X);
    return {'p': this.project(manifold_point.p), 'det': det_1 - det_2}
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
  constructor(embedding_size, granularity=10000, density=12000) {
    // The granularity is that of the grid of the manifold maps
    this.dim = embedding_size;
    this.random_gen = infinite_random(granularity)
    this.points = null
    this.density = density
  }

  check_dim(v) {
    if (this.dim != v.length) {
      throw new Error("The vectors doesn't live in the embedding space.");
    }
    return v
  }

  * get_random_point() {
    while (true) {
      let n_1 = this.random_gen.next().value
      let n_2 = this.random_gen.next().value
      yield [n_1, n_2];
    }
  }

  get_random_grid() {
    this.points = []
    for (let i=0; i<this.density; i++) {
      let [t_1, t_2] = this.get_random_point();
      this.points.push(this.embed(t_1, t_2))
    }
  }

  /**
   * Returns the coordinates of the embedded point in the embedding space, and a basis for its tangent space.
   * @param {float} t_1 - first coordinate of the point
   * @param {float} t_2 - second coordinate of the point
   */
  embed(t_1, t_2) {
    let a = [1,0]
    let b = [0,1];
    let plane = new Plane(a, b)
    let x = [t_1, t_2]
    return {'p': x, 'dp': plane};
  }

  /**
  * Returns the list of points of the manifold whose
  * derivative is below a certain threshold for the passed function.
  * @param {Function} fct - function applied to the manifold
  * @param {float} thr - threshold used to find critical_points and values
  */
  get_critical_values_of(fct, thr) {
    let critical_values = []
    for (let p of this.points) {
      let d = fct(p)
      if (d.det < thr) {
        critical_values.push(d)
      }
    }
    return critical_values
  }

}

export class KleinBottle extends Manifold{

  constructor(granularity) {
    // The granularity is that of the grid of the manifold maps
    super(4, granularity)
    console.log("Creating a Klein bottle")
  }

  get short_name() {
      return 'Klein'
  }

  get_random_point() {
    let n_1 = this.random_gen.next().value
    let n_2 = this.random_gen.next().value
    return [2 * PI * n_1, 2 * PI * n_2];
  }

  /**
  * Returns the coordinates of the embedded point in the embedding space, and a basis for its tangent space.
  * @param {float} t_1 - first coordinate of the point
  * @param {float} t_2 - second coordinate of the point
  */
  embed(t_1, t_2) {
    let X = S1_point(t_1);
    let Y = S1_point(t_2);
    let DY = S1_point(t_2/2);
    let x = [X[0]*Y[0], X[0]*Y[1], 2*X[1]*DY[0], 2*X[1]*DY[1]];
    let a = [-X[1]*Y[0], -X[1]*Y[1], 2*X[0]*DY[0], 2*X[0]*DY[1]];
    let b = [-X[0]*Y[1], X[0]*Y[0], -X[1]*DY[1], X[1]*DY[0]];
    let plane = new Plane(a, b)
     return {'p': x, 'dp': plane};
  }
}

export class RP2 extends Manifold{

  constructor(granularity) {
    // The granularity is that of the grid of the manifold maps
    super(granularity=granularity, embedding_size=4)
    console.log("Creating a Projective Plane");
  }

  get short_name() {
      return 'RP2'
  }

  get_random_point() {
    let n_1 = this.random_gen.next().value;
    let n_2 = max(0.0000001, this.random_gen.next().value);
    return [PI * n_1, -PI/2 + PI * n_2]
  }

  tangent_basis(X) {
    // This may be a misnomer
    return [X[0] * X[0] - X[1] * X[1], 2 * X[0] * X[1]];
  }

  /**
  * Returns the coordinates of the embedded point in R^4 and a basis for its tangent space.
  * @param {float} t_1 - first coordinate of the point
  * @param {float} t_2 - second coordinate of the point
  */
  embed(t_1, t_2) {
     let X = S1_point(t_1);
     let Y = S1_point(t_2);
     let DX = this.tangent_basis(X);
     let DY = this.tangent_basis(Y);
     let x = [Y[0]*Y[0]*DX[0], Y[0]*Y[0]*DX[1]/2, X[0]*DY[1]/2, X[1]*DY[1]/2];
     let a = [-2*Y[0]*Y[0]*DX[1], Y[0]*Y[0]*DX[0], -X[1]*DY[1], 4*PI*X[0]*DY[1]];
     let b = [DX[0]*DY[1], DX[1]*DY[1]/2, X[0]*DY[0], X[1]*DY[0]];
     let plane = new Plane(a, b)
     return {'p': x, 'dp': plane};
   }
}

export class Torus extends Manifold{

  constructor(granularity) {
    // The granularity is that of the grid of the manifold maps
    super(granularity=granularity, embedding_size=4)
    console.log("Creating a Torus")
  }

  get short_name() {
      return 'Torus'
  }

  get_random_point() {
    let n_1 = this.random_gen.next().value
    let n_2 = this.random_gen.next().value
    return [2 * PI * n_1, 2 * PI * n_2];
  }

  /**
  * Returns the coordinates of the embedded point in R^4 and a basis for its tangent space.
  * @param {float} t_1 - first coordinate
  * @param {float} t_2 - second coordinate
  */
  embed(t_1, t_2) {
    let X = S1_point(t_1);
    let Y = S1_point(t_2);
    let x = X.concat(Y);
    let a = [-X[1], X[0], 0, 0];
    let b = [0, 0, -Y[1], Y[0]];
    let plane = new Plane(a, b)
     return {'p': x, 'dp': plane};
  }
}
// end of manifold.js