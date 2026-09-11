import { VehicleDefinition } from '../../vehicles/VehicleDefinition';
import { calculateVehicleStats, compareVehicleStats, STAT_LABELS, VehicleStats } from '../../vehicles/VehicleStats';

export class VehicleStatsPanel {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public render(currentDef: VehicleDefinition, compareDef: VehicleDefinition | null = null): void {
    const currentStats = calculateVehicleStats(currentDef);
    const compareStats = compareDef ? calculateVehicleStats(compareDef) : null;
    const deltas = compareStats ? compareVehicleStats(currentStats, compareStats) : null;

    const statKeys: (keyof VehicleStats)[] = ['topSpeed', 'acceleration', 'braking', 'handling', 'grip', 'stability'];

    let html = `
      <div class="stats-card">
        <div class="stats-header">
          <div class="stats-title">PERFORMANCE METRICS</div>
          ${compareDef ? `<div class="compare-badge">VS ${compareDef.name}</div>` : ''}
        </div>
        <div class="stats-bars">
    `;

    for (const key of statKeys) {
      const val = currentStats[key];
      const deltaObj = deltas ? deltas.find(d => d.key === key) : null;
      const deltaVal = deltaObj ? deltaObj.delta : 0;
      const deltaClass = deltaVal > 0 ? 'delta-positive' : deltaVal < 0 ? 'delta-negative' : 'delta-zero';
      const deltaSign = deltaVal > 0 ? `+${deltaVal}` : deltaVal < 0 ? `${deltaVal}` : '±0';

      html += `
        <div class="stat-row">
          <div class="stat-meta">
            <span class="stat-name">${STAT_LABELS[key]}</span>
            <div class="stat-numbers">
              <span class="stat-current">${val}</span>
              ${compareStats ? `<span class="stat-delta ${deltaClass}">${deltaSign}</span>` : ''}
            </div>
          </div>
          <div class="stat-bar-track">
            <div class="stat-bar-fill" style="width: ${val}%;"></div>
            ${compareStats ? `<div class="stat-bar-compare-mark" style="left: ${compareStats[key]}%;"></div>` : ''}
          </div>
        </div>
      `;
    }

    html += `
        </div>
        
        <!-- Strengths & Weaknesses -->
        <div class="meta-section">
          <div class="meta-strengths">
            <span class="meta-label">STRENGTHS</span>
            <div class="tag-row">
              ${currentDef.meta.strengths.map(s => `<span class="tag tag-pos">${s}</span>`).join('')}
            </div>
          </div>
          <div class="meta-weaknesses">
            <span class="meta-label">LIMITATIONS</span>
            <div class="tag-row">
              ${currentDef.meta.weaknesses.map(w => `<span class="tag tag-neg">${w}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }
}
