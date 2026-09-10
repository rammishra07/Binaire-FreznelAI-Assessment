/**
 * Singleton OOP NetworkMonitor class managing connection state.
 * Monitors window online/offline events and provides a manual override
 * toggle to simulate random network drops as required by the assessment.
 */
export class NetworkMonitor {
  private static _instance: NetworkMonitor | null = null;
  private _isBrowserOnline: boolean = navigator.onLine;
  private _isManualOfflineOverride: boolean = false;
  private _listeners: ((isOnline: boolean) => void)[] = [];

  private constructor() {
    window.addEventListener('online', () => {
      this._isBrowserOnline = true;
      this.notifyListeners();
    });

    window.addEventListener('offline', () => {
      this._isBrowserOnline = false;
      this.notifyListeners();
    });
  }

  public static getInstance(): NetworkMonitor {
    if (!NetworkMonitor._instance) {
      NetworkMonitor._instance = new NetworkMonitor();
    }
    return NetworkMonitor._instance;
  }

  /**
   * Returns true if network is active AND manual offline override is disabled.
   */
  public isOnline(): boolean {
    return this._isBrowserOnline && !this._isManualOfflineOverride;
  }

  /**
   * Returns whether manual offline override mode is currently enabled.
   */
  public isManualOfflineOverride(): boolean {
    return this._isManualOfflineOverride;
  }

  /**
   * Toggles or sets manual offline simulation mode.
   */
  public setManualOfflineOverride(override: boolean): void {
    this._isManualOfflineOverride = override;
    this.notifyListeners();
  }

  public toggleManualOfflineOverride(): void {
    this.setManualOfflineOverride(!this._isManualOfflineOverride);
  }

  public subscribe(callback: (isOnline: boolean) => void): () => void {
    this._listeners.push(callback);
    callback(this.isOnline());
    return () => {
      this._listeners = this._listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners(): void {
    const currentState = this.isOnline();
    this._listeners.forEach((cb) => cb(currentState));
  }
}
