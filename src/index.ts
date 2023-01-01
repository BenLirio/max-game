import p5 from 'p5'
const G = 0.01
const width = 800
const height = 800

const seq = (fns: ((p: p5) => void)[]) => (p: p5) => fns.forEach(fn => fn(p))

interface IVector {
  x: number
  y: number
}

const dist = (v1: IVector) => (v2: IVector) =>
  Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2))


interface IPlanet {
  pos: IVector
  vel: IVector
  m: number
  s: number
}

interface IState {
  planets: IPlanet[]
  mouseDown?: IVector
}

let state: IState = {
  planets: [
    {
      pos: {x: width / 2, y: height / 2},
      vel: {x: 0, y: 0},
      m: 1000,
      s: 50
    },
  ]
}
state = {
  ...state,
  planets: []
}

const drawPlanet = ({pos: {x, y}, m, s}: IPlanet) => (p: p5) => {
  p.circle(x, y, s)
}
const drawMouse = ({x, y}: IVector) => (p: p5) => {
  p.stroke('white')
  p.strokeWeight(2)
  p.line(x, y, p.mouseX, p.mouseY)
}

const drawState = (state: IState) => {
  const mouseDrawFunc = state.mouseDown !== undefined ? [ drawMouse(state.mouseDown) ] : []
  const planetDrawFunc = state.planets.map(drawPlanet)
  return seq([...planetDrawFunc, ...mouseDrawFunc])
}

const updateState = (state: IState): IState => {
  const newState = {...state}
  state.planets.forEach((a, i) =>
    state.planets.forEach((b, j) => {
      if (i !== j) {
        const F = G*(a.m + b.m) / dist(a.pos)(b.pos)
        const Fx = F * (b.pos.x - a.pos.x) / dist(a.pos)(b.pos)
        const Fy = F * (b.pos.y - a.pos.y) / dist(a.pos)(b.pos)
        newState.planets[i].vel.x += Fx / a.m
        newState.planets[i].vel.y += Fy / a.m
        newState.planets[j].vel.x -= Fx / b.m
        newState.planets[j].vel.y -= Fy / b.m
      }
    }))
  newState.planets = newState.planets.map(planet => {
    planet.pos = {
      x: planet.pos.x + planet.vel.x,
      y: planet.pos.y + planet.vel.y
    }
    return planet
  })
  return newState
}

const s = (p:p5) => {
  p.setup = () => {
    p.createCanvas(width, height)
  }

  p.draw = () => {
    state = updateState(state)
    p.background(0)
    drawState(state)(p)
  }

  p.mousePressed = () => {
    state.mouseDown = {
      x: p.mouseX,
      y: p.mouseY
    }
  }
  p.mouseReleased = () => {
    state.planets.push({
      pos: {
        x: state.mouseDown.x,
        y: state.mouseDown.y
      },
      vel: {
        x: (state.mouseDown.x - p.mouseX) / 10,
        y: (state.mouseDown.y - p.mouseY) / 10
      },
      m: 1,
      s: 5
    })
    delete state.mouseDown
  }
}

new p5(s)