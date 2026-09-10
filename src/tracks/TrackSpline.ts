import * as THREE from 'three';
import { TrackSplineDefinition } from './TrackTypes';

export class TrackSpline {
  public readonly definition: TrackSplineDefinition;
  public readonly curve: THREE.CatmullRomCurve3;
  public readonly totalLength: number;

  private readonly pointBankings: number[] = [];
  private readonly pointWidths: number[] = [];
  private readonly upVector: THREE.Vector3 = new THREE.Vector3(0, 1, 0);

  constructor(definition: TrackSplineDefinition) {
    this.definition = definition;

    const points3D: THREE.Vector3[] = [];
    for (const pt of definition.points) {
      points3D.push(new THREE.Vector3(pt.position[0], pt.position[1], pt.position[2]));
      this.pointBankings.push(pt.banking ?? definition.defaultBanking);
      this.pointWidths.push(pt.width ?? definition.defaultWidth);
    }

    this.curve = new THREE.CatmullRomCurve3(
      points3D,
      definition.closed,
      'catmullrom',
      definition.tension ?? 0.5
    );

    this.totalLength = this.curve.getLength();
  }

  /**
   * Evaluates 3D center point at parameter t in [0, 1].
   */
  public getPoint(t: number, out: THREE.Vector3 = new THREE.Vector3()): THREE.Vector3 {
    const wrappedT = ((t % 1) + 1) % 1;
    return this.curve.getPointAt(wrappedT, out);
  }

  /**
   * Evaluates unit tangent vector at parameter t in [0, 1].
   */
  public getTangent(t: number, out: THREE.Vector3 = new THREE.Vector3()): THREE.Vector3 {
    const wrappedT = ((t % 1) + 1) % 1;
    return this.curve.getTangentAt(wrappedT, out).normalize();
  }

  /**
   * Evaluates horizontal normal vector pointing right across the track.
   * Perpendicular to tangent and world up.
   */
  public getNormal(t: number, out: THREE.Vector3 = new THREE.Vector3()): THREE.Vector3 {
    const tangent = this.getTangent(t);
    out.crossVectors(tangent, this.upVector).normalize();
    return out;
  }

  /**
   * Evaluates road surface normal vector taking banking and slope into account.
   */
  public getSurfaceNormal(t: number, out: THREE.Vector3 = new THREE.Vector3()): THREE.Vector3 {
    const tangent = this.getTangent(t);
    const bankAngle = this.getBanking(t);
    const horizNormal = this.getNormal(t);

    // Banked lateral vector (tilted around tangent)
    const bankedRight = new THREE.Vector3()
      .copy(horizNormal)
      .multiplyScalar(Math.cos(bankAngle))
      .addScaledVector(this.upVector, Math.sin(bankAngle));

    // Surface normal is cross product of banked right and tangent
    out.crossVectors(bankedRight, tangent).normalize();
    return out;
  }

  /**
   * Interpolates road banking angle in radians at parameter t.
   */
  public getBanking(t: number): number {
    return this.interpolatePointValue(t, this.pointBankings, this.definition.defaultBanking);
  }

  /**
   * Interpolates road width in meters at parameter t.
   */
  public getWidth(t: number): number {
    return this.interpolatePointValue(t, this.pointWidths, this.definition.defaultWidth);
  }

  /**
   * Evaluates local track gradient (slope: dy / ds).
   * Positive = uphill, negative = downhill.
   */
  public getGradient(t: number): number {
    const tangent = this.getTangent(t);
    return tangent.y;
  }

  /**
   * Approximates local curvature kappa = ||dT / ds||.
   */
  public getCurvature(t: number): number {
    const dt = 0.005;
    const t0 = Math.max(0, t - dt);
    const t1 = Math.min(1, t + dt);

    const tan0 = this.getTangent(t0);
    const tan1 = this.getTangent(t1);

    const p0 = this.getPoint(t0);
    const p1 = this.getPoint(t1);
    const ds = p0.distanceTo(p1);

    if (ds < 0.001) return 0;
    const diff = new THREE.Vector3().subVectors(tan1, tan0);
    return diff.length() / ds;
  }

  /**
   * Distance along track from start (t=0) to progress t.
   */
  public getDistance(t: number): number {
    const wrappedT = ((t % 1) + 1) % 1;
    return wrappedT * this.totalLength;
  }

  private interpolatePointValue(t: number, pointValues: number[], defaultValue: number): number {
    const num = pointValues.length;
    if (num === 0) return defaultValue;
    if (num === 1) return pointValues[0];

    const wrappedT = ((t % 1) + 1) % 1;
    const fIdx = wrappedT * (this.definition.closed ? num : (num - 1));
    const idx0 = Math.floor(fIdx) % num;
    const idx1 = (idx0 + 1) % num;
    const frac = fIdx - Math.floor(fIdx);

    // Hermite smoothstep blend between adjacent control points
    const smoothFrac = frac * frac * (3 - 2 * frac);
    return pointValues[idx0] * (1 - smoothFrac) + pointValues[idx1] * smoothFrac;
  }
}
