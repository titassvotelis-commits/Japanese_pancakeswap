/**
 * Dev server reachable from other devices on the LAN (e.g. http://192.168.x.x:3000).
 * - Binds 0.0.0.0
 * - Sets WDS_SOCKET_HOST to this machine's LAN IP (hot reload from phones/tablets)
 * - On Windows, adds an inbound firewall rule for port 3000 (Private profile)
 */
const { spawn, spawnSync } = require('child_process')
const os = require('os')
const path = require('path')

const PORT = process.env.PORT || '3000'

function getLanIPv4() {
  const nets = os.networkInterfaces()
  for (const ifaces of Object.values(nets)) {
    if (!ifaces) continue
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return null
}

function allowFirewallPortWin32(port) {
  if (process.platform !== 'win32') {
    return
  }

  const ruleName = `Optimus Dev Server TCP ${port}`
  const check = spawnSync(
    'powershell',
    [
      '-NoProfile',
      '-Command',
      `(Get-NetFirewallRule -DisplayName '${ruleName}' -ErrorAction SilentlyContinue) -ne $null`,
    ],
    { encoding: 'utf8' },
  )

  if (check.stdout && check.stdout.trim() === 'True') {
    console.log(`Firewall rule already exists: ${ruleName}`)
    return
  }

  console.log(`Adding Windows Firewall inbound rule for TCP port ${port} (Private network)...`)
  const result = spawnSync(
    'powershell',
    [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      `New-NetFirewallRule -DisplayName '${ruleName}' -Direction Inbound -Action Allow -Protocol TCP -LocalPort ${port} -Profile Private`,
    ],
    { encoding: 'utf8', stdio: 'inherit' },
  )

  if (result.status !== 0) {
    console.warn(
      '\nCould not add firewall rule automatically. If other devices cannot connect, run as Administrator:\n',
    )
    console.warn(
      `  netsh advfirewall firewall add rule name="${ruleName}" dir=in action=allow protocol=TCP localport=${port}\n`,
    )
  }
}

const lanIp = getLanIPv4()

if (lanIp) {
  console.log(`LAN IP: http://${lanIp}:${PORT}`)
} else {
  console.warn('Could not detect LAN IP — other devices may need your IP manually.')
}

allowFirewallPortWin32(PORT)

const env = {
  ...process.env,
  HOST: '0.0.0.0',
  DANGEROUSLY_DISABLE_HOST_CHECK: 'true',
  NODE_OPTIONS: process.env.NODE_OPTIONS || '--openssl-legacy-provider',
  DISABLE_ESLINT_PLUGIN: 'true',
  PORT,
}

if (lanIp) {
  env.WDS_SOCKET_HOST = lanIp
  env.WDS_SOCKET_PORT = PORT
}

const craco = path.join(__dirname, '..', 'node_modules', '.bin', 'craco')
const cmd = process.platform === 'win32' ? `${craco}.cmd` : craco

const child = spawn(cmd, ['start'], {
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  cwd: path.join(__dirname, '..'),
})

child.on('exit', (code) => process.exit(code ?? 0))
