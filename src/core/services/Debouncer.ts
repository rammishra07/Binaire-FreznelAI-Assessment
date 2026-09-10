/**
 * OOP Debouncer utility class.
 * Delays function execution until after specified delay ms have elapsed
 * since the last time it was invoked.
 */
export class Debouncer<T extends (...args: any[]) => any> {
  private _timer: ReturnType<typeof setTimeout> | null = null;
  private readonly _delay: number;
  private readonly _callback: T;

  constructor(callback: T, delayMs: number) {
    this._callback = callback;
    this._delay = delayMs;
  }

  public execute(...args: Parameters<T>): void {
    if (this._timer !== null) {
      clearTimeout(this._timer);
    }
    this._timer = setTimeout(() => {
      this._callback(...args);
      this._timer = null;
    }, this._delay);
  }

  public cancel(): void {
    if (this._timer !== null) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }
}
