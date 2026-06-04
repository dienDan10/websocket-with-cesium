import { useStore } from '../store';
import { dispatch } from './dispatcher';

let _socket = null;

export function connectSocket(url) {
    if (_socket) {
        console.warn('Socket đã connect rồi');
        return;
    }

    useStore.getState().setConnectionStatus('connecting');

    _socket = new WebSocket(url);

    _socket.onopen = () => {
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
    };
}

export function disconnectSocket() {
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
