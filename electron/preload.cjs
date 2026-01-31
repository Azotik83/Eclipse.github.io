const { contextBridge, ipcRenderer } = require('electron')

// Exposer l'API sécurisée au renderer
contextBridge.exposeInMainWorld('electronAPI', {
    // Contrôles de fenêtre
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    maximizeWindow: () => ipcRenderer.send('maximize-window'),
    closeWindow: () => ipcRenderer.send('close-window'),
    isMaximized: () => ipcRenderer.invoke('is-maximized'),

    // Informations système
    platform: process.platform,

    // Indicateur qu'on est dans Electron
    isElectron: true
})

console.log('🌙 Eclipse - Preload script chargé')
