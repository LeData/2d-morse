// beginning of painting.js
function plot_lines(point_list, connectionRadius=0.4) {
    let lineWeight = 1;
    push();
    strokeWeight(lineWeight);

    translate(windowWidth / 2, windowHeight / 2);
    let pointCount = point_list.length
    //let connectionRadius = .4
    //let lineColor = [201, 23, 137];
    let lineColor = [0, 0, 0];
    let lineAlpha = 80;
    let scale = 300;
    for (let i = 0; i < pointCount; i++) {
      for (var j = max(0, i-20); j < i; j++) {
        let x1 = point_list[i].p
        let x2 = point_list[j].p
        var d = dist(x1[0], x1[1], x2[0], x2[1]);
        var a = pow(1 / (d / connectionRadius + 1), 2);
        if (d <= connectionRadius) {
          stroke(lineColor[0], lineColor[1], lineColor[2], a * lineAlpha);
          line(scale*x1[0], scale*x1[1], scale*x2[0], scale*x2[1]);
        }
      }
    }
    pop();
  }

/**
 * Plots points as squares with random height and width
 * @param {Vector} x - The first vector
 * @param {Vector} y - The second vector
 */
function plot_squares(point_list) {
    let s_ratio = 3;
    translate(windowWidth / 2, windowHeight / 2);
    let scale = 300;
    for (let k of point_list) {
        base = 1000 * abs(k.det)

        let c = 2 * base;
        stroke(c);
        fill(max(0, 255-c));

        let s = 3 / max(1,base)
        rect(scale * k.p[0], scale * k.p[1],
            1 + s*random(3), 1/s_ratio + s*random(3));
      }
  }

// end of painting.js