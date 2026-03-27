interface SpatialEntry {
  uid: number;
  x: number;
  y: number;
  active: boolean;
}

function makeCellKey(cellX: number, cellY: number): number {
  return cellX * 4096 + cellY;
}

export class EnemySpatialGrid<T extends SpatialEntry> {
  private readonly buckets = new Map<number, T[]>();
  private readonly activeKeys: number[] = [];

  constructor(private readonly cellSize: number) {}

  rebuild(entries: readonly T[]): void {
    this.clear();

    for (const entry of entries) {
      if (!entry.active) {
        continue;
      }

      const cellX = Math.floor(entry.x / this.cellSize);
      const cellY = Math.floor(entry.y / this.cellSize);
      const key = makeCellKey(cellX, cellY);
      let bucket = this.buckets.get(key);

      if (!bucket) {
        bucket = [];
        this.buckets.set(key, bucket);
      }

      if (bucket.length === 0) {
        this.activeKeys.push(key);
      }

      bucket.push(entry);
    }
  }

  queryRadius(x: number, y: number, radius: number, out: T[], excludeUid = -1): number {
    const minCellX = Math.floor((x - radius) / this.cellSize);
    const maxCellX = Math.floor((x + radius) / this.cellSize);
    const minCellY = Math.floor((y - radius) / this.cellSize);
    const maxCellY = Math.floor((y + radius) / this.cellSize);
    const radiusSq = radius * radius;
    let count = 0;

    for (let cellY = minCellY; cellY <= maxCellY; cellY += 1) {
      for (let cellX = minCellX; cellX <= maxCellX; cellX += 1) {
        const bucket = this.buckets.get(makeCellKey(cellX, cellY));
        if (!bucket) {
          continue;
        }

        for (const entry of bucket) {
          if (!entry.active || entry.uid === excludeUid) {
            continue;
          }

          const dx = entry.x - x;
          const dy = entry.y - y;
          if (dx * dx + dy * dy > radiusSq) {
            continue;
          }

          out[count] = entry;
          count += 1;
        }
      }
    }

    out.length = count;
    return count;
  }

  private clear(): void {
    for (const key of this.activeKeys) {
      const bucket = this.buckets.get(key);
      if (bucket) {
        bucket.length = 0;
      }
    }

    this.activeKeys.length = 0;
  }
}
