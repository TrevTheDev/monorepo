import { vec3, mat4, Quat, Mat4, Vec3 } from 'wgpu-matrix'

export async function loadImage(url: string): Promise<ImageBitmap> {
  const response = await fetch(url)
  const blob = await response.blob()
  const image = await createImageBitmap(blob)

  return image
}

export function createOrbitViewMatrix(radius: number, rotation: Quat): Mat4 {
  // inv(R*T)
  const viewMatrix = mat4.create()
  mat4.fromQuat(rotation, viewMatrix)
  mat4.translate(viewMatrix, vec3.fromValues(0, 0, radius), viewMatrix)
  mat4.invert(viewMatrix, viewMatrix)

  return viewMatrix
}

export function positionFromViewMatrix(viewMatrix: Mat4): Vec3 {
  const invView = mat4.invert(viewMatrix)
  const viewPosition = vec3.fromValues(invView[12], invView[13], invView[14])

  return viewPosition
}
