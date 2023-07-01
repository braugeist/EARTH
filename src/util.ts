export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function rad2deg(rad) { return rad * 180 / Math.PI; }
export function deg2rad(degr) { return degr * Math.PI / 180; }

export function tilePoints(t) {
  var poly = [];
  for (var i = 0; i < t.corners.length; i++) {
    const c = t.corners[i];
    const [lat, lng] = spherical(c.v);
    poly.push(lng, lat);
  }
  return poly;
}

function spherical(v) {
  const x = v[2];
  const y = v[0];
  const z = v[1];
  const lat = 90 - rad2deg(Math.acos(z / (x * x + y * y + z * z)));
  const lng = rad2deg(function (x, y, z) {
    if (x > 0) return Math.atan(y / x);
    if (x < 0 && y >= 0) return Math.atan(y / x) + Math.PI;
    if (x < 0 && y < 0) return Math.atan(y / x) - Math.PI;
    if (x == 0 && y > 0) return Math.PI / 2;
    if (x == 0 && y < 0) return -Math.PI / 2;
  }(x, y, z));
  return [lat, lng];
}

export function closeAllModals() {
  const modals = document.getElementsByClassName('modal');
  for (let i = 0; i < modals.length; i++) {
    (modals[i] as HTMLElement).style.display = 'none';
  }
}

export function enableErrorHandling() {  
  window.onunhandledrejection = (e: PromiseRejectionEvent) => {
    e.preventDefault();
    handlePromiseRejection(e.reason);
  };
}

export function handlePromiseRejection(reason: any) {
  function extractMessage(reason: any) {
    if (reason.code == -32603) {
      return reason.data.message;
    } else if (reason.message !== undefined) {
      return reason.message;
    } else {
      return reason.toString();
    }
  }

  const msg = extractMessage(reason);
  alert(msg);
}