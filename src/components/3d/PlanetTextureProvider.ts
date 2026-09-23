import * as THREE from 'three';

export type TextureLODLevel = 'DISTANT' | 'ORBITAL' | 'CLOSE';

export interface TextureLoadResult {
  texture: THREE.Texture;
  level: TextureLODLevel;
  width: number;
  height: number;
  isCached: boolean;
}

export interface PlanetTextureProvider {
  getTexture(level: TextureLODLevel): Promise<TextureLoadResult>;
  getDimensions(level: TextureLODLevel): { width: number; height: number } | null;
  dispose(): void;
}

export class AssetMapTextureProvider implements PlanetTextureProvider {
  private loader: THREE.TextureLoader;
  private cache: Map<string, THREE.Texture> = new Map();
  private pendingPromises: Map<string, Promise<TextureLoadResult>> = new Map();
  private dimensions: Map<string, { width: number; height: number }> = new Map();
  private maxAnisotropy: number;
  private failedUrls: Set<string> = new Set();

  constructor(
    private urls: {
      preview: string;
      color: string;
      high?: string | null;
    },
    gl?: THREE.WebGLRenderer
  ) {
    this.loader = new THREE.TextureLoader();
    this.maxAnisotropy = gl ? Math.min(16, gl.capabilities.getMaxAnisotropy()) : 8;
  }

  getDimensions(level: TextureLODLevel): { width: number; height: number } | null {
    const url = this.resolveUrl(level);
    return this.dimensions.get(url) || null;
  }

  private resolveUrl(level: TextureLODLevel): string {
    if (level === 'DISTANT') {
      return this.urls.preview || this.urls.color;
    } else if (level === 'CLOSE' && this.urls.high) {
      return this.urls.high;
    }
    return this.urls.color;
  }

  async getTexture(level: TextureLODLevel): Promise<TextureLoadResult> {
    const targetUrl = this.resolveUrl(level);

    // Return existing cached texture if ready
    if (this.cache.has(targetUrl)) {
      const texture = this.cache.get(targetUrl)!;
      const dims = this.dimensions.get(targetUrl) || {
        width: texture.image?.width || (level === 'CLOSE' ? 8192 : level === 'ORBITAL' ? 4096 : 1024),
        height: texture.image?.height || (level === 'CLOSE' ? 4096 : level === 'ORBITAL' ? 2048 : 512),
      };
      return {
        texture,
        level,
        width: dims.width,
        height: dims.height,
        isCached: true,
      };
    }

    // Deduplicate in-flight requests for the same URL
    if (this.pendingPromises.has(targetUrl)) {
      return this.pendingPromises.get(targetUrl)!;
    }

    // If previously failed, fallback immediately to base color map without thrashing
    if (this.failedUrls.has(targetUrl) && targetUrl !== this.urls.color) {
      return this.getTexture('ORBITAL');
    }

    const loadPromise = new Promise<TextureLoadResult>((resolve, reject) => {
      this.loader.load(
        targetUrl,
        (texture) => {
          this.prepareTexture(texture);
          const width = texture.image?.width || (level === 'CLOSE' ? 8192 : level === 'ORBITAL' ? 4096 : 1024);
          const height = texture.image?.height || (level === 'CLOSE' ? 4096 : level === 'ORBITAL' ? 2048 : 512);

          this.cache.set(targetUrl, texture);
          this.dimensions.set(targetUrl, { width, height });
          this.pendingPromises.delete(targetUrl);

          resolve({
            texture,
            level,
            width,
            height,
            isCached: false,
          });
        },
        undefined,
        (err) => {
          console.warn(`[AssetMapTextureProvider] Failed to load LOD texture: ${targetUrl}`, err);
          this.failedUrls.add(targetUrl);
          this.pendingPromises.delete(targetUrl);

          if (targetUrl !== this.urls.color) {
            // Gracefully fall back to standard color map
            this.getTexture('ORBITAL').then(resolve).catch(reject);
          } else {
            reject(err);
          }
        }
      );
    });

    this.pendingPromises.set(targetUrl, loadPromise);
    return loadPromise;
  }

  private prepareTexture(texture: THREE.Texture): void {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.maxAnisotropy;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
  }

  dispose(): void {
    this.cache.forEach((tex) => tex.dispose());
    this.cache.clear();
    this.pendingPromises.clear();
    this.dimensions.clear();
  }
}
