declare module "vanta/dist/vanta.clouds2.min" {
  type VantaConfig = {
    el: HTMLElement;
    THREE: unknown;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    speed?: number;
    skyColor?: number;
    cloudColor?: number;
    cloudShadowColor?: number;
    sunlightColor?: number;
    texturePath?: string;
  };

  type VantaInstance = {
    destroy: () => void;
  };

  const CLOUDS2: (config: VantaConfig) => VantaInstance;
  export default CLOUDS2;
}
