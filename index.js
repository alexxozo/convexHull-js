/* Structures and Helper Functions */
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// The first point - where we start the search
let p0 = new Point();

function nextToTop(s) {
    return s[s.length - 2];
}

function distanceSq(p1, p2) {
    return (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
}

// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are colinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function orientation(p, q, r) {
    let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

    if (val == 0) return 0;    // colinear
    return (val > 0) ? 1 : 2;  // clock or counterclock wise
}

// A function used by library function qsort() to sort an array of
// points with respect to the first point
function compare(p1, p2) {
    // Find orientation
    let o = orientation(p0, p1, p2);
    if (o == 0) return (distanceSq(p0, p2) >= distanceSq(p0, p1)) ? -1 : 1;

    return (o == 2) ? -1 : 1;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* Actual Algorithm */
async function convexHull(points, delay) {
    // Draw all points
    let originalPoints = points.slice();

    // Size of points
    let n = points.length;

    // Find the bottommost point
    let ymin = points[0].y, min = 0;
    for (let i = 1; i < n; i++) {
        let y = points[i].y;

        // Pick the bottom-most or chose the left
        // most point in case of tie
        if ((y < ymin) || (ymin == y && points[i].x < points[min].x))
            ymin = points[i].y, min = i;
    }

    // Place the bottom-most point at first position
    [points[0], points[min]] = [points[min], points[0]];

    // Sort n-1 points with respect to the first point.
    // A point p1 comes before p2 in sorted ouput if p2
    // has larger polar angle (in counterclockwise
    // direction) than p1
    p0 = points[0];

    points.sort(compare);

    // If two or more points make same angle with p0,
    // Remove all but the one that is farthest from p0
    // Remember that, in above sorting, our criteria was
    // to keep the farthest point at the end when more than
    // one points have same angle.
    let m = 1;  // Initialize size of modified array
    for (let i = 1; i < n; i++) {
        // Keep removing i while angle of i and i+1 is same
        // with respect to p0
        while (i < n - 1 && orientation(p0, points[i], points[i + 1]) == 0) i++;

        points[m] = points[i];
        m++;  // Update size of modified array
    }

    // If modified array of points has less than 3 points,
    // convex hull is not possible
    if (m < 3) return;

    // Create an empty stack and push first three points
    // to it.
    let S = [];
    S.push(points[0]);
    S.push(points[1]);
    S.push(points[2]);


    // Process remaining n-3 points
    for (let i = 3; i < m; i++) {
        // Keep removing top while the angle formed by
        // points next - to - top, top, and points[i] makes
        // a non - left turn

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawAllPoints(originalPoints, 'blue');
        drawLinesBetweenPoints(S, 'open');

        await sleep(delay);
        while (orientation(nextToTop(S), S[S.length - 1], points[i]) != 2) {
            let a = S.pop();
        }

        S.push(points[i]);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAllPoints(originalPoints, 'blue');
    drawLinesBetweenPoints(S, 'closed');

    S.forEach((p) => {
        drawCircle(p, 4, 'red');
    });
}

/* Canvas Functions */
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext('2d');

function yToScreen(y) {
    return -y + canvas.height;
}

function drawCircle(p, radius, color) {
    let point = new Point(p.x, yToScreen(p.y));
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fill();
}

function drawText(x, y, text) {
    let point = new Point(x + 10, yToScreen(y + 10));
    ctx.fillText(text, point.x, point.y);
}

function drawAllPoints(pts, color) {
    pts.forEach((p) => {
        drawCircle(p, 4, color);
        drawText(p.x + 0.1, p.y, '(' + p.x / 10 + ',' + p.y / 10 + ')');
    });
}

function drawLine(p1, p2, color) {
    let point1 = new Point(p1.x, yToScreen(p1.y));
    let point2 = new Point(p2.x, yToScreen(p2.y));
    ctx.beginPath();
    ctx.moveTo(point1.x, point1.y);
    ctx.lineTo(point2.x, point2.y);
    ctx.stroke();
}

function drawLinesBetweenPoints(S, type) {
    for (let i = 0; i < S.length - 1; i++) {
        drawLine(S[i], S[i + 1]);
    }
    if (type == 'closed') {
        drawLine(S[0], S[S.length - 1]);
    }
}

/* Main Program */
let points = [];

canvas.addEventListener('click', (e) => {
    var mousePos = getMousePos(canvas, e);
    points.push(new Point(mousePos.x, mousePos.y));
    drawCircle(points[points.length - 1], 4, 'blue');
});

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: -(evt.clientY - rect.top - canvas.height)
    };
}

document.querySelector('button').addEventListener('click', () => {
    let delay = document.querySelector('input').value;
    convexHull(points, delay);
});




