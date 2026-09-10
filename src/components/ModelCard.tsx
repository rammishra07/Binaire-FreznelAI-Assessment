import React from 'react';
import { ModelEntity } from '../core/models/ModelEntity';
import { Download, Heart, Layers, ShieldCheck, HardDrive, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

interface ModelCardProps {
  model: ModelEntity;
  onSelect?: (model: ModelEntity) => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({ model, onSelect }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="spectrum-Card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        minHeight: '260px',
      }}
    >
      <div>
        {/* Top Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '3px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(38, 128, 235, 0.15)',
              color: 'var(--spectrum-blue-400)',
              border: '1px solid rgba(38, 128, 235, 0.3)',
            }}
          >
            {model.pipelineTag}
          </span>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--spectrum-text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ShieldCheck size={13} color="var(--spectrum-green-400)" />
            Safetensors ({model.safetensorsCount})
          </span>
        </div>

        {/* Model Title & Author */}
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--spectrum-text-primary)',
            marginBottom: '4px',
            lineHeight: 1.3,
            wordBreak: 'break-word',
          }}
        >
          {model.name}
        </h3>
        <p
          style={{
            fontSize: '12px',
            color: 'var(--spectrum-text-secondary)',
            marginBottom: '12px',
          }}
        >
          By <strong style={{ color: 'var(--spectrum-text-primary)' }}>{model.author}</strong> &bull; {model.family.toUpperCase()} Family
        </p>

        {/* Description */}
        <p
          style={{
            fontSize: '13px',
            color: 'var(--spectrum-text-secondary)',
            lineHeight: 1.4,
            marginBottom: '16px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {model.description}
        </p>

        {/* Technical Specs Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          <span className="spectrum-Tag">
            <Layers size={11} /> {model.architecture}
          </span>
          {model.weightTags.map((weight) => (
            <span key={weight} className="spectrum-Tag">
              <HardDrive size={11} /> {weight}
            </span>
          ))}
          <span className="spectrum-Tag">
            <Hash size={11} /> {model.safetensorsCount} Safetensors
          </span>
        </div>
      </div>

      {/* Footer Metrics & Selection */}
      <div
        style={{
          borderTop: '1px solid var(--spectrum-border-color)',
          paddingTop: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: 'var(--spectrum-text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Download size={13} /> {model.getFormattedDownloads()}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Heart size={13} color="var(--spectrum-red-400)" /> {model.likes}
          </span>
          <span>{model.getFormattedSize()}</span>
        </div>

        <button
          className="spectrum-Button spectrum-Button--primary"
          onClick={() => onSelect && onSelect(model)}
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          Select Model
        </button>
      </div>
    </motion.div>
  );
};
