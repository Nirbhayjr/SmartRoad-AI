"use client"

import Hero from '../components/Hero'
import Problem from '../components/Problem'
import Challenges from '../components/Challenges'
import AISolution from '../components/AISolution'
import Architecture from '../components/Architecture'
import Severity from '../components/Severity'
import Reporting from '../components/Reporting'
import Benefits from '../components/Benefits'
import Team from '../components/Team'

type User = {
  name: string
  email?: string
}

function Home() {
  return (
    <main>
      <Hero />
      <Problem />
      <Challenges />
      <AISolution />
      <Architecture />
      <Severity />
      <Reporting />
      <Benefits />
      <Team />
    </main>
  )
}

export default Home
