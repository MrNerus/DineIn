import { Injectable } from "@angular/core";

export interface AppConfig {
  backend_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private config!: AppConfig;

  async loadConfig(): Promise<void> {
    const response = await fetch('assets/data/config.json');

    if (!response.ok) {
      throw new Error('Failed to load config.json');
    }

    this.config = await response.json();
  }

  get backend_url(): string {
    return (this.config?.backend_url || '').replace(/\/+$/, '');
  }

  apiUrl(endpoint: string): string {
    const base = this.backend_url;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return base ? `${base}/${cleanEndpoint}` : `/${cleanEndpoint}`;
  }
}