struct Uniform {
    elapsedTime: f32,
    modelMatrix: mat4x4f,  // Explicitly set alignment
    viewProjectionMatrix: mat4x4f,
    cameraPosition: vec3f,
};

struct GerstnerWave {
    length: f32,  // 0 < L
    amplitude: f32, // 0 < A
    steepness: f32,  // Steepness of the peak of the wave. 0 <= S <= 1
    direction: vec2f,  // Normalized direction of the wave
    ignore: vec2f
};

struct GerstnerWavesUniform {
    waves: array<GerstnerWave, 5>,
    amplitudeSum: f32,  // Sum of waves amplitudes
};

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) normal: vec4f,
    @location(1) uv: vec2f,
    @location(2) worldPosition: vec4f,
};

@group(0) @binding(0) var<uniform> uniforms: Uniform;
@group(0) @binding(1) var<uniform> wavesUniform: GerstnerWavesUniform;

@group(1) @binding(0) var seaSampler: sampler;
@group(1) @binding(1) var seaColor: texture_2d<f32>;


const pi = 3.14159;   
const gravity = 9.8; // m/sec^2
const waveNumbers = 5;  

@vertex fn vertex_main(
    @location(0) position: vec3f,
    @location(1) uv: vec2f,
) -> VertexOutput {
    var output: VertexOutput;
    var worldPosition: vec4f = uniforms.modelMatrix * vec4f(position, 1.0);

    var wavesSum: vec3f = vec3f(0.0);
    var wavesSumNormal: vec3f;
    for(var i: i32 = 0; i < waveNumbers; i = i + 1) {
        let wave = wavesUniform.waves[i];
        let wavevectorMagnitude = 2.0 * pi / wave.length;
        let wavevector = wave.direction * wavevectorMagnitude;
        let temporalFrequency = sqrt(gravity * wavevectorMagnitude);
        let steepnessFactor = wave.steepness / (wave.amplitude * wavevectorMagnitude * f32(waveNumbers)); 
        
        let pos = dot(wavevector, worldPosition.xz) - temporalFrequency * uniforms.elapsedTime;
        let sinPosAmplitudeDirection = sin(pos) * wave.amplitude * wave.direction;
        
        var offset: vec3f;
        offset.x = sinPosAmplitudeDirection.x * steepnessFactor;
        offset.z = sinPosAmplitudeDirection.y * steepnessFactor;
        offset.y = cos(pos) * wave.amplitude;

        var normal: vec3f;
        normal.x = sinPosAmplitudeDirection.x * wavevectorMagnitude;
        normal.z = sinPosAmplitudeDirection.y * wavevectorMagnitude;
        normal.y = cos(pos) * wave.amplitude * wavevectorMagnitude * steepnessFactor;

        wavesSum = wavesSum + offset;
        wavesSumNormal = wavesSumNormal + normal;
    }
    wavesSumNormal.y = 1.0 - wavesSumNormal.y;
    wavesSumNormal = normalize(wavesSumNormal);

    worldPosition.x = worldPosition.x - wavesSum.x;
    worldPosition.z = worldPosition.z - wavesSum.z;
    worldPosition.y = wavesSum.y;

    output.worldPosition = worldPosition;
    output.position = uniforms.viewProjectionMatrix * worldPosition;
    output.normal = vec4f(wavesSumNormal, 0.0);
    output.uv = uv;
    return output;
}

@fragment fn fragment_main(
    data: VertexOutput,
) -> @location(0) vec4f {
    let lightColor = vec3f(1.0, 0.8, 0.65);
    let skyColor = vec3f(0.69, 0.84, 1.0);

    let lightPosition = vec3f(-10.0, 1.0, -10.0);
    let light = normalize(lightPosition - data.worldPosition.xyz);  // Vector from surface to light
    let eye = normalize(uniforms.cameraPosition - data.worldPosition.xyz);  // Vector from surface to camera
    let reflection = reflect(data.normal.xyz, -eye);  // I - 2.0 * dot(N, I) * N
    
    let halfway = normalize(eye + light);  // Vector between View and Light
    let shininess = 30.0;
    let specular = clamp(pow(dot(data.normal.xyz, halfway), shininess), 0.0, 1.0) * lightColor;  // Blinn-Phong specular component

    let fresnel = clamp(pow(1.0 + dot(-eye, data.normal.xyz), 4.0), 0.0, 1.0);  // Cheap fresnel approximation

    // Normalize height to [0, 1]
    let normalizedHeight = (data.worldPosition.y + wavesUniform.amplitudeSum) / (2.0 * wavesUniform.amplitudeSum);
    let underwater = textureSample(seaColor, seaSampler, vec2f(normalizedHeight, 0.0)).rgb;

    // Approximating Translucency (GPU Pro 2 article)
    let distortion = 0.1;
    let power = 4.0;
    let scale = 1.0;
    let ambient = 0.2;
    let thickness = smoothstep(0.0, 1.0, normalizedHeight);
    let distortedLight = light + data.normal.xyz * distortion;
    let translucencyDot = pow(clamp(dot(eye, -distortedLight), 0.0, 1.0), power);
    let translucency = (translucencyDot * scale + ambient) * thickness;
    let underwaterTranslucency = mix(underwater, lightColor, translucency) * translucency;

    let color = mix(underwater + underwaterTranslucency, skyColor, fresnel) + specular;

    return vec4f(color, 1.0);
}