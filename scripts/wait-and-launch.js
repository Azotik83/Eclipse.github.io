// Script pour attendre que Vite soit prêt puis lancer Electron
import { spawn } from 'child_process'

const VITE_URL = 'http://localhost:5173'
const MAX_RETRIES = 30
const RETRY_DELAY = 1000

async function checkServer(url) {
    try {
        const response = await fetch(url)
        return response.ok
    } catch {
        return false
    }
}

async function waitForServer() {
    console.log('⏳ Attente du serveur Vite...')

    for (let i = 0; i < MAX_RETRIES; i++) {
        if (await checkServer(VITE_URL)) {
            console.log('✅ Serveur Vite prêt!')
            return true
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
    }

    console.error('❌ Timeout: le serveur Vite n\'a pas démarré')
    return false
}

async function main() {
    const isReady = await waitForServer()

    if (isReady) {
        console.log('🚀 Lancement d\'Electron...')

        // Définir l'environnement de développement
        const electronProcess = spawn('electron', ['.'], {
            stdio: 'inherit',
            shell: true,
            env: {
                ...process.env,
                NODE_ENV: 'development'
            }
        })

        electronProcess.on('close', (code) => {
            process.exit(code)
        })
    } else {
        process.exit(1)
    }
}

main()
