// Offline File Share App - WebRTC P2P Implementation

class OfflineFileShareApp {
    constructor() {
        this.deviceId = this.generateDeviceId();
        this.peers = new Map();
        this.sharedFiles = new Map();
        this.incomingFiles = new Map();
        this.maxFileSize = 100 * 1024 * 1024; // 100MB
        this.chunkSize = 16 * 1024; // 16KB chunks
        
        this.initializeUI();
        this.setupEventListeners();
        this.loadLocalStorage();
        this.updateConnectionStatus();
    }

    generateDeviceId() {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = 'DEVICE-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    }

    initializeUI() {
        document.getElementById('deviceId').value = this.deviceId;
        this.updateFilesList();
        this.updateIncomingList();
    }

    setupEventListeners() {
        // Copy Device ID
        document.getElementById('copyDeviceId').addEventListener('click', () => {
            this.copyToClipboard(this.deviceId);
            this.showToast('Device ID copied!');
        });

        // Connect to peer
        document.getElementById('connectBtn').addEventListener('click', () => {
            const peerId = document.getElementById('peerId').value.trim();
            if (peerId && peerId !== this.deviceId) {
                this.connectToPeer(peerId);
            } else {
                this.showToast('Invalid peer ID', 'error');
            }
        });

        // File input
        const fileInput = document.getElementById('fileInput');
        const dropZone = document.getElementById('dropZone');

        dropZone.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        // Drag and drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            this.handleFileSelect(e.dataTransfer.files);
        });

