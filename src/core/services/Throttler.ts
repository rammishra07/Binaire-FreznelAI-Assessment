/**
 * OOP Throttler utility class.
 * Enforces that a function is called at most once per specified limit ms window.
 */
export class Throttler<T extends (...args: any[]) => any> {
  private _lastRunTime: number = 0;
  private readonly _limitMs: number;
  private readonly _callback: T;

  constructor(callback: T, limitMs: number) {
    this._callback = callback;
    this._limitMs = limitMs;
  }

  public execute(...args: Parameters<T>): void {
    const now = Date.now();
    if (now - this._lastRunTime >= this._limitMs) {
      this._lastRunTime = now;
      this._callback(...args);
    }
  }

  public reset(): void {
    this._lastRunTime = 0;
  }
}
