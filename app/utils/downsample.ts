/**
 * Largest Triangle Three Buckets (LTTB) downsampling algorithm.
 * Reduces a time-series to `threshold` visually representative points.
 */
export function downsampleLTTB<T>(
  data: T[],
  threshold: number,
  xAccessor: (d: T) => number,
  yAccessor: (d: T) => number
): T[] {
  if (data.length <= threshold || threshold < 3) return data

  const sampled: T[] = [data[0]!]
  const bucketSize = (data.length - 2) / (threshold - 2)

  let prevIndex = 0

  for (let i = 0; i < threshold - 2; i++) {
    const bucketStart = Math.floor((i + 1) * bucketSize) + 1
    const bucketEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, data.length - 1)

    // Average of next bucket for reference point
    let avgX = 0
    let avgY = 0
    const nextStart = Math.floor((i + 2) * bucketSize) + 1
    const nextEnd = Math.min(Math.floor((i + 3) * bucketSize) + 1, data.length - 1)
    const nextLen = nextEnd - nextStart + 1

    for (let j = nextStart; j <= nextEnd; j++) {
      avgX += xAccessor(data[j]!)
      avgY += yAccessor(data[j]!)
    }
    avgX /= nextLen
    avgY /= nextLen

    const prevX = xAccessor(data[prevIndex]!)
    const prevY = yAccessor(data[prevIndex]!)

    let maxArea = -1
    let maxIndex = bucketStart

    for (let j = bucketStart; j <= bucketEnd; j++) {
      const area = Math.abs(
        (prevX - avgX) * (yAccessor(data[j]!) - prevY)
        - (prevX - xAccessor(data[j]!)) * (avgY - prevY)
      )
      if (area > maxArea) {
        maxArea = area
        maxIndex = j
      }
    }

    sampled.push(data[maxIndex]!)
    prevIndex = maxIndex
  }

  sampled.push(data[data.length - 1]!)
  return sampled
}
