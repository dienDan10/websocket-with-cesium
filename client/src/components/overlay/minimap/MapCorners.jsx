import React from 'react';

export default function MapCorners() {
    return (
        <>
            {[
                ['top', '-4px', 'left', '-4px'],
                ['top', '-4px', 'right', '-4px'],
                ['bottom', '-4px', 'left', '-4px'],
                ['bottom', '-4px', 'right', '-4px'],
            ].map(([v, vv, h, hh], i) => (
                <React.Fragment key={i}>
                    <div
                        style={{
                            position: 'absolute',
                            [v]: vv,
                            [h]: hh,
                            width: 12,
                            height: 4,
                            background: 'rgba(100,180,255,0.8)',
                            zIndex: 3,
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            [v]: vv,
                            [h]: hh,
                            width: 4,
                            height: 12,
                            background: 'rgba(100,180,255,0.8)',
                            zIndex: 3,
                        }}
                    />
                </React.Fragment>
            ))}
        </>
    );
}
