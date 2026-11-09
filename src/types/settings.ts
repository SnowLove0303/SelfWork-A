export type BackgroundScope = 'window' | 'stage';
export type BackgroundType = 'fluid' | 'image_upload' | 'image_url';

export interface AppearanceSettings {
  scope: BackgroundScope;
  type: BackgroundType;
  imageUrl: string;
  opacity: number;        // 0.0 ~ 1.0 (画板透明度)
  blur: number;           // 0 ~ 40 (高斯模糊 px)
  overlayDarkness: number;// 0.0 ~ 0.8 (深色防眩遮罩暗度)
}

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  scope: 'stage',
  type: 'fluid',
  imageUrl: '',
  opacity: 0.35,
  blur: 24,
  overlayDarkness: 0.30,
};
