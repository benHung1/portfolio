<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { TubeGeometry } from 'three'
import { CatmullRomCurve3 } from 'three'
import { Sky } from 'three/addons/objects/Sky.js'
import { gsap } from 'gsap'
import type { MenuItem, SphereMesh, StarfieldPoints } from '~/types/menuScene'
import type { PlanetContent } from '~/types/planetContent'
import { getPlanetContent } from '~/data/planetContents'
import PlanetInfoPanel from './PlanetInfoPanel.vue'

const emit = defineEmits<{
  select: [id: string]
}>()

const props = defineProps<{
  menuItems: MenuItem[]
}>()

const containerRef = ref<HTMLElement | null>(null)

// 當前選中的內容
const selectedContent = ref<PlanetContent | null>(null)
const isPanelVisible = computed(() => selectedContent.value !== null)

// 面板位置（螢幕座標）
const panelPosition = ref({ x: 0, y: 0 })
// 平滑後的面板位置（用於減少抖動）
const smoothedPanelPosition = ref({ x: 0, y: 0 })

// 所有可切換的行星順序（包括地球）
const planetOrder = ['earth', 'mercury', 'mars', 'saturn'] // 對應 id：關於我 > 技能專長 > 工作經驗 > 作品展示

// 獲取當前選中行星的索引
const getCurrentPlanetIndex = (): number => {
  if (!selectedContent.value) return -1
  return planetOrder.indexOf(selectedContent.value.id)
}

// 導航到特定行星
const navigateToPlanet = (planetId: string): void => {
  // 找到對應的球
  let targetSphere: THREE.Mesh | null = null
  
  // 先檢查是否是地球
  if (planetId === 'earth' && centralSun) {
    targetSphere = centralSun
  } else {
    // 查找其他行星
    // 映射 id 到 menuItem id
    const idToMenuItemMap: Record<string, string> = {
      'mars': 'about',
      'mercury': 'contact',
      'saturn': 'projects'
    }
    const menuItemId = idToMenuItemMap[planetId]
    
    if (menuItemId) {
      targetSphere = spheres.find(sphere => {
        return sphere.userData.item?.id === menuItemId
      }) || null
    }
  }
  
  if (targetSphere) {
    // 更新選中的球
    if (activeSphere && activeSphere !== targetSphere) {
      gsap.to(activeSphere.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.3,
        ease: 'power2.out'
      })
    }
    
    activeSphere = targetSphere as SphereMesh
    
    // 放大新選中的球
    gsap.to(targetSphere.scale, {
      x: 1.5,
      y: 1.5,
      z: 1.5,
      duration: 0.5,
      ease: 'power2.out'
    })
    
    // 更新內容
    const content = getPlanetContent(planetId)
    selectedContent.value = content
    
    // 移動相機到新球的位置
    if (camera) {
      const targetPos = targetSphere.position.clone()
      if (targetSphere.userData.isEarth) {
        targetPos.z += 8
      } else {
        targetPos.z += 8
      }
      
      gsap.to(camera.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.0,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (camera && activeSphere) {
            camera.lookAt(activeSphere.position)
          }
        }
      })
    }
  }
}

// 切換到下一個/上一個行星
const switchPlanet = (direction: 'next' | 'prev'): void => {
  const currentIndex = getCurrentPlanetIndex()
  if (currentIndex === -1) return
  
  let newIndex: number
  if (direction === 'next') {
    newIndex = (currentIndex + 1) % planetOrder.length
  } else {
    newIndex = (currentIndex - 1 + planetOrder.length) % planetOrder.length
  }
  
  const newPlanetId = planetOrder[newIndex]
  navigateToPlanet(newPlanetId)
}

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let starfield: StarfieldPoints
let centralSun: THREE.Mesh | null = null
let dirLight: THREE.DirectionalLight | null = null
let orbitLines: THREE.Mesh[] = []
let spheres: SphereMesh[] = []
let raycaster: THREE.Raycaster
const mouse = new THREE.Vector2()
let animationId: number | null = null
const orbitSpeed = 1.9 // 增加軌道速度，讓公轉更明顯
const clock = new THREE.Clock()
let activeSphere: SphereMesh | null = null // 當前選中的球
let targetCameraPosition: THREE.Vector3 | null = null // 目標相機位置

// 創建擬真星空背景
const createStarfield = (): StarfieldPoints => {
  const particleCount = 1000000 //  100000 個星星
  const positions: number[] = []
  const colors: number[] = []
  
  for (let i = 0; i < particleCount; i++) {
    // 隨機分佈在更大的範圍內
    const x = (Math.random() - 0.5) * 5000
    const y = (Math.random() - 0.5) * 5000
    const z = (Math.random() - 0.5) * 5000
    
    positions.push(x, y, z)
    
    // 大部分是白色/淡藍色星星，少數彩色
    let color: THREE.Color
    const brightness = Math.random()
    
    if (brightness > 0.98) {
      // 2% 的亮星（白色/淡藍色）
      const whiteBrightness = 0.9 + Math.random() * 0.1
      color = new THREE.Color(whiteBrightness, whiteBrightness, whiteBrightness + 0.1)
    } else if (brightness > 0.95) {
      // 3% 的較亮星星
      const whiteBrightness = 0.7 + Math.random() * 0.2
      color = new THREE.Color(whiteBrightness, whiteBrightness, whiteBrightness + 0.1)
    } else if (brightness > 0.9) {
      // 5% 的彩色星星（藍色/青色）
      const hue = 0.5 + Math.random() * 0.2 // 藍色到青色
      color = new THREE.Color().setHSL(hue, 0.6, 0.7 + Math.random() * 0.3)
    } else {
      // 90% 的普通星星（白色/淡藍色，不同亮度，但更亮）
      const starBrightness = 0.4 + Math.random() * 0.5 // 提高最低亮度
      color = new THREE.Color(starBrightness, starBrightness, starBrightness + 0.1)
    }
    
    colors.push(color.r, color.g, color.b)
  }
  
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  
  // 創建圓形紋理來避免方形
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('無法獲取 canvas 2d context')
  }
  
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  
  context.fillStyle = gradient
  context.fillRect(0, 0, 64, 64)
  
  const texture = new THREE.CanvasTexture(canvas)
  
  // 使用帶有圓形紋理的 PointsMaterial
  const material = new THREE.PointsMaterial({
    size: 2, // 增加尺寸，讓星星更明顯
    vertexColors: true,
    transparent: true,
    opacity: 1, // 完全不透明
    sizeAttenuation: true,
    map: texture,
    alphaTest: 0.01
  })
  
  const mesh = new THREE.Points(geometry, material) as StarfieldPoints
  mesh.userData.rotationSpeed = 0.0001
  return mesh
}

