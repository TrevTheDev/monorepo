import { utils, vec2, quat, mat4 } from 'wgpu-matrix'
import { loadImage, createOrbitViewMatrix, positionFromViewMatrix } from './utils'
import { Controls } from './controls'
import { generatePlane } from './geometries'

import shaderSource from './shaders/gerstner-waves.wgsl'
import seaColorUrl from './images/sea-color.webp'
import './styles/styles.css'

async function main(): Promise<void> {
  const { gpu } = navigator
  if (!gpu) {
    console.error('WebGPU cannot be initialized - navigator.gpu not found')
    return
  }
  const adapter = await gpu.requestAdapter()
  if (adapter === null) {
    console.error('WebGPU cannot be initialized - Adapter not found')
    return
  }
  const device = await adapter.requestDevice()
  device.lost.then(() => {
    console.error('WebGPU cannot be initialized - Device has been lost')
    return
  })
  const canvas = document.getElementById('canvas-container') as HTMLCanvasElement
  if (!canvas) {
    console.error('WebGPU cannot be initialized - Canvas does not support WebGPU')
    return
  }
  const context = canvas.getContext('webgpu')
  if (!context) {
    console.error('WebGPU cannot be initialized - Canvas does not support WebGPU')
    return
  }
  const nonNullContext: GPUCanvasContext = context

  const presentationFormat = navigator.gpu.getPreferredCanvasFormat()
  context.configure({
    device: device,
    format: presentationFormat,
  })
  const sampleCount = 4

  // Create shader module
  const shaderModule = device.createShaderModule({
    code: shaderSource,
  })

  // Generate geometry data
  const plane = generatePlane(50, 10, 100, 100)
  const indexData = new Uint32Array(plane.indices)
  const vertexData = new Float32Array(plane.vertices)
  // Create vertex/index buffers
  const vertexBuffer = device.createBuffer({
    size: vertexData.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  })
  new Float32Array(vertexBuffer.getMappedRange()).set(vertexData)
  vertexBuffer.unmap()

  const indexBuffer = device.createBuffer({
    size: indexData.byteLength,
    usage: GPUBufferUsage.INDEX,
    mappedAtCreation: true,
  })
  new Uint32Array(indexBuffer.getMappedRange()).set(indexData)
  indexBuffer.unmap()

  const modelMatrix = mat4.rotateX(
    mat4.create(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
    utils.degToRad(-90),
  )
  mat4.translate(modelMatrix, [-plane.width / 2, -plane.height / 2, 0], modelMatrix)
  const uniformSize = 160 // (4 + 16 + 16 + 3) * Float32Array.BYTES_PER_ELEMENT, // elapsedTime + modelMatrix + viewProjectionMatrix + viewPosition
  const UniformValues = new ArrayBuffer(uniformSize)
  const UniformViews = {
    elapsedTime: new Float32Array(UniformValues, 0, 1),
    modelMatrix: new Float32Array(UniformValues, 16, 16),
    viewProjectionMatrix: new Float32Array(UniformValues, 80, 16),
    cameraPosition: new Float32Array(UniformValues, 144, 3),
  }
  // Create uniform buffer
  const uniformBuffer = device.createBuffer({
    size: uniformSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const GerstnerWavesUniformValuesSize = 168 // 32 * 5 + 4, // Wave parameters stride * number of waves + sum of amplitudes
  // Create Gerstner Waves parameters buffer
  const wavesUniformValuesBuffer = device.createBuffer({
    size: GerstnerWavesUniformValuesSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })
  const wavesUniformValues = new ArrayBuffer(GerstnerWavesUniformValuesSize)
  const waveCount = 5
  const gerstnerWaveSize = 32
  let amplitudeSum = 0
  function gerstnerWave(
    idx: number,
    wave: {
      length: number
      amplitude: number
      steepness: number
      direction: any
    },
  ) {
    const offset = gerstnerWaveSize * idx
    idx += 1
    const length = new Float32Array(wavesUniformValues, 0 + offset, 1)
    length.set([wave.length])
    const amplitude = new Float32Array(wavesUniformValues, 4 + offset, 1)
    amplitude.set([wave.amplitude])
    const steepness = new Float32Array(wavesUniformValues, 8 + offset, 1)
    amplitudeSum += wave.amplitude
    steepness.set([wave.steepness])
    const direction = new Float32Array(wavesUniformValues, 16 + offset, 2)
    direction.set(wave.direction)
  }
  const amplitudeSumView = new Float32Array(wavesUniformValues, 160, 1)

  // Create uniform bindgroup and bindgroup layout
  const uniformBindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: 'uniform' },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: 'uniform' },
      },
    ],
  })
  const uniformBindGroup = device.createBindGroup({
    layout: uniformBindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: uniformBuffer,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: wavesUniformValuesBuffer,
        },
      },
    ],
  })

  // Load sea color image and copy it to the GPUTexture
  const seaColor = await loadImage(seaColorUrl)
  const seaColorGPUTexture = device.createTexture({
    size: [seaColor.width, seaColor.height],
    format: presentationFormat,
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  })
  device.queue.copyExternalImageToTexture({ source: seaColor }, { texture: seaColorGPUTexture }, [
    seaColor.width,
    seaColor.height,
  ])

  // Create textures bindgroup and bindgroup layout
  const texturesBindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        sampler: { type: 'non-filtering' },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        texture: { sampleType: 'float' },
      },
    ],
  })
  const texturesBindGroup = device.createBindGroup({
    layout: texturesBindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: device.createSampler({
          addressModeU: 'clamp-to-edge',
          addressModeV: 'clamp-to-edge',
        }),
      },
      {
        binding: 1,
        resource: seaColorGPUTexture.createView(),
      },
    ],
  })

  // Create pipeline layout from bindgroup layouts
  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [uniformBindGroupLayout, texturesBindGroupLayout],
  })

  // Create render pipeline
  const renderPipeline = device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: {
      module: shaderModule,
      entryPoint: 'vertex_main',
      buffers: [
        {
          arrayStride: plane.stride,
          attributes: [
            {
              format: 'float32x3',
              offset: plane.positionOffset,
              shaderLocation: 0,
            },
            {
              format: 'float32x2',
              offset: plane.uvOffset,
              shaderLocation: 1,
            },
          ],
        },
      ],
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fragment_main',
      targets: [{ format: presentationFormat }],
    },
    depthStencil: {
      format: 'depth32float',
      depthWriteEnabled: true,
      depthCompare: 'less',
    },
    multisample: { count: sampleCount },
  })

  // Create attachment for multisampling support
  const texture = device.createTexture({
    size: {
      width: canvas.width,
      height: canvas.height,
    },
    sampleCount: sampleCount,
    format: presentationFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  })
  const textureView = texture.createView()

  // Create depth texture
  const depthTexture = device.createTexture({
    size: {
      width: canvas.width,
      height: canvas.height,
      depthOrArrayLayers: 1,
    },
    sampleCount: sampleCount,
    dimension: '2d',
    format: 'depth32float',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  })

  const controls = new Controls(canvas, 50, -25)
  controls.register()

  const startTime = Date.now()
  let elapsedTime = 0

  requestAnimationFrame(function draw(timestamp: number) {
    // MVP
    const viewMatrix = createOrbitViewMatrix(
      15,
      quat.fromEuler(
        utils.degToRad(controls.y),
        utils.degToRad(controls.x),
        utils.degToRad(0),
        'yxz',
      ),
    )

    // Not very optimal since matrix inversion was used twice.
    // First time for creating orbit view matrix and second to retrieve position.
    const viewPosition = positionFromViewMatrix(viewMatrix)

    // const projectionMatrix = mat4b.perspectiveZO(
    //   mat4b.create(),
    //   utils.degToRad(50), // FOV
    //   canvas.width / canvas.height, // Aspect ratio
    //   0.1, // Near
    //   100.0, // Far
    // )
    const projectionMatrix = mat4.perspective(
      utils.degToRad(50), // FOV
      canvas.width / canvas.height, // Aspect ratio
      0.1, // Near
      100.0, // Far
    )
    const viewProjectionMatrix = mat4.multiply(projectionMatrix, viewMatrix)

    // Create render pass descriptor
    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          resolveTarget: context.getCurrentTexture().createView(),
          // loadValue: { // REMOVED
          //   r: 0.3,
          //   g: 0.3,
          //   b: 0.3,
          //   a: 1.0,
          // },
          storeOp: 'store',
          // ADDED
          clearValue: {
            r: 0.3,
            g: 0.3,
            b: 0.3,
            a: 1.0,
          },
          loadOp: 'clear', // ADDED
        },
      ],
      depthStencilAttachment: {
        // ORIGINAL
        view: depthTexture.createView(),
        // depthLoadValue: 1.0,
        depthStoreOp: 'discard',
        // stencilLoadValue: 0,
        // stencilStoreOp: 'store',

        // REPLACEMENTS
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        // depthReadOnly: false,
        // stencilClearValue: 0,
        // stencilLoadOp: 'clear',
        // stencilReadOnly: false,
      },
    }

    // Update buffers
    UniformViews.elapsedTime.set([elapsedTime])
    UniformViews.modelMatrix.set(modelMatrix)
    UniformViews.viewProjectionMatrix.set(viewProjectionMatrix)
    UniformViews.cameraPosition.set(viewPosition)
    device.queue.writeBuffer(uniformBuffer, 0, UniformValues)

    gerstnerWave(0, {
      length: 8, // f32 - 4 bytes
      amplitude: 0.1, // f32 - 4 bytes
      steepness: 1.0, // f32 - 4 bytes, but 8 bytes will be reserved to match 32 bytes stride
      direction: vec2.normalize([1.0, 1.3]), // vec2<f32> - 8 bytes but 16 bytes will be reserved
    })
    gerstnerWave(1, {
      length: 4,
      amplitude: 0.1,
      steepness: 0.8,
      direction: vec2.normalize([-0.7, 0.0]),
    })
    gerstnerWave(2, {
      length: 5,
      amplitude: 0.2,
      steepness: 1.0,
      direction: vec2.normalize([0.3, 0.2]),
    })
    gerstnerWave(3, {
      length: 10,
      amplitude: 0.5,
      steepness: 1.0,
      direction: vec2.normalize([4.3, 1.2]),
    })
    gerstnerWave(4, {
      length: 3,
      amplitude: 0.1,
      steepness: 1.0,
      direction: vec2.normalize([0.5, 0.5]),
    })
    amplitudeSumView.set([amplitudeSum])
    device.queue.writeBuffer(wavesUniformValuesBuffer, 0, wavesUniformValues)

    const commandEncoder = device.createCommandEncoder()

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
    passEncoder.setPipeline(renderPipeline)
    passEncoder.setVertexBuffer(0, vertexBuffer)
    passEncoder.setIndexBuffer(indexBuffer, 'uint32')
    passEncoder.setBindGroup(0, uniformBindGroup)
    passEncoder.setBindGroup(1, texturesBindGroup)
    passEncoder.drawIndexed(indexData.length)
    passEncoder.end()
    device.queue.submit([commandEncoder.finish()])

    elapsedTime = (Date.now() - startTime) / 2000

    requestAnimationFrame(draw)
  })
}
main()
