/**
 * OOP BackgroundFetcher Service
 * Addresses Task 2.9 (1): "how will you solve this problem without using async-await?"
 * 
 * Solutions implemented:
 * 1. ES6 Promise Chaining (.then / .catch / .finally)
 * 2. XMLHttpRequest (XHR) with event handler callbacks
 * 3. Dedicated Web Worker event dispatching
 */
export class BackgroundFetcher {
  /**
   * Method 1: Promise Chaining without async-await
   */
  public fetchWithPromiseChain<T>(url: string): Promise<T> {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data: T) => {
          resolve(data);
        })
        .catch((error: Error) => {
          console.error('Background fetch (Promise chain) failed:', error);
          reject(error);
        });
    });
  }

  /**
   * Method 2: Classical XMLHttpRequest with progress & state callbacks (No async/await)
   */
  public fetchWithXHR<T>(
    url: string,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'json';

      xhr.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(event.loaded, event.total);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response as T);
        } else {
          reject(new Error(`XHR HTTP Error ${xhr.status}: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during background XHR fetch'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Background fetch timed out'));
      };

      xhr.send();
    });
  }

  /**
   * Method 3: Web Worker Background Fetching (No async/await on main thread)
   */
  public fetchInWebWorker<T>(url: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const workerCode = `
        self.onmessage = function(e) {
          var targetUrl = e.data.url;
          fetch(targetUrl)
            .then(function(res) { return res.json(); })
            .then(function(data) { self.postMessage({ success: true, data: data }); })
            .catch(function(err) { self.postMessage({ success: false, error: err.message }); });
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);

      worker.onmessage = (event) => {
        const { success, data, error } = event.data;
        worker.terminate();
        URL.revokeObjectURL(workerUrl);

        if (success) {
          resolve(data as T);
        } else {
          reject(new Error(error));
        }
      };

      worker.onerror = (err) => {
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
        reject(new Error(`Worker error: ${err.message}`));
      };

      worker.postMessage({ url });
    });
  }
}
