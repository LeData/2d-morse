function* infinite_random(grid_size) {
  while (true){
    yield random(grid_size) / grid_size
  }
}

function S1_point(theta) {
  return [cos(theta), sin(theta)]
}

class KleinBottle {

  constructor(granularity) {
    // The granularity is that of the grid of the manifold maps
    this.random_gen = infinite_random(granularity)
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
    return [x, a, b];
  }

  compute_det(plane, t_1, t_2) {
    let [x, a, b] = this.embed(t_1, t_2);
    // The direct computation above is a few orders of magnitude faster than the one below.
    // det = dot(u.slice(0,4), a) * dot(u.slice(4),b) - dot(u.slice(0,4), b) * dot(u.slice(4), a);
    let det = ((plane[0][0]*a[0]+plane[0][1]*a[1]+plane[0][2]*a[2]+plane[0][3]*a[3])*(plane[1][0]*b[0]+plane[1][1]*b[1]+plane[1][2]*b[2]+plane[1][3]*b[3])-(plane[0][0]*b[0]+plane[0][1]*b[1]+plane[0][2]*b[2]+plane[0][3]*b[3])*(plane[1][0]*a[0]+plane[1][1]*a[1]+plane[1][2]*a[2]+plane[1][3]*a[3]));
    return [x, det];
  }
}

class RP2 {

  constructor(granularity) {
    // The granularity is that of the grid of the manifold maps
    this.random_gen = infinite_random(granularity);
    console.log("Creating a Projective Plane");
  }

  * get_random_point() {
    while (true) {
      let n_1 = this.random_gen.next().value
      let n_2 = max(0.0000001, this.random_gen.next().value)
      yield [PI * n_1, -PI/2 + PI * n_2];
    }
  }

  derivate(X) {
    // This may be a misnomer
    return [X[0] * X[0] - X[1] * X[1], 2 * X[0] * X[1]];
  }

  embed(t_1, t_2) {
     let X = S1_point(t_1);
     let Y = S1_point(t_2);
     let DX = this.derivate(X);
     let DY = this.derivate(Y);
     let x = [Y[0]*Y[0]*DX[0], Y[0]*Y[0]*DX[1]/2, X[0]*DY[1]/2, X[1]*DY[1]/2];
     let a = [-2*Y[0]*Y[0]*DX[1], Y[0]*Y[0]*DX[0], -X[1]*DY[1], 4*PI*X[0]*DY[1]];
     let b = [DX[0]*DY[1], DX[1]*DY[1]/2, X[0]*DY[0], X[1]*DY[0]];
     return [x, a, b];
   }

  compute_det(plane, t_1, t_2) {
    let [x, a, b] = this.embed(t_1, t_2);
    // The direct computation above is a few orders of magnitude faster than the one below.
    // det = dot(u.slice(0,4), a) * dot(u.slice(4),b) - dot(u.slice(0,4), b) * dot(u.slice(4), a);
    let det = ((plane[0][0]*a[0]+plane[0][1]*a[1]+plane[0][2]*a[2]+plane[0][3]*a[3])*(plane[1][0]*b[0]+plane[1][1]*b[1]+plane[1][2]*b[2]+plane[1][3]*b[3])-(plane[0][0]*b[0]+plane[0][1]*b[1]+plane[0][2]*b[2]+plane[0][3]*b[3])*(plane[1][0]*a[0]+plane[1][1]*a[1]+plane[1][2]*a[2]+plane[1][3]*a[3]));
    return [x, det];
  }
}

class Torus {

  constructor(granularity) {
    // The granularity is that of the grid of the manifold maps
    this.random_gen = infinite_random(granularity)
    console.log("Creating a Torus")
  }

  * get_random_point() {
    while (true) {
      let n_1 = this.random_gen.next().value
      let n_2 = this.random_gen.next().value
    return [2 * PI * n_1, 2 * PI * n_2];
    }
  }

  embed(t_1, t_2) {
    let X = S1_point(t_1);
    let Y = S1_point(t_2);
    let x = X.concat(Y);
    let a = [-X[1], X[0], 0, 0];
    let b = [0, 0, -Y[1], Y[0]];
    return [x, a, b];
  }

  compute_det(plane, t_1, t_2) {
    let x, a, b = this.embed(t_1, t_2);
    let det = ((plane[0][0]*a[0]+plane[0][1]*a[1]+plane[0][2]*a[2]+plane[0][3]*a[3])*(plane[1][0]*b[0]+plane[1][1]*b[1]+plane[1][2]*b[2]+plane[1][3]*b[3])-(plane[0][0]*b[0]+plane[0][1]*b[1]+plane[0][2]*b[2]+plane[0][3]*b[3])*(plane[1][0]*a[0]+plane[1][1]*a[1]+plane[1][2]*a[2]+plane[1][3]*a[3]));
    return [x, det];
  }
}