// 創建真實的太陽紋理（程序生成，模擬太陽表面）
const createSunTexture = (size: number = 2048): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('無法獲取 canvas 2d context')
  }
  
  const imageData = context.createImageData(size, size)
  const data = imageData.data
  
  // 預生成多層噪點用於更複雜的紋理
  const noiseLayers: number[][][] = []
  for (let layer = 0; layer < 5; layer++) {
    const scale = Math.pow(2, layer)
    noiseLayers[layer] = []
    for (let y = 0; y < size; y++) {
      noiseLayers[layer][y] = []
      for (let x = 0; x < size; x++) {
        noiseLayers[layer][y][x] = Math.random()
      }
    }
  }
  
  // 生成太陽表面紋理
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % size
    const y = Math.floor((i / 4) / size)
    
    // 多層噪點混合（模擬太陽表面的複雜結構）
    let noise = 0
    let weight = 1
    for (let layer = 0; layer < 5; layer++) {
      const scale = Math.pow(2, layer)
      const nx = Math.floor(x / scale) % size
      const ny = Math.floor(y / scale) % size
      noise += noiseLayers[layer][ny][nx] * weight
      weight *= 0.5
    }
    noise /= (1 + 0.5 + 0.25 + 0.125 + 0.0625)
    
    // 太陽表面湍流和對流效果
    const turbulence1 = Math.sin(x * 0.08 + y * 0.06) * Math.sin(x * 0.12 - y * 0.08) * 0.3
    const turbulence2 = Math.sin(x * 0.2 + y * 0.15) * 0.2
    const turbulence3 = Math.sin(x * 0.4 + y * 0.3) * 0.15
    
    // 太陽黑子效果（更真實的分布）
    const sunspot1 = Math.sin(x * 0.015) * Math.sin(y * 0.015) > 0.9 ? 0.6 : 1.0
    const sunspot2 = Math.sin(x * 0.025 + y * 0.02) > 0.92 ? 0.7 : 1.0
    const sunspot = Math.min(sunspot1, sunspot2)
    
    // 太陽表面亮度變化（更強烈的對比）
    const brightness = 0.9 + noise * 0.2 + turbulence1 + turbulence2 + turbulence3
    const finalBrightness = Math.max(0.7, Math.min(1.2, brightness * sunspot))
    
    // 太陽顏色：明亮的橙黃色，邊緣稍微偏紅
    const distFromCenter = Math.sqrt((x - size/2) ** 2 + (y - size/2) ** 2) / (size/2)
    const edgeFactor = Math.pow(distFromCenter, 1.5) // 邊緣更紅
    
    const r = Math.min(255, (1.0 + finalBrightness * 0.3 + edgeFactor * 0.1) * 255)
    const g = Math.min(255, (0.85 + finalBrightness * 0.25 - edgeFactor * 0.05) * 255)
    const b = Math.min(255, (0.4 + finalBrightness * 0.15 - edgeFactor * 0.1) * 255)
    
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
    data[i + 3] = 255
  }
  
  context.putImageData(imageData, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

// 使用真實的地球紋理 URL（公開資源）
// 使用 Three.js 官方範例常用的地球紋理
const EARTH_TEXTURE_URLS = {
  day: 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
  night: 'https://threejs.org/examples/textures/planets/earth_lights_2048.jpg',
  bump: 'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
  clouds: 'https://threejs.org/examples/textures/planets/earth_clouds_2048.png'
}

// 備用：如果 URL 無法加載，使用程序生成
const createEarthTextureFallback = (size: number = 2048): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('無法獲取 canvas 2d context')
  }
  
  // 創建簡單的藍色地球作為備用
  context.fillStyle = '#4a90e2'
  context.fillRect(0, 0, size, size)
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

