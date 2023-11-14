export function generatePlane(
  width: number,
  height: number,
  rows: number,
  columns: number,
): {
  vertices: Float32Array
  indices: Uint32Array
  positionOffset: number
  uvOffset: number
  stride: number
  width: number
  height: number
} {
  const vertices: number[] = []

  const rs = Math.floor(rows) || 1
  const cols = Math.floor(columns) || 1
  for (let row = 0; row <= rs; row++) {
    let rowHeight = height / rs
    const y = row * rowHeight
    for (let col = 0; col <= cols; col++) {
      let colWidth = width / cols
      const x = col * colWidth
      vertices.push(x, y, 0, col / cols, 1 - row / rs /* UV? */)
    }
  }

  const columnsOffset = columns + 1

  const indices: number[] = []
  for (let row = 0; row < rs; row++) {
    for (let col = 0; col < cols; col++) {
      const leftBottom = columnsOffset * row + col
      const rightBottom = columnsOffset * row + (col + 1)
      const leftUp = columnsOffset * (row + 1) + col
      const rightUp = columnsOffset * (row + 1) + (col + 1)
      indices.push(leftUp, leftBottom, rightBottom)
      indices.push(rightUp, leftUp, rightBottom)
    }
  }
  return {
    vertices: new Float32Array(vertices),
    indices: new Uint32Array(indices),
    positionOffset: 0 * Float32Array.BYTES_PER_ELEMENT,
    uvOffset: 3 * Float32Array.BYTES_PER_ELEMENT,
    stride: 5 * Float32Array.BYTES_PER_ELEMENT,
    width,
    height,
  }
}
