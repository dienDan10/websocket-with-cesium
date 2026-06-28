export default function Direction() {
    return (
        <>
            <div
                style={{
                    position: 'absolute',
                    top: -15,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: 16,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                    pointerEvents: 'none',
                    zIndex: 4,
                    lineHeight: 1,
                }}
            >
                N
            </div>
            <div
                style={{
                    position: 'absolute',
                    bottom: -15,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: 16,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                    pointerEvents: 'none',
                    zIndex: 4,
                    lineHeight: 1,
                }}
            >
                S
            </div>
            <div
                style={{
                    position: 'absolute',
                    left: -15,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: 16,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                    pointerEvents: 'none',
                    zIndex: 4,
                    lineHeight: 1,
                }}
            >
                W
            </div>
            <div
                style={{
                    position: 'absolute',
                    right: -15,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: 16,
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                    pointerEvents: 'none',
                    zIndex: 4,
                    lineHeight: 1,
                }}
            >
                E
            </div>
        </>
    );
}
