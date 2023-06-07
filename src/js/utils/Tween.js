export class Tween {
    linear(t) {
      t = Math.max(0, Math.min(t, 1));
      return t;
    }
  
    powerIn(t, a = 2) {
      t = Math.max(0, Math.min(t, 1));
      return Math.pow(t, a);
    }
  
    powerOut(t, a = 2) {
      t = 1.0 - Math.max(0, Math.min(t, 1));
      return 1.0 - Math.pow(t, a);
    }
  
    powerInOut(t, a = 2) {
      t = Math.max(0, Math.min(t, 1));
      if (t < 0.5) {
        return Math.pow(t * 2, a) * 0.5;
      } else {
        return 1.0 - Math.pow((1 - t) * 2, a) * 0.5;
      }
    }
  
    sineIn(t) {
      t = 1.0 - Math.max(0, Math.min(t, 1));
      return 1.0 - Math.sin(t * Math.PI * 0.5);
    }
  
    sineOut(t) {
      return Math.sin(t * Math.PI * 0.5);
    }
  
    sineInOut(t) {
      t = Math.max(0, Math.min(t, 1));
      return Math.sin((t - 0.5) * Math.PI) * 0.5 + 0.5;
    }
  
    circularIn(t) {
      t = Math.max(0, Math.min(t, 1));
      return sqrt(1 - (1 - t) * (1- t));
    }
  
    circularOut(t) {
      t = Math.max(0, Math.min(t, 1));
      return 1 - sqrt(1 - (t) * (t));
    }
  
    circularInOut(t) {
      t = Math.max(0, Math.min(t, 1));
  
      if (t < 0.5) {
        t *= 2;
        return 0.5 - sqrt(1 - (t) * (t)) * 0.5;
      } else {
        t = (t - 0.5) * 2;
        return 0.5 + sqrt(1 - (1 - t) * (1 - t)) * 0.5;
      }
    }
  
    createCubicBezier(a, b, resolution = 40) {
      let buff = [];
  
      let n = 0;
      let i = 0;
      while (i <= resolution && n <= resolution * 10) {
        let x = 3*(1-n)*(1-n)*n * a.x + 3*(1-n)*n*n * b.x + n*n*n;
        if (x > i / resolution) {
          let y = 3*(1-n)*(1-n)*n * a.y + 3*(1-n)*n*n * b.y + n*n*n;
          buff.push(y);
          i ++;
        }
        n += 1 / resolution / 10;
      }
      return (t)=>{
        t = Math.max(0, Math.min(t, 1));
        let ti = floor(t * resolution);
        let tr = t * resolution - ti;
  
        if (ti >= buff.length - 1) {
            return buff[ti];
        } else {
            return buff[ti] * (1-tr) + buff[ti + 1] * tr;
        }
      }
    }
  }