// 創建夜間紋理備用（深色背景，模擬城市燈光）
const createNightTextureFallback = (size: number = 2048): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('無法獲取 canvas 2d context')
  }
  
  const imageData = context.createImageData(size, size)
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % size
    const y = Math.floor((i / 4) / size)
    
    // 深色背景（幾乎黑色）
    const baseDark = 0.05
    
    // 模擬城市燈光（隨機分布的亮點）
    const noise = Math.random()
    const cityLight = noise > 0.98 ? Math.min(1.0, baseDark + noise * 0.3) : baseDark
    
    // 添加一些微弱的噪點
    const grain = (Math.random() - 0.5) * 0.02
    
    const brightness = Math.max(0, Math.min(1, cityLight + grain))
    
    data[i] = brightness * 255 * 0.8     // R
    data[i + 1] = brightness * 255 * 0.9  // G
    data[i + 2] = brightness * 255        // B
    data[i + 3] = 255                     // A
  }
  
  context.putImageData(imageData, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

// 創建真實的中央地球（參考 Earth 範例，使用真實紋理）
const createCentralSun = (): THREE.Mesh => {
  const earthRadius = 1.2
  const geometry = new THREE.SphereGeometry(earthRadius, 128, 128)
  
  // 使用 TextureLoader 加載真實地球紋理
  const textureLoader = new THREE.TextureLoader()
  
  // 先創建備用夜間紋理（作為默認值，避免 404 錯誤）
  let nightTexture: THREE.Texture = createNightTextureFallback(2048)
  nightTexture.colorSpace = THREE.SRGBColorSpace
  nightTexture.anisotropy = 16
  
  // 嘗試從 URL 加載夜間紋理（如果成功則替換備用紋理）
  textureLoader.load(
    EARTH_TEXTURE_URLS.night,
    (loadedTexture) => {
      // 加載成功，替換備用紋理
      loadedTexture.colorSpace = THREE.SRGBColorSpace
      loadedTexture.anisotropy = 16
      nightTexture = loadedTexture
      // 更新 shader uniform（如果 material 已創建）
      if (earthMaterial && earthMaterial.uniforms) {
        earthMaterial.uniforms.nightTexture.value = nightTexture
      }
    },
    undefined,
    () => {
      // 加載失敗，保持使用備用紋理（不顯示警告，因為已經有備用）
      console.warn('無法加載地球夜間紋理，使用備用紋理')
    }
  )
  
  // 創建地球紋理（使用真實 URL，失敗時使用備用）
  const dayTexture = textureLoader.load(
    EARTH_TEXTURE_URLS.day,
    () => {}, // onLoad
    undefined, // onProgress
    () => {
      // onError - 使用備用紋理
      console.warn('無法加載地球日間紋理，使用備用紋理')
    }
  )
  dayTexture.colorSpace = THREE.SRGBColorSpace
  dayTexture.anisotropy = 16
  
  // 創建組合的凹凸/粗糙度/雲層紋理
  const bumpTexture = textureLoader.load(
    EARTH_TEXTURE_URLS.bump,
    () => {},
    undefined,
    () => {
      console.warn('無法加載地球凹凸紋理')
    }
  )
  bumpTexture.anisotropy = 16
  
  // 雲層紋理（不使用，因為已經在 createCombinedTexture 中程序生成）
  // 不嘗試加載，避免 404 錯誤
  
  // 創建組合紋理（R: bump, G: roughness, B: clouds）
  const createCombinedTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 2048
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('無法獲取 canvas 2d context')
    }
    
    const imageData = context.createImageData(2048, 2048)
    const data = imageData.data
    
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % 2048
      const y = Math.floor((i / 4) / 2048)
      
      // R: 凹凸（使用簡單的噪點）
      const bump = Math.sin(x * 0.01) * Math.sin(y * 0.01) * 0.5 + 0.5
      data[i] = Math.min(255, bump * 255)
      
      // G: 粗糙度（海洋光滑 0.3，陸地粗糙 0.7）
      const roughness = Math.sin(x * 0.005) * Math.sin(y * 0.005) > 0.2 ? 0.7 : 0.3
      data[i + 1] = Math.min(255, roughness * 255)
      
      // B: 雲層（使用噪點模擬）
      const cloud = Math.sin(x * 0.02 + y * 0.03) * 0.5 + 0.5
      data[i + 2] = Math.min(255, cloud * 255)
      
      data[i + 3] = 255
    }
    
    context.putImageData(imageData, 0, 0)
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    return texture
  }
  
  const bumpRoughnessCloudsTexture = createCombinedTexture()
  
  // 創建地球材質（參考 Earth 範例，改進版）
  let earthMaterial: THREE.ShaderMaterial
  earthMaterial = new THREE.ShaderMaterial({
    uniforms: {
      dayTexture: { value: dayTexture },
      nightTexture: { value: nightTexture },
      sunDirection: { value: new THREE.Vector3(0, 0, 1) },
      atmosphereDayColor: { value: new THREE.Color(0x4db2ff) },
      atmosphereTwilightColor: { value: new THREE.Color(0xbc490b) }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vViewDirection;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        vViewDirection = normalize(cameraPosition - vWorldPosition);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D dayTexture;
      uniform sampler2D nightTexture;
      uniform vec3 sunDirection;
      uniform vec3 atmosphereDayColor;
      uniform vec3 atmosphereTwilightColor;
      
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vViewDirection;
      
      void main() {
        // 獲取紋理
        vec3 dayColor = texture2D(dayTexture, vUv).rgb;
        vec3 nightColor = texture2D(nightTexture, vUv).rgb;
        
        // 計算太陽方向（朝向太陽的強度）
        vec3 normal = normalize(vNormal);
        float sunOrientation = dot(normal, normalize(sunDirection));
        
        // 晝夜混合
        float dayStrength = smoothstep(-0.25, 0.5, sunOrientation);
        vec3 finalColor = mix(nightColor, dayColor, dayStrength);
        
        // Fresnel 效果（用於大氣層）
        float fresnel = 1.0 - abs(dot(normalize(vViewDirection), normal));
        fresnel = pow(fresnel, 2.0);
        
        // 大氣層顏色（根據太陽方向，主要是藍色）
        float atmosphereDayStrength = smoothstep(-0.5, 1.0, sunOrientation);
        vec3 atmosphereColor = mix(atmosphereTwilightColor, atmosphereDayColor, atmosphereDayStrength);
        float atmosphereMix = atmosphereDayStrength * pow(fresnel, 2.0);
        atmosphereMix = clamp(atmosphereMix, 0.0, 1.0);
        
        // 混合藍色大氣層
        finalColor = mix(finalColor, atmosphereColor, atmosphereMix);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    side: THREE.DoubleSide
  })
  
  const earth = new THREE.Mesh(geometry, earthMaterial)
  earth.position.set(0, 0, 0)
  
  // 為地球添加 userData，讓它可以被點擊
  earth.userData = {
    item: {
      id: 'earth',
      label: 'Earth',
      path: '/earth'
    },
    isEarth: true
  }
  
  // 添加藍色大氣層效果
  const atmosphereGeometry = new THREE.SphereGeometry(earthRadius * 1.04, 128, 128)
  const atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: {
      sunDirection: { value: new THREE.Vector3(0, 0, 1) },
      atmosphereDayColor: { value: new THREE.Color(0x4db2ff) }, // 藍色
      atmosphereTwilightColor: { value: new THREE.Color(0x4db2ff) } // 改為藍色，移除紅色邊框
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vViewDirection;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        vViewDirection = normalize(cameraPosition - vWorldPosition);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 sunDirection;
      uniform vec3 atmosphereDayColor;
      uniform vec3 atmosphereTwilightColor;
      
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vViewDirection;
      
      float remap(float oldMin, float oldMax, float newMin, float newMax, float value) {
        return newMin + (value - oldMin) * (newMax - newMin) / (oldMax - oldMin);
      }
      
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewDirection);
        
        // 太陽方向
        float sunOrientation = dot(normal, normalize(sunDirection));
        float atmosphereDayStrength = smoothstep(-0.5, 1.0, sunOrientation);
        
        // 大氣層顏色（主要是藍色）
        vec3 atmosphereColor = mix(atmosphereTwilightColor, atmosphereDayColor, atmosphereDayStrength);
        
        // Alpha 通道（移除邊框效果，設為完全透明）
        float alpha = 0.0;
        
        gl_FragColor = vec4(atmosphereColor, alpha);
      }
    `,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false
  })
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
  earth.add(atmosphere)
  
  scene.add(earth)
  return earth
}

// 創建軌道線（更粗，更明顯）
const createOrbitLine = (radius: number, color: number = 0x4d76cf): THREE.Mesh => {
  const points: THREE.Vector3[] = []
  const segments = 128 // 增加分段數讓線更平滑
  
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const x = Math.cos(angle) * radius
    const y = 0 // 水平軌道（在 XZ 平面上）
    const z = Math.sin(angle) * radius * 0.5 // 橢圓軌道
    points.push(new THREE.Vector3(x, y, z))
  }
  
  // 使用 TubeGeometry 來創建更粗的線（管狀）
  const curve = new CatmullRomCurve3(points, true) // 閉合曲線
  const tubeGeometry = new TubeGeometry(
    curve,
    segments,
    0.03, // 管徑，減小線的粗細
    8, // 圓形分段數
    true // 閉合
  )
  const tubeMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.5 // 增加不透明度
  })
  const tube = new THREE.Mesh(tubeGeometry, tubeMaterial)
  scene.add(tube)
  
  return tube
}

// 創建行星紋理（根據索引創建不同風格：火星、水星、土星等）
const createPlanetTexture = (planetType: 'mars' | 'mercury' | 'saturn' | 'earth', size: number = 1024): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('無法獲取 canvas 2d context')
  }
  
  // 不同行星的基礎顏色
  const planetColors: Record<string, { base: THREE.Color; variations: number[] }> = {
    mars: { base: new THREE.Color(0xcd5c5c), variations: [0.8, 0.9, 1.0, 1.1, 1.2] },
    mercury: { base: new THREE.Color(0x8c7853), variations: [0.7, 0.85, 1.0, 1.15] },
    saturn: { base: new THREE.Color(0xfad5a5), variations: [0.9, 1.0, 1.1] },
    earth: { base: new THREE.Color(0x4a90e2), variations: [0.8, 0.9, 1.0, 1.1] }
  }
  
  const planet = planetColors[planetType] || planetColors.mars
  const imageData = context.createImageData(size, size)
  const data = imageData.data
  
  // 預生成多層噪點
  const noiseLayers: number[][][] = []
  for (let layer = 0; layer < 4; layer++) {
    const scale = Math.pow(2, layer)
    noiseLayers[layer] = []
    for (let y = 0; y < size; y++) {
      noiseLayers[layer][y] = []
      for (let x = 0; x < size; x++) {
        noiseLayers[layer][y][x] = Math.random()
      }
    }
  }
  
  // 生成行星表面紋理
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % size
    const y = Math.floor((i / 4) / size)
    
    // 多層噪點混合
    let noise = 0
    let weight = 1
    for (let layer = 0; layer < 4; layer++) {
      const scale = Math.pow(2, layer)
      const nx = Math.floor(x / scale) % size
      const ny = Math.floor(y / scale) % size
      noise += noiseLayers[layer][ny][nx] * weight
      weight *= 0.5
    }
    noise /= (1 + 0.5 + 0.25 + 0.125)
    
    // 添加大尺度特徵
    const largeFeature = Math.sin(x * 0.02) * Math.sin(y * 0.02) * 0.3
    const mediumFeature = Math.sin(x * 0.1 + y * 0.08) * 0.2
    const smallFeature = Math.sin(x * 0.5 + y * 0.3) * 0.15
    
    const brightness = 0.6 + noise * 0.4 + largeFeature + mediumFeature + smallFeature
    const clampedBrightness = Math.max(0.3, Math.min(1.4, brightness))
    
    // 根據行星類型調整顏色和花紋
    const color = planet.base.clone()
    if (planetType === 'mars') {
      // 火星：紅色調，有火山和峽谷紋理
      const volcano = Math.sin(x * 0.03) * Math.sin(y * 0.03) * 0.3
      const canyon = Math.sin(x * 0.08 + y * 0.12) * 0.2
      const detail = noise * 0.3
      color.r *= clampedBrightness * (0.9 + volcano + detail)
      color.g *= clampedBrightness * (0.6 + canyon * 0.5 + detail * 0.3)
      color.b *= clampedBrightness * (0.4 + detail * 0.2)
    } else if (planetType === 'mercury') {
      // 水星：灰褐色，有密集的隕石坑和裂縫
      const crater1 = Math.sin(x * 0.15) * Math.sin(y * 0.15) > 0.7 ? 0.6 : 1.0
      const crater2 = Math.sin(x * 0.25 + y * 0.2) > 0.8 ? 0.7 : 1.0
      const crack = Math.abs(Math.sin(x * 0.2 + y * 0.3)) > 0.9 ? 0.8 : 1.0
      const crater = Math.min(crater1, crater2, crack)
      color.r *= clampedBrightness * crater
      color.g *= clampedBrightness * crater
      color.b *= clampedBrightness * crater
    } else if (planetType === 'saturn') {
      // 土星：淡黃色，有明顯的橫向條紋和雲帶
      const stripe1 = Math.sin(y * 0.03) * 0.15 + 1.0
      const stripe2 = Math.sin(y * 0.08) * 0.1 + 1.0
      const cloud = Math.sin(x * 0.05 + y * 0.02) * 0.05 + 1.0
      const stripe = stripe1 * stripe2 * cloud
      color.r *= clampedBrightness * stripe
      color.g *= clampedBrightness * stripe * 0.95
      color.b *= clampedBrightness * stripe * 0.85
    } else {
      // 地球：藍綠色，有陸地和海洋的紋理
      const land = Math.sin(x * 0.04 + y * 0.06) * 0.3 + 0.7
      const ocean = Math.sin(x * 0.02) * Math.sin(y * 0.02) * 0.2 + 0.8
      const continent = Math.sin(x * 0.08 + y * 0.1) > 0.3 ? 1.2 : 1.0
      const mix = land * ocean * continent
      color.r *= clampedBrightness * mix * 0.6
      color.g *= clampedBrightness * mix * 0.8
      color.b *= clampedBrightness * mix
    }
    
    data[i] = Math.min(255, color.r * 255)
    data[i + 1] = Math.min(255, color.g * 255)
    data[i + 2] = Math.min(255, color.b * 255)
    data[i + 3] = 255
  }
  
  context.putImageData(imageData, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

// 創建法線貼圖
const createNormalMap = (size: number = 1024): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('無法獲取 canvas 2d context')
  }
  
  const imageData = context.createImageData(size, size)
  const data = imageData.data
  
  // 生成高度圖
  const heightMap: number[][] = []
  for (let y = 0; y < size; y++) {
    heightMap[y] = []
    for (let x = 0; x < size; x++) {
      const h1 = Math.sin(x * 0.1) * Math.sin(y * 0.1) * 0.5
      const h2 = Math.sin(x * 0.05 + y * 0.03) * 0.3
      const h3 = Math.sin(x * 0.2 + y * 0.15) * 0.2
      const h4 = Math.random() * 0.2
      heightMap[y][x] = h1 + h2 + h3 + h4
    }
  }
  
  // 從高度圖生成法線貼圖
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % size
    const y = Math.floor((i / 4) / size)
    
    const h = heightMap[y][x]
    const hx = heightMap[y][(x + 1) % size] - h
    const hy = heightMap[(y + 1) % size]?.[x] - h || 0
    
    // 法線向量
    const strength = 2.0
    const nx = (hx * strength * 0.5 + 0.5)
    const ny = (hy * strength * 0.5 + 0.5)
    const len = Math.sqrt(nx * nx + ny * ny + 1)
    const nz = 1.0 / len
    
    data[i] = Math.max(0, Math.min(255, (nx / len + 1) * 0.5 * 255))
    data[i + 1] = Math.max(0, Math.min(255, (ny / len + 1) * 0.5 * 255))
    data[i + 2] = Math.max(0, Math.min(255, (nz + 1) * 0.5 * 255))
    data[i + 3] = 255
  }
  
  context.putImageData(imageData, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

// 創建 Bump 貼圖
const createBumpMap = (size: number = 1024): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('無法獲取 canvas 2d context')
  }
  
  const imageData = context.createImageData(size, size)
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % size
    const y = Math.floor((i / 4) / size)
    
    const h1 = Math.sin(x * 0.1) * Math.sin(y * 0.1) * 0.5
    const h2 = Math.sin(x * 0.05 + y * 0.03) * 0.3
    const h3 = Math.random() * 0.2
    const height = h1 + h2 + h3
    
    const gray = Math.max(0, Math.min(255, (height + 1) * 0.5 * 255))
    data[i] = gray
    data[i + 1] = gray
    data[i + 2] = gray
    data[i + 3] = 255
  }
  
  context.putImageData(imageData, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

// 創建大氣層光暈效果（使用 ShaderMaterial，類似火星範例）
const createAtmosphereGlow = (baseColor: number, radius: number): THREE.Mesh => {
  const glowGeometry = new THREE.SphereGeometry(radius * 1.01, 128, 128)
  const color = new THREE.Color(baseColor)
  
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Vector3(color.r, color.g, color.b) }
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
        gl_FragColor = vec4(uColor, 0.9) * intensity;
      }
    `,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
  })
  
  return new THREE.Mesh(glowGeometry, glowMaterial)
}

