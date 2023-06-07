export class Line {
    constructor(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }

    fromTwoPoints(p0, p1) {
        let dx = p1.x - p0.x;
        let dy = p1.y - p0.y;
        this.a = dy;
        this.b = -dx;
        this.c = dx * p0.y - dy * p0.x;
        return this;
    }

    fromPointAndAngle(p0, angle) {
        let p1 = { x: p0.x + Math.cos(angle), y: p0.y + Math.sin(angle) };
        return this.fromTwoPoints(p0, p1);
    }

    intersects(o) {
        if (o instanceof Line) {
            let d = this.a * o.b - o.a * this.b;
            return d != 0.0;
        } else if (o instanceof LineSegment) {
            let t1 = this.a * o.p0.x + this.b * o.p0.y + this.c;
            let t2 = this.a * o.p1.x + this.b * o.p1.y + this.c;
            return t1 * t2 <= 0;
        }
        return undefined;
    }

    getIntersectionPoint(o) {
        if (o instanceof Line) {
            let d = this.a * o.b - o.a * this.b;
            if (d == 0.0) { return undefined; }
            let x = (this.b * o.c - o.b * this.c) / d;
            let y = (o.a * this.c - this.a * o.c) / d;
            return createVector(x, y);
        } else if (o instanceof LineSegment) {
            if (!this.intersects(o)) { return undefined; }
            return this.getIntersectionPoint(o.toLine());
        }
        return undefined;
    }

    getAngle() {
        return atan2(this.a, -this.b);
    }

    getPerpendicular(p) {
        return new Line(this.b, -this.a, this.a * p.y - this.b * p.x);
    }

    getParallel(p) {
        return new Line(this.a, this.b, -this.a * p.x - this.b * p.y);
    }

    getNearestPoint(p) {
        let l = this.getPerpendicular(p);
        return this.getIntersectionPoint(l);
    }
}


export class LineSegment {
    constructor(x0, y0, x1, y1) {
        this.p0 = createVector(x0, y0);
        this.p1 = createVector(x1, y1);
    }

    fromTwoPoints(p0, p1) {
        this.p0 = p0;
        this.p1 = p1;
        return this;
    }

    fromTwoPointsAndLength(p0, p1, length) {
        this.p0 = p0;
        let n = p1.copy().sub(p0).normalize();
        this.p1 = n.mult(length).add(p0);
        return this;
    }

    toLine() {
        return new Line().fromTwoPoints(this.p0, this.p1);
    }

    intersects(o) {
        if (o instanceof Line) {
            let t0 = o.a * this.p0.x + o.b * this.p0.y + o.c;
            let t1 = o.a * this.p1.x + o.b * this.p1.y + o.c;
            return t0 * t1 < 0;
        } else if (o instanceof LineSegment) {
            return this.intersects(o.toLine()) && o.intersects(this.toLine());
        }
        return undefined;
    }

    getIntersectionPoint(o) {
        if (o instanceof Line) {
            if (!this.intersects(o)) { return undefined; }
            return o.getIntersectionPoint(this.toLine());
        } else if (o instanceof LineSegment) {
            if (!this.intersects(o)) { return undefined; }
            return o.toLine().getIntersectionPoint(this.toLine());
        }
        return undefined;
    }

    getAngle() {
        return atan2(this.p1.y - this.p0.y, this.p1.x - this.p0.x);
    }

    getLength() {
        return p0.dist(p1);
    }

    getNearestPoint(p) {
        if (this.p1.copy().sub(this.p0).dot(p.copy().sub(this.p0)) < 0) return this.p0;
        if (this.p0.copy().sub(this.p1).dot(p.copy().sub(this.p1)) < 0) return this.p1;
        return this.toLine().getNearestPoint(p);
    }

    getBisection() {
        let o = this.getMidPoint();
        return this.toLine().getPerpendicular(o);
    }

    getMidPoint() {
        return this.p0.copy().add(this.p1).mult(0.5);
    }

    getPerpendicular(p) {
        return this.toLine().getPerpendicular(p);
    }

    getParallel(p) {
        return this.toLine().getParallel(p);
    }
}

export class Circle {
    constructor(x, y, radius) {
        this.center = createVector(x, y);
        this.radius = radius;
    }

    fromCenterAndRadius(center, radius) {
        this.center = center;
        this.radius = radius;
        return this;
    }

    fromCenterAndPoint(center, p) {
        this.center = center;
        this.radius = center.dist(p);
        return this;
    }

    fromThreePoints(p0, p1, p2) {
        let x = ((p0.y - p2.y) * (p0.y * p0.y - p1.y * p1.y + p0.x * p0.x - p1.x * p1.x)
            - (p0.y - p1.y) * (p0.y * p0.y - p2.y * p2.y + p0.x * p0.x - p2.x * p2.x))
            / (2 * (p0.y - p2.y) * (p0.x - p1.x)
                - 2 * (p0.y - p1.y) * (p0.x - p2.x));

        let y = ((p0.x - p2.x) * (p0.x * p0.x - p1.x * p1.x + p0.y * p0.y - p1.y * p1.y)
            - (p0.x - p1.x) * (p0.x * p0.x - p2.x * p2.x + p0.y * p0.y - p2.y * p2.y))
            / (2 * (p0.x - p2.x) * (p0.y - p1.y) - 2 * (p0.x - p1.x) * (p0.y - p2.y));
        this.center = createVector(x, y);
        this.radius = this.center.dist(p0);
        return this;
    }

    getIntersectionPoints(o) {
        let points = [];
        if (o instanceof Line) {
            let l = o.a * o.a + o.b * o.b;
            let k = o.a * this.center.x + o.b * this.center.y + o.c;
            let d = l * this.radius * this.radius - k * k;
            if (d > 0) {
                let ds = sqrt(d);
                let apl = o.a / l;
                let bpl = o.b / l;
                let xc = this.center.x - apl * k;
                let yc = this.center.y - bpl * k;
                let xd = bpl * ds;
                let yd = apl * ds;
                points.push(createVector(xc - xd, yc + yd));
                points.push(createVector(xc + xd, yc - yd));
            } else if (d == 0) {
                points.push(createVector(this.center.x - o.a / l, this.center.y - o.b * k / l));
            }
        } else if (o instanceof LineSegment) {
            let l = o.toLine();
            let temp = [];
            temp = this.getIntersectionPoints(l, this);
            for (let i = 0; i < temp.length; i++) {
                let d0 = (o.p0.copy().sub(o.p1)).dot(temp[i].copy().sub(o.p1));
                let d1 = (o.p1.copy().sub(o.p0)).dot(temp[i].copy().sub(o.p0));
                if (d0 >= 0 && d1 >= 0) points.push(temp[i]);
            }
        }
        return points;
    }
}


function createVector(x, y) {
    return {x, y};
}