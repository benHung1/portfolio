import * as THREE from 'three'

export interface MenuItem {
  id: string
  label: string
  path: string
}

export interface StarfieldUserData {
  rotationSpeed: number
}

export interface SphereUserData {
  item: MenuItem
  index: number
  radius: number
  initialAngle: number
  orbitSpeed: number
}

export interface SphereMesh extends THREE.Mesh {
  userData: SphereUserData
}

export interface StarfieldPoints extends THREE.Points {
  userData: StarfieldUserData
}