// 創建 Rim Light 效果（邊緣光，模擬次表面散射）
const createRimLight = (baseColor: number, radius: number): THREE.Mesh => {
  const rimGeometry = new THREE.SphereGeometry(radius * 1.03, 64, 64)
  const rimMaterial = new THREE.MeshBasicMaterial({
    color: baseColor,
    transparent: true,
    opacity: 0.08
  })
  return new THREE.Mesh(rimGeometry, rimMaterial)
}

// 創建互動球體（圍繞中央太陽運行）
const createInteractiveSpheres = (): SphereMesh[] => {
  const spheres: SphereMesh[] = []
  // 定義不同行星類型
  const planetTypes: Array<'mars' | 'mercury' | 'saturn' | 'earth'> = ['mars', 'mercury', 'saturn', 'earth']
  const planetColors: number[] = [0xcd5c5c, 0x8c7853, 0xfad5a5, 0x4a90e2] // 火星、水星、土星、地球
  
  props.menuItems.forEach((item, index) => {
    // 根據真實行星大小比例設置半徑
    // 水星(0.38) < 火星(0.53) < 地球(1.0) < 土星(9.5，但我們縮小到2.5)
    const planetType = planetTypes[index % planetTypes.length]
    const planetSizes: Record<string, number> = {
      mercury: 0.38 * 2,  // 水星最小，放大兩倍
      mars: 0.53 * 2,     // 火星中等，放大兩倍
      earth: 1.0,         // 地球標準
      saturn: 2.5         // 土星最大（縮小版）
    }
    const baseSize = 0.8 // 基礎大小
    const sphereRadius = baseSize * (planetSizes[planetType] || 1.0)
    
    // 使用高精度幾何體（128分段，類似火星範例）
    const geometry = new THREE.SphereGeometry(sphereRadius, 128, 128)
    
    const baseColor = planetColors[index % planetColors.length]
    
    // 創建紋理、法線貼圖和 bump 貼圖
    const texture = createPlanetTexture(planetType, 1024)
    const normalMap = createNormalMap(1024)
    const bumpMap = createBumpMap(1024)
    
    // 使用 MeshStandardMaterial（類似火星範例）
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      normalMap: normalMap,
      bumpMap: bumpMap,
      bumpScale: 0.03, // 類似火星範例
      metalness: 0.0,
      roughness: 1.0
    })
    
    const sphere = new THREE.Mesh(geometry, material) as SphereMesh
    
    // 添加旋轉傾斜（類似火星的 25° 傾斜）
    const tiltAngle = (index % 4) * 15 // 不同傾斜角度
    sphere.rotation.z = THREE.MathUtils.degToRad(tiltAngle)
    
    // 添加大氣層光暈（使用 ShaderMaterial）
    const atmosphere = createAtmosphereGlow(baseColor, sphereRadius)
    sphere.add(atmosphere)
    
    // 添加 Rim Light 效果
    const rim = createRimLight(baseColor, sphereRadius)
    sphere.add(rim)
    
    // 計算軌道半徑（間隔更大）
    const radius = 5 + index * 2 //讓間隔更大
    const angle = (index / props.menuItems.length) * Math.PI * 2
    
    // 初始位置
    sphere.position.x = Math.cos(angle) * radius
    sphere.position.y = Math.sin(angle) * radius * 0.5
    sphere.position.z = Math.sin(angle * 0.7) * 0.5 // 3D 深度
    
    // 讓某些行星逆時針轉（奇數索引的行星逆時針）
    const direction = index % 2 === 0 ? 1 : -1 // 偶數順時針，奇數逆時針
    const speed = (0.1 + index * 0.05) * direction
    
    sphere.userData = { 
      item, 
      index, 
      radius,
      initialAngle: angle,
      orbitSpeed: speed, // 不同速度和方向，讓公轉更明顯
      atmosphere,
      rim
    }
    
    // 不創建軌道線（移除）
    
    // const orbitLine = createOrbitLine(radius, baseColor)
    // orbitLines.push(orbitLine)
    
    spheres.push(sphere)
    scene.add(sphere)
  })
  
  return spheres
}

