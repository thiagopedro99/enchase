import Legacy from './legacy'
import Shell from './shell'

export default function Page() {
  return (
    <main>
      <h1>Headless server page</h1>
      <Shell />
      <h2>Old paths</h2>
      <Legacy />
    </main>
  )
}
