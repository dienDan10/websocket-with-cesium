import { useStore } from '../store';
import { dispatch } from './dispatcher';

let _socket = null;
let _retryTimer = null;
let _shouldReconnect = true;

function clearRetryTimer() {
    if (_retryTimer) {
        clearTimeout(_retryTimer);
        _retryTimer = null;
    }
}

// khởi chạy một timer tự reconnect khi không kết nối được hoặc mất
// kết nối tới server
function scheduleReconnect(url) {
    if (!_shouldReconnect || _retryTimer) {
        return;
    }

    const delay = 3000 + Math.floor(Math.random() * 2000);

    _retryTimer = setTimeout(() => {
        _retryTimer = null;
        connectSocket(url);
    }, delay);
}

export function connectSocket(url) {
    if (_socket) {
        console.warn('Socket đã connect rồi');
        return;
    }

    // đặt lại cơ chế reconnect khi gọi connectSocket
    _shouldReconnect = true;
    clearRetryTimer();

    useStore.getState().setConnectionStatus('connecting');
    _socket = new WebSocket(url);

    _socket.onopen = () => {
        clearRetryTimer();
        useStore.getState().setConnectionStatus('connected');
    };

    _socket.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            dispatch(message);
        } catch (err) {
            console.error('Failed to parse message:', err);
        }
    };

    _socket.onerror = () => {
        useStore.getState().setConnectionStatus('error');
    };

    _socket.onclose = () => {
        useStore.getState().setConnectionStatus('disconnected');
        _socket = null;
        console.log('Socket disconnected');
        if (_shouldReconnect) {
            scheduleReconnect(url);
        }
    };
}

export function disconnectSocket() {
    _shouldReconnect = false;
    clearRetryTimer();

    if (_socket) {
        _socket.close();
        _socket = null;
    }
}

export function sendMessage(message) {
    if (_socket?.readyState === WebSocket.OPEN) {
        _socket.send(JSON.stringify(message));
    } else {
        console.warn('Socket chưa connect — không thể gửi message');
    }
}