const onMouseMove = (e: MouseEvent): void => {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
}

// 處理面板關閉
const handlePanelClose = (): void => {
  if (activeSphere) {
    // 恢復球的 scale
    gsap.to(activeSphere.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.5,
      ease: 'power2.out'
    })
    
    // 清除 activeSphere
    activeSphere = null
    
    // 隱藏資訊面板
    selectedContent.value = null
    
    // 相機回到初始位置
    if (camera) {
      gsap.to(camera.position, {
        x: 8,
        y: 4,
        z: 8,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (camera) {
            camera.lookAt(0, 0, 0)
          }
        }
      })
    }
  }
}

const onClick = (e: MouseEvent): void => {
  if (!camera || !raycaster) return
  
  // 檢查點擊是否在資訊面板上，如果是則不處理
  const target = e.target as HTMLElement
  if (target.closest('.planet-info-panel')) {
    return
  }
  
  console.log('點擊觸發！') // 步驟1：確認點擊是否觸發
  
  raycaster.setFromCamera(mouse, camera)
  // 需要檢測所有物體（包括子物體），然後找到真正的球
  const allObjects: THREE.Object3D[] = []
  
  // 加入地球（centralSun）
  if (centralSun) {
    allObjects.push(centralSun)
    if (centralSun.children) {
      allObjects.push(...centralSun.children)
    }
  }
  
  // 加入其他行星
  spheres.forEach(sphere => {
    allObjects.push(sphere)
    if (sphere.children) {
      allObjects.push(...sphere.children)
    }
  })
  
  const intersects = raycaster.intersectObjects(allObjects, true)
  
  console.log('檢測到的物體數量:', intersects.length) // 步驟2：確認是否檢測到球
  
  if (intersects.length > 0) {
    // 找到真正的球體（可能是點擊到球本身，或是球的子物體）
    let clickedObject = intersects[0].object
    let sphere: SphereMesh | null = null
    
    // 如果點擊到的是球本身（包括地球）
    if (clickedObject.userData && clickedObject.userData.item) {
      sphere = clickedObject as SphereMesh
    } else {
      // 如果點擊到的是子物體（大氣層或 rim），找到父球體
      let parent = clickedObject.parent
      while (parent) {
        if (parent.userData && parent.userData.item) {
          sphere = parent as SphereMesh
          break
        }
        parent = parent.parent
      }
    }
    
    console.log('找到球:', sphere?.userData.item?.label) // 步驟3：確認點擊到哪個球
    
    if (sphere && sphere.userData && sphere.userData.item) {
      const itemId = sphere.userData.item.id
      emit('select', itemId)
      
      // 獲取並顯示對應的內容
      const content = getPlanetContent(itemId)
      selectedContent.value = content
      
      // 步驟4：先實現簡單的放大效果
      // 移除之前選中球的 active 效果
      if (activeSphere && activeSphere !== sphere) {
        gsap.to(activeSphere.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.3,
          ease: 'power2.out'
        })
      }
      
      // 設置新的 active 球
      activeSphere = sphere
      console.log('設置 activeSphere:', activeSphere.userData.item?.label)
      
      // Active 效果：放大（先測試這個）
      gsap.to(sphere.scale, {
        x: 1.5,
        y: 1.5,
        z: 1.5,
        duration: 0.5,
        ease: 'power2.out'
      })
      
      // 步驟5：相機移動（簡單版本）
      if (camera) {
        const targetPos = sphere.position.clone()
        // 地球在中心，相機位置稍微不同
        if (sphere.userData.isEarth) {
          targetPos.z += 8 // 地球在中心，相機在正前方
        } else {
          targetPos.z += 8 // 其他行星，相機在球的前方
        }
        
        gsap.to(camera.position, {
          x: targetPos.x,
          y: targetPos.y,
          z: targetPos.z,
          duration: 1.5,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (camera && activeSphere) {
              camera.lookAt(activeSphere.position)
            }
          }
        })
      }
    }
  } else {
    // 點擊空白處，清除 active 狀態，相機回到初始位置
    if (activeSphere) {
      console.log('清除 active 狀態')
      
      // 恢復球的 scale
      gsap.to(activeSphere.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.5,
        ease: 'power2.out'
      })
      
      // 清除 activeSphere
      activeSphere = null
      
      // 隱藏資訊面板
      selectedContent.value = null
      
      // 相機回到初始位置
      if (camera) {
        gsap.to(camera.position, {
          x: 8,
          y: 4,
          z: 8,
          duration: 1.5,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (camera) {
              camera.lookAt(0, 0, 0)
            }
          }
        })
      }
    }
  }
}

