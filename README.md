# 📁 Offline File Share

A simple peer-to-peer file sharing application that works entirely offline using HTML, CSS, and JavaScript. Share files between devices on the same network without any server or external dependencies.

## Features

✨ **Key Features:**
- 📱 **Peer-to-Peer Transfer** - Share files directly between devices
- 🔄 **Synchronization** - Automatic sync of file lists across connected devices
- 💾 **Local Storage** - Files persist in browser storage for offline access
- 🎨 **Modern UI** - Clean, responsive design that works on all devices
- 🔒 **No Server Required** - Everything runs locally in the browser
- 📦 **Large Files** - Support for files up to 100MB each
- 🔐 **Privacy** - All transfers are local, no data leaves your devices

## How It Works

### Connection Flow
1. Each device gets a unique Device ID (e.g., `DEVICE-ABC123DEF`)
2. Share your Device ID with another device
3. Enter their Device ID to connect
4. Connected devices can now see and download each other's files

### File Sharing
1. **Upload Files**: Drag and drop files or click to browse
2. **Share**: Files are stored in the browser and made available to connected peers
3. **Download**: Connected devices can download your shared files
4. **Persist**: Files remain available even if you refresh the page

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No installation or server setup required

### Usage

1. **Open the app** in your web browser:
   - Open `index.html` locally or deploy it to a web server

2. **Get your Device ID**:
   - Your unique Device ID is shown in the "Connection" panel
   - Click "Copy ID" to copy it to clipboard

3. **Connect to another device**:
   - Get the Device ID from the other device
   - Paste it in the "Enter peer device ID" field
   - Click "Connect"

4. **Share Files**:
   - Drag files into the drop zone or click to browse
   - Files will appear in the "Shared Files" panel
   - Connected devices will see your files

5. **Receive Files**:
   - Files from connected devices appear in "Incoming Files"
   - Click "Download" to save them to your device

## Technical Architecture

### File Structure
```
offline-file-share/
├── index.html          # Main HTML structure
├── styles.css          # Styling and animations
├── app.js              # Core application logic
└── README.md           # This file
```

### How Synchronization Works

The app uses **localStorage** for offline persistence:
- Each device maintains a local copy of shared files
- File metadata is shared through localStorage keys
- File chunks are stored for efficient transfer
- Connected peers sync metadata automatically

### File Transfer Process

1. **File Upload**:
   - File is read in 16KB chunks
   - Chunks are stored in memory and localStorage
   - File metadata is broadcast to connected peers

2. **File Download**:
   - Chunks are reconstructed into the original file
   - File is downloaded to your device
   - Transfer can be paused/resumed

## Limitations & Future Enhancements

### Current Limitations
- Requires manual Device ID exchange (no automatic discovery)
- Files stored in browser memory (limited by available RAM)
- No encryption (consider adding in production)
- Single-browser limited (files not shared with other browsers on same device)

### Planned Features
- 🔐 End-to-end encryption
- 🌐 Local network discovery (mDNS)
- 📊 Transfer progress tracking
- 🔗 WebRTC support for better P2P performance
- 🔄 Automatic resumable transfers
- 📱 Progressive Web App (PWA)
- 🎯 File categories and filtering

## Storage Limits

| Item | Limit |
|------|-------|
| Single File | 100 MB |
| Total Storage | ~50 MB (varies by browser) |
| Session Duration | Unlimited (until browser cache clear) |

## Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome/Edge | ✅ Fully Supported |
| Firefox | ✅ Fully Supported |
| Safari | ✅ Fully Supported |
| Opera | ✅ Fully Supported |
| IE 11 | ❌ Not Supported |

## Security Considerations

- ⚠️ Files are stored in browser localStorage
- ⚠️ Device ID is not encrypted
- ⚠️ No user authentication
- ✅ No data sent to external servers
- ✅ All transfers are local only

**For sensitive files**: Add encryption before uploading or use in a private network only.

## Development

### Running Locally
```bash
# Option 1: Open directly in browser
open index.html

# Option 2: Using Python
python -m http.server 8000
# Then visit http://localhost:8000

# Option 3: Using Node.js
npx http-server
```

### Debugging
- Open DevTools (F12 or Cmd+Option+I)
- Check Console for errors
- Inspect localStorage: `localStorage.getItem('fileShareData')`
- Check connected peers: `app.peers`
- View shared files: `app.sharedFiles`

## API Reference

### Main Class: `OfflineFileShareApp`

#### Methods
- `connectToPeer(peerId)` - Connect to another device
- `handleFileSelect(files)` - Process selected files
- `downloadFile(fileId)` - Download a shared file
- `deleteFile(fileId, isShared)` - Delete a file
- `removePeer(peerId)` - Disconnect from a device
- `broadcastFileList()` - Sync file list to peers

#### Properties
- `deviceId` - Unique identifier for this device
- `peers` - Map of connected peers
- `sharedFiles` - Map of files shared by this device
- `incomingFiles` - Map of files from other devices

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for any purpose.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ for offline file sharing**
