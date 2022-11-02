var CW, CH, CTX;
const RES = 5;
const NUM = 8;

class Circle {
  constructor (x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.stroke();
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;

    let bounceX = false, bounceY = false;

    if (this.x < 0) {
      this.x *= -1;
      bounceX = true;
    }
    else if (this.x > CW) {
      this.x = 2 * CW - this.x;
      bounceX = true;
    }

    if (this.y < 0) {
      this.y *= -1;
      bounceY = true;
    }
    else if (this.y > CH) {
      this.y = 2 * CH - this.y;
      bounceY = true;
    }

    return [
      (bounceX ? -1 : 1),
      (bounceY ? -1 : 1),
    ];
  }
}

function main() {
  CW = window.innerWidth;
  CH = window.innerHeight;
  
  $("canvas").attr("width", CW);
  $("canvas").attr("height", CH);

  CTX = $("canvas")[0].getContext("2d");
  CTX.lineWidth = 2;
  CTX.strokeStyle = "black";
  CTX.fillStyle = "black";
  CTX.textAlign = "center";
  CTX.textBaseline = "middle";

  let circles = makeCircles(NUM);

  window.setInterval(
    function () {
      CTX.clearRect(0, 0, CW, CH);

      for (const c of circles) {
        let bounces = c.move(c.vx, c.vy);
        c.vx *= bounces[0];
        c.vy *= bounces[1];
      }

      let nValues = [];

      for (let j = 0; j <= CH / RES; ++j) {
        nValues.push([]);
        for (let i = 0; i <= CW / RES; ++i) {
          let n = calculatePointValue(i, j, circles);
          nValues[j].push(n);
          // CTX.fillText(n.toFixed(1), i * RES, j * RES);
        }
      }

      for (let j = 0; j < CH / RES; ++j) {
        for (let i = 0; i < CW / RES; ++i) {
          drawMarchingSquareLines(
            i, j,
            nValues[j + 0][i + 0], nValues[j + 0][i + 1],
            nValues[j + 1][i + 0], nValues[j + 1][i + 1]
          );
        }
      }
    },
    25
  );
}

function makeCircles(n) {
  let circles = [];

  for (let i = 0; i < n; ++i) {
    let c = new Circle(0, 0, rand(25, 75));
    c.vx = rand(0.1, 1) * (rand(0, 1) * 2 - 1);
    c.vy = rand(0.1, 1) * (rand(0, 1) * 2 - 1);
    circles.push(c);
  }

  return circles;
}

function calculatePointValue(i, j, circles) {
  let n = 0;

  for (const c of circles) {
    n += (c.r * c.r) / (Math.pow(i * RES - c.x, 2) + Math.pow(j * RES - c.y, 2));
  }

  return n;
}

function drawMarchingSquareLines(x, y, a, b, c, d) {
  const p = [x + (1 - a) / (b - a), y    ];
  const s = [x + (1 - c) / (d - c), y + 1];
  const q = [x + 1, y + (1 - b) / (d - b)];
  const r = [x,     y + (1 - a) / (c - a)];

  switch (getConfiguration(d, c, b, a)) {
    case 0x1: line(p, r);             break;
    case 0x2: line(p, q);             break;
    case 0x3: line(q, r);             break;
    case 0x4: line(r, s);             break;
    case 0x5: line(p, s);             break;
    case 0x6: line(p, r); line(q, s); break;
    case 0x7: line(q, s);             break;
    case 0x8: line(q, s);             break;
    case 0x9: line(p, q); line(r, s); break;
    case 0xA: line(p, s);             break;
    case 0xB: line(r, s);             break;
    case 0xC: line(q, r);             break;
    case 0xD: line(p, q);             break;
    case 0xE: line(p, r);             break;
  }
}

function getConfiguration(a, b, c, d) {
  return (
    ((a >= 1) << 3) |
    ((b >= 1) << 2) |
    ((c >= 1) << 1) |
    ((d >= 1) << 0)
  );
}

function line(m, n) {
  CTX.beginPath();
  CTX.moveTo(RES * m[0], RES * m[1]);
  CTX.lineTo(RES * n[0], RES * n[1]);
  CTX.stroke();
}

function numberToColor(n) {
  const brightness = Math.min(n, 1) * 100;
  return `hsl(0, 0%, ${brightness}%`;
}

function rand(m, n) {
  return Math.floor(Math.random() * (n - m + 2)) + m;
}

$(document).ready(main);