const animate = (): void => {
  animationId = requestAnimationFrame(animate)
  
  const dt = clock.getDelta()
  const t = Date.now() * 0.001

  // 緩慢旋轉銀河系（非常慢，減少頭暈）
  if (starfield) {
    starfield.rotation.y += starfield.userData.rotationSpeed
  }
  
  // 旋轉中央地球（緩慢自轉）
  if (centralSun) {
    centralSun.rotation.y += 0.002 // 地球自轉
  }

  // 球體圍繞地球運行（360度軌道公轉）
  spheres.forEach((sphere) => {
    const { radius, initialAngle, orbitSpeed: speed } = sphere.userData
    const currentAngle = initialAngle + t * speed * orbitSpeed
    
    // 圍繞地球的 360 度圓形軌道（3D 效果）
    sphere.position.x = Math.cos(currentAngle) * radius
    sphere.position.y = Math.sin(currentAngle) * radius * 0.5 // 稍微橢圓
    sphere.position.z = Math.sin(currentAngle * 0.7) * 1.5 // 3D 深度，讓軌道更立體
    
    // 球體自轉（同時進行自轉）
    sphere.rotation.y += dt * 0.08 // 自轉速度
    
    // 大氣層和 rim light 跟隨球體旋轉（稍微不同步）
    if (sphere.userData.atmosphere) {
      sphere.userData.atmosphere.rotation.y = sphere.rotation.y * 1.02
    }
    if (sphere.userData.rim) {
      sphere.userData.rim.rotation.y = sphere.rotation.y * 1.02
    }
  })
  
  // 步驟6：相機跟隨（在動畫循環中持續跟隨）
  if (activeSphere && camera && renderer) {
    // 禁用 OrbitControls 當有選中的球時
    if (controls) {
      controls.enabled = false
    }
    
    // 計算相機目標位置（在球的前方）
    const spherePosition = activeSphere.position.clone()
    const cameraDistance = 8
    
    // 地球在中心，相機位置稍微不同
    let targetPos: THREE.Vector3
    if (activeSphere.userData.isEarth) {
      // 地球在中心，相機在正前方
      targetPos = new THREE.Vector3(0, 0, cameraDistance)
    } else {
      // 其他行星，相機在球的前方
      targetPos = new THREE.Vector3(
        spherePosition.x,
        spherePosition.y,
        spherePosition.z + cameraDistance
      )
    }
    
    // 平滑跟隨
    camera.position.lerp(targetPos, 0.05)
    camera.lookAt(activeSphere.position)
    
    // 計算球的螢幕座標（用於定位資訊面板）
    const vector = spherePosition.clone().project(camera)
    const rect = renderer.domElement.getBoundingClientRect()
    const width = rect.width || window.innerWidth
    const height = rect.height || window.innerHeight
    const widthHalf = width / 2
    const heightHalf = height / 2
    
    // 計算目標位置
    const targetX = (vector.x * widthHalf) + widthHalf
    const targetY = -(vector.y * heightHalf) + heightHalf
    
    // 平滑插值，減少抖動
    smoothedPanelPosition.value = {
      x: smoothedPanelPosition.value.x + (targetX - smoothedPanelPosition.value.x) * 0.15,
      y: smoothedPanelPosition.value.y + (targetY - smoothedPanelPosition.value.y) * 0.15
    }
    
    panelPosition.value = smoothedPanelPosition.value
  } else {
    // 沒有選中球時，啟用 OrbitControls
    if (controls) {
      controls.enabled = true
      controls.update()
    }
    // 隱藏面板位置
    panelPosition.value = { x: 0, y: 0 }
    smoothedPanelPosition.value = { x: 0, y: 0 }
  }

  // Hover detection（包含地球和其他行星）
  if (raycaster && camera) {
    raycaster.setFromCamera(mouse, camera)
    
    // 檢測所有可點擊的物體（包括地球和子物體）
    const allHoverObjects: THREE.Object3D[] = []
    if (centralSun) {
      allHoverObjects.push(centralSun)
      if (centralSun.children) {
        allHoverObjects.push(...centralSun.children)
      }
    }
    spheres.forEach(sphere => {
      allHoverObjects.push(sphere)
      if (sphere.children) {
        allHoverObjects.push(...sphere.children)
      }
    })
    
    const intersects = raycaster.intersectObjects(allHoverObjects, true)
    
    // 找到被 hover 的球（可能是球本身或子物體）
    let hoveredSphere: THREE.Mesh | null = null
    if (intersects.length > 0) {
      let clickedObject = intersects[0].object
      
      // 如果點擊到的是球本身
      if (clickedObject.userData && clickedObject.userData.item) {
        hoveredSphere = clickedObject as THREE.Mesh
      } else {
        // 如果點擊到的是子物體，找到父球體
        let parent = clickedObject.parent
        while (parent) {
          if (parent.userData && parent.userData.item) {
            hoveredSphere = parent as THREE.Mesh
            break
          }
          parent = parent.parent
        }
      }
    }
    
    // 處理所有球的 hover 效果
    const allSpheres: THREE.Mesh[] = []
    if (centralSun) allSpheres.push(centralSun)
    allSpheres.push(...spheres)
    
    let hasHover = false
    allSpheres.forEach((sphere) => {
      const isHovered = hoveredSphere === sphere
      const isActive = activeSphere === sphere
      
      if (isHovered) {
        hasHover = true
        // 只改變 cursor，不放大球
        if (renderer) {
          renderer.domElement.style.cursor = 'pointer'
        }
        // 如果這個球不是 active 狀態，可以添加其他 hover 效果（但不放大）
        // 例如：可以改變材質的 emissive 或其他視覺效果
      }
      
      // 只有當球不是 active 狀態時，才恢復正常大小（避免干擾 active 效果）
      if (!isActive && !isHovered) {
        // 如果球沒有被選中且沒有被 hover，確保它是正常大小
        // 但這裡不應該強制設置，因為 active 球應該保持放大狀態
      }
    })
    
    if (!hasHover && renderer) {
      renderer.domElement.style.cursor = 'default'
    }
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

onMounted(() => {
  if (typeof window === 'undefined' || !containerRef.value) return

  const width = containerRef.value.clientWidth || window.innerWidth
  const height = containerRef.value.clientHeight || window.innerHeight

  // Scene - 深色星空背景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a0f) // 深藍黑色，像真實夜空

  // Camera
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.set(0, 0, 8)

  // Renderer - 啟用更好的渲染效果
  renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    powerPreference: 'high-performance'
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping // 更好的色調映射
  renderer.toneMappingExposure = 1.2 // 稍微增強曝光
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  containerRef.value.appendChild(renderer.domElement)

  // Lights - 為地球設置光照
  // 主定向光源（模擬太陽光）
  dirLight = new THREE.DirectionalLight(0xffffff, 2.0)
  dirLight.position.set(0, 0, 3) // 從側面照射，模擬太陽
  scene.add(dirLight)

  // 環境光（較暗，讓晝夜對比更明顯）
  scene.add(new THREE.AmbientLight(0x888888, 0.2))

  // 創建星空背景
  starfield = createStarfield()
  scene.add(starfield)
  
  // 創建真實的中央地球
  centralSun = createCentralSun()
  
  // 更新地球 shader 的太陽方向
  if (centralSun) {
    const earthMaterial = centralSun.material as THREE.ShaderMaterial
    if (earthMaterial && earthMaterial.uniforms && earthMaterial.uniforms.sunDirection) {
      earthMaterial.uniforms.sunDirection.value.copy(dirLight.position).normalize()
    }
    const atmosphereMesh = centralSun.children[0] as THREE.Mesh
    if (atmosphereMesh) {
      const atmosphereMaterial = atmosphereMesh.material as THREE.ShaderMaterial
      if (atmosphereMaterial && atmosphereMaterial.uniforms && atmosphereMaterial.uniforms.sunDirection) {
        atmosphereMaterial.uniforms.sunDirection.value.copy(dirLight.position).normalize()
      }
    }
  }
  
  // 創建互動球體（圍繞地球運行）
  spheres = createInteractiveSpheres()
  
  // 設置相機初始位置
  camera.position.set(8, 4, 8)
  camera.lookAt(0, 0, 0)

  // OrbitControls - 360度旋轉控制（確保 3D 旋轉效果正常）
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 5
  controls.maxDistance = 30
  controls.enablePan = false // 禁用平移，只允許旋轉和縮放
  controls.autoRotate = false // 關閉自動旋轉，讓用戶手動控制

  // Raycaster
  raycaster = new THREE.Raycaster()

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('click', onClick)

  const handleResize = (): void => {
    if (!containerRef.value || !renderer || !camera) return
    const w = containerRef.value.clientWidth || window.innerWidth
    const h = containerRef.value.clientHeight || window.innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  window.addEventListener('resize', handleResize)
  
  // 確保初始化完成後再開始動畫
  setTimeout(() => {
    handleResize()
    // 立即渲染一次
    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
    // 啟動動畫循環
    if (animationId === null) {
      animate()
    }
  }, 100)
})

onUnmounted(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }
  if (controls) {
    controls.dispose()
  }
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('click', onClick)
  if (containerRef.value && containerRef.value.firstChild) {
    containerRef.value.removeChild(containerRef.value.firstChild)
  }
})
</script>

<template>
  <div ref="containerRef" class="w-full h-full fixed inset-0" style="min-height: 100vh;">
    <!-- 資訊面板 -->
    <PlanetInfoPanel 
      :content="selectedContent" 
      :visible="isPanelVisible"
      :position="panelPosition"
      @close="handlePanelClose"
      @prev="switchPlanet('prev')"
      @next="switchPlanet('next')"
      @navigate-to="navigateToPlanet"
    />
  </div>
</template>

<style scoped>
div > canvas {
  display: block ;
  width: 100% ;
  height: 100% ;
  position: absolute;
  top: 0;
  left: 0;
}
</style>

