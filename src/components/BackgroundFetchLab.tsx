import React, { useState } from 'react';
import { BackgroundFetcher } from '../core/services/BackgroundFetcher';
import { LargeFileStreamer, StreamingProgress } from '../core/services/LargeFileStreamer';
import { ShieldCheck, Zap, Server, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface BackgroundFetchLabProps {
  onClose: () => void;
}

export const BackgroundFetchLab: React.FC<BackgroundFetchLabProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'non-async' | 'streaming-integrity'>('non-async');

  // Non-async state
  const [fetchMethod, setFetchMethod] = useState<'promise' | 'xhr' | 'worker'>('promise');
  const [nonAsyncLog, setNonAsyncLog] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  // Streaming integrity state
  const [progress, setProgress] = useState<StreamingProgress | null>(null);
  const [corruptSimulation, setCorruptSimulation] = useState(false);
  const [streamLog, setStreamLog] = useState<string[]>([]);

  const fetcher = new BackgroundFetcher();
  const streamer = new LargeFileStreamer();

  // Test Execution for Task 2.9 (1) - Non async/await
  const runNonAsyncTest = () => {
    setIsFetching(true);
    setNonAsyncLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Executing background fetch via ${fetchMethod.toUpperCase()} (NO async/await)...`]);

    const dummyUrl = 'https://jsonplaceholder.typicode.com/todos/1';

    if (fetchMethod === 'promise') {
      fetcher
        .fetchWithPromiseChain(dummyUrl)
        .then((res: any) => {
          setNonAsyncLog((prev) => [
            ...prev,
            `[SUCCESS] Promise chain resolved! Payload title: "${res.title || 'OK'}"`,
          ]);
        })
        .catch((err) => {
          setNonAsyncLog((prev) => [...prev, `[ERROR] Promise chain failed: ${err.message}`]);
        })
        .finally(() => {
          setIsFetching(false);
        });
    } else if (fetchMethod === 'xhr') {
      fetcher
        .fetchWithXHR(dummyUrl, (loaded, total) => {
          setNonAsyncLog((prev) => [
            ...prev,
            `[XHR PROGRESS] Loaded ${loaded} / ${total || 'unknown'} bytes`,
          ]);
        })
        .then((res: any) => {
          setNonAsyncLog((prev) => [
            ...prev,
            `[SUCCESS] XHR event listener resolved payload! Title: "${res.title || 'OK'}"`,
          ]);
        })
        .catch((err) => {
          setNonAsyncLog((prev) => [...prev, `[ERROR] XHR fetch failed: ${err.message}`]);
        })
        .finally(() => {
          setIsFetching(false);
        });
    } else if (fetchMethod === 'worker') {
      fetcher
        .fetchInWebWorker(dummyUrl)
        .then((res: any) => {
          setNonAsyncLog((prev) => [
            ...prev,
            `[SUCCESS] Web Worker background thread finished! Title: "${res.title || 'OK'}"`,
          ]);
        })
        .catch((err) => {
          setNonAsyncLog((prev) => [...prev, `[ERROR] Web worker fetch failed: ${err.message}`]);
        })
        .finally(() => {
          setIsFetching(false);
        });
    }
  };

  // Test Execution for Task 2.9 (2) - Large File Integrity & Anti-Corruption
  const runStreamingIntegrityTest = () => {
    setStreamLog([`[${new Date().toLocaleTimeString()}] Initializing Large File Chunk Stream Reader...`]);
    
    // Create mock JSON payload blob
    const samplePayload = JSON.stringify({
      status: 'success',
      dataset: 'HuggingFace High-Res Models Metadata Index',
      timestamp: Date.now(),
      modelsCount: 150000,
      verified: true,
    });

    const encoder = new TextEncoder();
    const originalBytes = encoder.encode(samplePayload);

    // Compute expected SHA256 checksum
    streamer.computeSHA256(originalBytes.buffer).then((expectedHash) => {
      setStreamLog((prev) => [
        ...prev,
        `Expected File Length: ${originalBytes.length} bytes`,
        `Expected SHA-256 Hash: ${expectedHash}`,
      ]);

      // If corrupt simulation is checked, tamper with expected hash or payload
      const testHash = corruptSimulation
        ? '0000000000000000000000000000000000000000000000000000000000000000'
        : expectedHash;

      const blob = new Blob([originalBytes], { type: 'application/json' });
      const blobUrl = URL.createObjectURL(blob);

      streamer
        .streamAndValidateJSON(blobUrl, testHash, (p) => {
          setProgress(p);
          setStreamLog((prev) => [
            ...prev,
            `[STREAM CHUNK] Status: ${p.status.toUpperCase()} | ${p.bytesLoaded} bytes (${p.percentage}%)`,
          ]);
        })
        .then((parsed: any) => {
          URL.revokeObjectURL(blobUrl);
          setStreamLog((prev) => [
            ...prev,
            `[VERIFICATION PASSED] JSON payload validated with 100% SHA-256 integrity!`,
            `Parsed Data: Dataset = "${parsed.dataset}"`,
          ]);
        })
        .catch((err) => {
          URL.revokeObjectURL(blobUrl);
          setStreamLog((prev) => [
            ...prev,
            `[CORRUPTION PREVENTED] Transfer rejected due to integrity failure: ${err.message}`,
          ]);
        });
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--spectrum-surface-elevated)',
          border: '1px solid var(--spectrum-border-color)',
          borderRadius: 'var(--spectrum-radius-lg)',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--spectrum-shadow-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--spectrum-border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap color="var(--spectrum-amber-400)" />
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
              Task 2.9 - Background Fetch & Integrity Verification Lab
            </h2>
          </div>
          <button
            className="spectrum-Button spectrum-Button--secondary"
            onClick={onClose}
            style={{ padding: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--spectrum-border-color)',
            backgroundColor: 'var(--spectrum-surface-layer)',
          }}
        >
          <button
            onClick={() => setActiveTab('non-async')}
            style={{
              flex: 1,
              padding: '12px 16px',
              fontWeight: 600,
              fontSize: '14px',
              border: 'none',
              background: activeTab === 'non-async' ? 'var(--spectrum-surface-elevated)' : 'transparent',
              color: activeTab === 'non-async' ? 'var(--spectrum-blue-400)' : 'var(--spectrum-text-secondary)',
              borderBottom: activeTab === 'non-async' ? '2px solid var(--spectrum-blue-400)' : 'none',
              cursor: 'pointer',
            }}
          >
            1. Fetch Without Async-Await
          </button>
          <button
            onClick={() => setActiveTab('streaming-integrity')}
            style={{
              flex: 1,
              padding: '12px 16px',
              fontWeight: 600,
              fontSize: '14px',
              border: 'none',
              background: activeTab === 'streaming-integrity' ? 'var(--spectrum-surface-elevated)' : 'transparent',
              color: activeTab === 'streaming-integrity' ? 'var(--spectrum-blue-400)' : 'var(--spectrum-text-secondary)',
              borderBottom: activeTab === 'streaming-integrity' ? '2px solid var(--spectrum-blue-400)' : 'none',
              cursor: 'pointer',
            }}
          >
            2. Large File Safety & Anti-Corruption
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'non-async' ? (
            <div>
              <p style={{ fontSize: '14px', color: 'var(--spectrum-text-secondary)', marginBottom: '16px' }}>
                <strong>Assessment Question:</strong> <em>"How will you solve this problem without using async-await?"</em>
                <br />
                <strong>Implementation:</strong> We use ES6 <code>Promise.then().catch()</code> chaining, classical <code>XMLHttpRequest</code> event listeners, or off-loading fetch execution to a dedicated background <code>Web Worker</code> thread.
              </p>

              {/* Controls */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <button
                  className={`spectrum-Button ${fetchMethod === 'promise' ? 'spectrum-Button--primary' : 'spectrum-Button--secondary'}`}
                  onClick={() => setFetchMethod('promise')}
                >
                  <Zap size={14} /> ES6 Promise Chain (.then)
                </button>
                <button
                  className={`spectrum-Button ${fetchMethod === 'xhr' ? 'spectrum-Button--primary' : 'spectrum-Button--secondary'}`}
                  onClick={() => setFetchMethod('xhr')}
                >
                  <Server size={14} /> XMLHttpRequest (XHR)
                </button>
                <button
                  className={`spectrum-Button ${fetchMethod === 'worker' ? 'spectrum-Button--primary' : 'spectrum-Button--secondary'}`}
                  onClick={() => setFetchMethod('worker')}
                >
                  <ShieldCheck size={14} /> Dedicated Web Worker
                </button>
              </div>

              <button
                className="spectrum-Button spectrum-Button--primary"
                onClick={runNonAsyncTest}
                disabled={isFetching}
                style={{ width: '100%', marginBottom: '20px' }}
              >
                {isFetching ? 'Executing Non-Async Request...' : `Trigger Background Fetch (${fetchMethod.toUpperCase()})`}
              </button>

              {/* Log Console */}
              <div
                style={{
                  backgroundColor: '#0d0d0d',
                  border: '1px solid var(--spectrum-border-color)',
                  borderRadius: 'var(--spectrum-radius-md)',
                  padding: '16px',
                  fontFamily: 'var(--spectrum-font-mono)',
                  fontSize: '12px',
                  color: '#4ade80',
                  minHeight: '180px',
                  maxHeight: '250px',
                  overflowY: 'auto',
                }}
              >
                {nonAsyncLog.length === 0 ? (
                  <span style={{ color: 'var(--spectrum-text-muted)' }}>Console output will appear here...</span>
                ) : (
                  nonAsyncLog.map((line, idx) => <div key={idx}>{line}</div>)
                )}
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '14px', color: 'var(--spectrum-text-secondary)', marginBottom: '16px' }}>
                <strong>Assessment Question:</strong> <em>"If the JSON file is large, how will you assure its safety and prevent corruption during download of file?"</em>
                <br />
                <strong>Implementation:</strong>
                <ol style={{ paddingLeft: '20px', marginTop: '6px' }}>
                  <li>Streamed chunk parsing using <code>ReadableStream</code> reader to prevent memory crashes.</li>
                  <li>Cryptographic SHA-256 byte digest computation (<code>crypto.subtle.digest</code>).</li>
                  <li>Strict <code>Content-Length</code> byte count verification before commit.</li>
                </ol>
              </p>

              {/* Simulation Options */}
              <div
                style={{
                  backgroundColor: 'var(--spectrum-surface-layer)',
                  padding: '14px',
                  borderRadius: 'var(--spectrum-radius-md)',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={corruptSimulation}
                    onChange={(e) => setCorruptSimulation(e.target.checked)}
                  />
                  Simulate Network Data Corruption / Tampered Checksum
                </label>
                {corruptSimulation ? (
                  <span style={{ color: 'var(--spectrum-red-400)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={14} /> Anti-Corruption Guard Activated
                  </span>
                ) : (
                  <span style={{ color: 'var(--spectrum-green-400)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> Integrity Verification Ready
                  </span>
                )}
              </div>

              <button
                className="spectrum-Button spectrum-Button--primary"
                onClick={runStreamingIntegrityTest}
                style={{ width: '100%', marginBottom: '20px' }}
              >
                Stream Large JSON & Verify SHA-256 Integrity
              </button>

              {/* Progress Bar */}
              {progress && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span>Status: {progress.status.toUpperCase()}</span>
                    <span>{progress.percentage}% ({progress.bytesLoaded} bytes)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--spectrum-surface-layer)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${progress.percentage}%`,
                        height: '100%',
                        backgroundColor: progress.status === 'corrupted' ? 'var(--spectrum-red-500)' : 'var(--spectrum-blue-500)',
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Stream Log Console */}
              <div
                style={{
                  backgroundColor: '#0d0d0d',
                  border: '1px solid var(--spectrum-border-color)',
                  borderRadius: 'var(--spectrum-radius-md)',
                  padding: '16px',
                  fontFamily: 'var(--spectrum-font-mono)',
                  fontSize: '12px',
                  color: progress?.status === 'corrupted' ? '#f87171' : '#38bdf8',
                  minHeight: '180px',
                  maxHeight: '250px',
                  overflowY: 'auto',
                }}
              >
                {streamLog.length === 0 ? (
                  <span style={{ color: 'var(--spectrum-text-muted)' }}>Streaming logs will appear here...</span>
                ) : (
                  streamLog.map((line, idx) => <div key={idx}>{line}</div>)
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
