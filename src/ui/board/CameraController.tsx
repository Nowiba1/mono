import React, { useEffect, useState } from 'react';

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  tilt: number; // 0..35 deg
}

export type CameraMode = 'follow' | 'manual' | 'fixed';

interface CameraControllerProps {
  boardSizePx: number;
  cameraMode: CameraMode;
  targetFocusLogical?: { x: number; y: number } | null;
  tiltEnabled: boolean;
  children: (props: {
    camera: CameraState;
    containerProps: React.HTMLAttributes<HTMLDivElement>;
    recenter: () => void;
  }) => React.ReactNode;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  tiltEnabled,
  children,
}) => {
  // Steady, clean 1.0x view without zoom/unzoom complexity
  const [camera, setCamera] = useState<CameraState>({
    x: 0,
    y: 0,
    zoom: 1.0,
    tilt: tiltEnabled ? 18 : 0,
  });

  useEffect(() => {
    setCamera((prev) => ({ ...prev, tilt: tiltEnabled ? 18 : 0 }));
  }, [tiltEnabled]);

  const recenter = () => {
    setCamera({ x: 0, y: 0, zoom: 1.0, tilt: tiltEnabled ? 18 : 0 });
  };

  return (
    <>
      {children({
        camera,
        containerProps: {},
        recenter,
      })}
    </>
  );
};