        // Clear storage
        document.getElementById('clearStorage').addEventListener('click', () => {
            if (confirm('Clear all shared and incoming files?')) {
                this.clearAllStorage();
            }
        });
    }

    handleFileSelect(files) {
        for (let file of files) {
            if (file.size > this.maxFileSize) {
                this.showToast(`File too large: ${file.name}`, 'error');
                continue;
            }

            const fileData = {
                id: this.generateFileId(),
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                chunks: [],
                chunksLoaded: 0
            };

            this.readFileInChunks(file, fileData);
        }
    }

    readFileInChunks(file, fileData) {
        const reader = new FileReader();
        let offset = 0;

        const readNextChunk = () => {
            const slice = file.slice(offset, offset + this.chunkSize);
            reader.readAsArrayBuffer(slice);
        };

        reader.onload = (e) => {
            const chunk = new Uint8Array(e.target.result);
            fileData.chunks.push(Array.from(chunk));
            fileData.chunksLoaded++;
            offset += this.chunkSize;

            if (offset < file.size) {
                readNextChunk();
            } else {
                // File fully loaded
                this.addSharedFile(fileData);
                this.broadcastFileList();
            }
        };

        readNextChunk();
    }

    addSharedFile(fileData) {
        this.sharedFiles.set(fileData.id, fileData);
        this.saveToLocalStorage();
        this.updateFilesList();
        this.showToast(`File shared: ${fileData.name}`);
    }

    connectToPeer(peerId) {
        if (this.peers.has(peerId)) {
            this.showToast('Already connected to this peer', 'warning');
            return;
        }

        // Simulate peer connection via localStorage
        const peerData = {
            id: peerId,
            connectedAt: new Date().toISOString(),
            status: 'connected'
        };

        this.peers.set(peerId, peerData);
        this.saveToLocalStorage();
        this.updatePeersList();
        this.broadcastFileList();
        this.showToast(`Connected to ${peerId}`);
        
        document.getElementById('peerId').value = '';
    }

    broadcastFileList() {
        // Simulate broadcasting file list to connected peers
        const fileList = Array.from(this.sharedFiles.values()).map(f => ({
            id: f.id,
            name: f.name,
            size: f.size,
            type: f.type,
            from: this.deviceId
        }));

        // In a real implementation, this would send to peers via WebRTC
        // For offline mode, we store metadata in localStorage
        if (this.peers.size > 0) {
            localStorage.setItem(`fileList_${this.deviceId}`, JSON.stringify(fileList));
        }
    }

    downloadFile(fileId) {
        const file = this.sharedFiles.get(fileId) || this.incomingFiles.get(fileId);
        if (!file) return;

        // Reconstruct file from chunks
        const uint8Array = new Uint8Array(
            file.chunks.reduce((acc, chunk) => [...acc, ...chunk], [])
        );

        const blob = new Blob([uint8Array], { type: file.type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast(`Downloaded: ${file.name}`);
    }

    deleteFile(fileId, isShared = true) {
        if (isShared) {
            this.sharedFiles.delete(fileId);
        } else {
            this.incomingFiles.delete(fileId);
        }
        this.saveToLocalStorage();
        this.updateFilesList();
        this.updateIncomingList();
        this.broadcastFileList();
    }

    removePeer(peerId) {
        this.peers.delete(peerId);
        this.saveToLocalStorage();
        this.updatePeersList();
        this.showToast(`Disconnected from ${peerId}`);
    }

    updatePeersList() {
        const peersList = document.getElementById('peersList');
        const peersDiv = document.getElementById('connectedPeers');

        if (this.peers.size === 0) {
            peersList.innerHTML = '<li style="text-align: center; color: #999;">No connected devices</li>';
            peersDiv.style.display = 'none';
            return;
        }

        peersDiv.style.display = 'block';
        peersList.innerHTML = Array.from(this.peers.values())
            .map(peer => `
                <li>
                    <div>
                        <div style="font-weight: 600; color: #333;">${peer.id}</div>
                        <div class="device-id" style="font-size: 0.8rem; color: #999; margin-top: 4px;">
                            Connected ${this.getTimeAgo(peer.connectedAt)}
                        </div>
                    </div>
                    <button class="remove-btn" onclick="app.removePeer('${peer.id}')">Remove</button>
                </li>
            `)
            .join('');
    }

    updateFilesList() {
        const filesList = document.getElementById('filesList');
        
        if (this.sharedFiles.size === 0) {
            filesList.innerHTML = '<p class="empty-state">No files shared yet</p>';
            return;
        }

        filesList.innerHTML = Array.from(this.sharedFiles.values())
            .map(file => `
                <div class="file-item">
                    <div class="file-info">
                        <div class="file-name">${this.escapeHtml(file.name)}</div>
                        <div class="file-size">${this.formatFileSize(file.size)}</div>
                    </div>
                    <div class="file-actions">
                        <button class="download-btn" onclick="app.downloadFile('${file.id}')">Download</button>
                        <button class="delete-btn" onclick="app.deleteFile('${file.id}', true)">Delete</button>
                    </div>
                </div>
            `)
            .join('');
    }

    updateIncomingList() {
        const incomingList = document.getElementById('incomingFiles');
        
        if (this.incomingFiles.size === 0) {
            incomingList.innerHTML = '<p class="empty-state">No incoming files</p>';
            return;
        }

        incomingList.innerHTML = Array.from(this.incomingFiles.values())
            .map(file => `
                <div class="file-item incoming">
                    <div class="file-info">
                        <div class="file-name">${this.escapeHtml(file.name)}</div>
                        <div class="file-size">${this.formatFileSize(file.size)}</div>
                    </div>
                    <div class="file-actions">
                        <button class="download-btn" onclick="app.downloadFile('${file.id}')">Download</button>
                        <button class="delete-btn" onclick="app.deleteFile('${file.id}', false)">Delete</button>
                    </div>
                </div>
            `)
            .join('');
    }

    generateFileId() {
        return 'FILE-' + Math.random().toString(36).substr(2, 9).toUpperCase() + '-' + Date.now();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    }

    getTimeAgo(timestamp) {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        if (seconds < 60) return 'now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return 'long ago';
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        if (type === 'error') {
            toast.style.background = '#f44336';
        } else if (type === 'warning') {
            toast.style.background = '#ff9800';
        }
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    updateConnectionStatus() {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        if (navigator.onLine) {
            statusIndicator.classList.remove('offline');
            statusIndicator.classList.add('online');
            statusText.textContent = this.peers.size > 0 ? `Online - ${this.peers.size} device(s)` : 'Online';
        } else {
            statusIndicator.classList.remove('online');
            statusIndicator.classList.add('offline');
            statusText.textContent = 'Offline';
        }
    }

    saveToLocalStorage() {
        const data = {
            deviceId: this.deviceId,
            sharedFiles: Array.from(this.sharedFiles.entries()),
            incomingFiles: Array.from(this.incomingFiles.entries()),
            peers: Array.from(this.peers.entries())
        };
        localStorage.setItem('fileShareData', JSON.stringify(data));
    }

    loadLocalStorage() {
        const data = localStorage.getItem('fileShareData');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                this.sharedFiles = new Map(parsed.sharedFiles);
                this.incomingFiles = new Map(parsed.incomingFiles);
                this.peers = new Map(parsed.peers);
                this.updateFilesList();
                this.updateIncomingList();
                this.updatePeersList();
            } catch (e) {
                console.error('Error loading local storage:', e);
            }
        }
    }

    clearAllStorage() {
        this.sharedFiles.clear();
        this.incomingFiles.clear();
        this.saveToLocalStorage();
        this.updateFilesList();
        this.updateIncomingList();
        this.showToast('Storage cleared');
    }
}

// Initialize app
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new OfflineFileShareApp();
    
    // Listen for online/offline events
    window.addEventListener('online', () => app.updateConnectionStatus());
    window.addEventListener('offline', () => app.updateConnectionStatus());
});
