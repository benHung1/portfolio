<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { gsap } from 'gsap'

const emit = defineEmits(['select'])

const props = defineProps<{
  menuItems: Array<{ id: string; label: string; path: string }>
}>()

const containerRef = ref<HTMLElement | null>(null)

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let starfield: THREE.Points
let centralSun: THREE.Mesh | null = null
let orbitLines: THREE.Line[] = []
let spheres: THREE.Mesh[] = []
let raycaster: THREE.Raycaster
const mouse = new THREE.Vector2()
let animationId: number | null = null
let orbitSpeed = 0.1

// 創建擬真星空背景
function createStarfield(): THREE.Points {
  const particleCount = 5000
  const positions: number[] = []
  const colors: number[] = []
  const sizes: number[] = []
  
  for (let i = 0; i < particleCount; i++) {
    // 隨機分佈在更大的範圍內
    const x = (Math.random() - 0.5) * 2000
    const y = (Math.random() - 0.5) * 2000
    const z = (Math.random() - 0.5) * 2000
    
    positions.push(x, y, z)
    
    // 大部分是白色/淡藍色星星，少數彩色
    let color: THREE.Color
    const brightness = Math.random()
    
    if (brightness > 0.95) {
      // 5% 的亮星（白色/淡藍色）
      const whiteBrightness = 0.8 + Math.random() * 0.2
      color = new THREE.Color(whiteBrightness, whiteBrightness, whiteBrightness + 0.1)
    } else if (brightness > 0.9) {
      // 5% 的彩色星星（藍色/青色）
      const hue = 0.5 + Math.random() * 0.2 // 藍色到青色
      color = new THREE.Color().setHSL(hue, 0.6, 0.7 + Math.random() * 0.3)
    } else {
      // 90% 的普通星星（白色/淡藍色，不同亮度）
      const starBrightness = 0.3 + Math.random() * 0.5
      color = new THREE.Color(starBrightness, starBrightness, starBrightness + 0.05)
    }
    
    colors.push(color.r, color.g, color.b)
    
    // 不同大小的星星（亮星更大）
    const size = brightness > 0.95 ? 2 + Math.random() * 2 : 0.5 + Math.random() * 1
    sizes.push(size)
  }
  
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  
  // 使用簡單的 PointsMaterial，但調整參數避免方形
  const material = new THREE.PointsMaterial({
    size: 1.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    alphaTest: 0.01, // 避免方形邊緣
    map: null // 不使用紋理，使用默認圓形
  })
  
  const mesh = new THREE.Points(geometry, material)
  mesh.userData.rotationSpeed = 0.0001
  return mesh
}

// 創建中央太陽
function createCentralSun(): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(1.5, 64, 64)
  const material = new THREE.MeshPhongMaterial({
    color: 0xff6b35, // 橙色
    emissive: 0xff6b35,
    emissiveIntensity: 0.8,
    shininess: 100
  })
  
  const sun = new THREE.Mesh(geometry, material)
  sun.position.set(0, 0, 0)
  
  // 添加光暈效果
  const glowGeometry = new THREE.SphereGeometry(1.7, 64, 64)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6b35,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  })
  const glow = new THREE.Mesh(glowGeometry, glowMaterial)
  sun.add(glow)
  
  scene.add(sun)
  return sun
}

// 創建軌道線
function createOrbitLine(radius: number, color: number = 0x4d76cf): THREE.Line {
  const points: THREE.Vector3[] = []
  const segments = 64
  
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius * 0.5 // 橢圓軌道
    const z = 0
    points.push(new THREE.Vector3(x, y, z))
  }
  
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.3,
    linewidth: 1
  })
  
  const line = new THREE.Line(geometry, material)
  scene.add(line)
  return line
}

