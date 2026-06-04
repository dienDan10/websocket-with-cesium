import { useEffect } from 'react';
import { initViewer } from './cesium/viewer.js';
import { connectSocket } from './socket/socket.js';
import { CONFIG } from './config.js';

function App() {
    useEffect(() => {
        initViewer('cesiumContainer');
        connectSocket(CONFIG.WS_URL);
    }, []);
    return (
        <div id="cesiumContainer" style={{ width: '100%', height: '100vh' }} />
    );
}

export default App;
