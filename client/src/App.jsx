import { useEffect } from 'react';
import { initViewer } from './cesium/viewer.js';
import { connectSocket, sendMessage } from './socket/socket.js';
import { CONFIG } from './config.js';
import { handleEntityClear } from './cesium/handlers/entityHandler.js';

function App() {
    useEffect(() => {
        initViewer('cesiumContainer');
        connectSocket(CONFIG.WS_URL);
    }, []);

    const loadScenarioClick = () => {
        const message = {
            type: 'COMMAND.LOAD_SCENARIO',
        };

        sendMessage(message);
    };

    const startSimulationClick = () => {
        const message = {
            type: 'COMMAND.START_SIMULATION',
        };

        sendMessage(message);
    };

    const clearEntitiesClick = () => {
        handleEntityClear();
    };

    return (
        <div
            style={{
                position: 'relative',
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    zIndex: 1000,
                    display: 'flex',
                    gap: '20px',
                }}
            >
                <button onClick={loadScenarioClick}>Load Scenario</button>
                <button onClick={startSimulationClick}>Start Simulation</button>
                <button onClick={clearEntitiesClick}>Clear Entities</button>
            </div>
            <div
                id="cesiumContainer"
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
}

export default App;