// 創建互動球體（圍繞中央太陽運行）
function createInteractiveSpheres(): THREE.Mesh[] {
  const spheres: THREE.Mesh[] = []
  const colors = [0x00ff88, 0x00ccff, 0xff6b6b, 0xffd93d]
  
  props.menuItems.forEach((item, index) => {
    const geometry = new THREE.SphereGeometry(0.6, 32, 32)
    const material = new THREE.MeshPhongMaterial({
      color: colors[index % colors.length],
      emissive: colors[index % colors.length],
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.95,
      shininess: 100
    })
    
    const sphere = new THREE.Mesh(geometry, material)
    
    // 計算軌道半徑（不同距離）
    const radius = 4 + index * 0.5
    const angle = (index / props.menuItems.length) * Math.PI * 2
    
    // 初始位置
    sphere.position.x = Math.cos(angle) * radius
    sphere.position.y = Math.sin(angle) * radius * 0.5
    sphere.position.z = Math.sin(angle * 0.7) * 0.5 // 3D 深度
    
    sphere.userData = { 
      item, 
      index, 
      radius,
      initialAngle: angle,
      orbitSpeed: 0.05 + index * 0.01 // 不同速度
    }
    
    // 創建軌道線
    const orbitLine = createOrbitLine(radius, colors[index % colors.length])
    orbitLines.push(orbitLine)
    
    spheres.push(sphere)
    scene.add(sphere)
  })
  
  return spheres
}

function onMouseMove(e: MouseEvent) {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
}

function onClick() {
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(spheres)
  
  if (intersects.length > 0) {
    const sphere = intersects[0].object as THREE.Mesh
    if (sphere.userData.item) {
      emit('select', sphere.userData.item.id)
      
      // 動畫效果
      gsap.to(sphere.scale, {
        x: 1.5,
        y: 1.5,
        z: 1.5,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      })
    }
  }
}

function animate() {
  animationId = requestAnimationFrame(animate)
  
  const t = Date.now() * 0.001

  // 緩慢旋轉銀河系（非常慢，減少頭暈）
  if (starfield) {
    starfield.rotation.y += starfield.userData.rotationSpeed || 0.0001
  }
  
  // 旋轉中央太陽
  if (centralSun) {
    centralSun.rotation.y += 0.002
    centralSun.rotation.x += 0.001
  }

  // 球體圍繞太陽運行（明顯的 3D 軌道）
  spheres.forEach((sphere) => {
    const { radius, initialAngle, orbitSpeed: speed } = sphere.userData
    const currentAngle = initialAngle + t * speed * orbitSpeed
    
    // 3D 橢圓軌道
    sphere.position.x = Math.cos(currentAngle) * radius
    sphere.position.y = Math.sin(currentAngle) * radius * 0.5
    sphere.position.z = Math.sin(currentAngle * 0.7) * 1.5 // 更明顯的 3D 深度
    
    // 球體自轉
    sphere.rotation.x += 0.01
    sphere.rotation.y += 0.01
    
    // 讓球體始終面向太陽
    sphere.lookAt(0, 0, 0)
  })
  
  // 更新 OrbitControls
  if (controls) {
    controls.update()
  }

  // Hover detection
  if (raycaster && camera) {
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(spheres)
    
    let hasHover = false
    spheres.forEach((sphere) => {
      const isHovered = intersects.some(i => i.object === sphere)
      if (isHovered) {
        hasHover = true
        gsap.to(sphere.scale, { x: 1.3, y: 1.3, z: 1.3, duration: 0.3 })
        if (renderer) {
          renderer.domElement.style.cursor = 'pointer'
        }
      } else {
        gsap.to(sphere.scale, { x: 1, y: 1, z: 1, duration: 0.3 })
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

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  containerRef.value.appendChild(renderer.domElement)

  // Lights - 更柔和的光照
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3) // 稍微減弱環境光
  scene.add(ambientLight)

  const pointLight1 = new THREE.PointLight(0x00ff88, 0.5, 50) // 減弱強度
  pointLight1.position.set(5, 5, 5)
  scene.add(pointLight1)

  const pointLight2 = new THREE.PointLight(0x00ccff, 0.5, 50) // 減弱強度
  pointLight2.position.set(-5, -5, 5)
  scene.add(pointLight2)
  
  // 添加一個柔和的頂部光源
  const topLight = new THREE.DirectionalLight(0xffffff, 0.2)
  topLight.position.set(0, 10, 0)
  scene.add(topLight)

  // 創建星空背景
  starfield = createStarfield()
  scene.add(starfield)
  
  // 創建中央太陽
  centralSun = createCentralSun()
  
  // 創建互動球體（圍繞太陽運行）
  spheres = createInteractiveSpheres()
  
  // 設置相機初始位置
  camera.position.set(8, 4, 8)
  camera.lookAt(0, 0, 0)

  // OrbitControls - 360度旋轉控制
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

  const handleResize = () => {
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
  </div>
</template>

<style scoped>
div > canvas {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
  position: absolute;
  top: 0;
  left: 0;
}
</style>

