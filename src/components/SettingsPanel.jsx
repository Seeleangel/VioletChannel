'use client';

import React from 'react';
import { Settings, Sliders, Maximize, FileDigit } from 'lucide-react';

const SettingsPanel = ({ settings, updateSettings, disabled }) => {
    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                <Settings size={20} style={{ color: 'var(--color-primary)' }} />
                <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Compression Settings</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                {/* Quality Slider */}
                <div>
                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                        <span>Quality</span>
                        <span style={{ color: 'var(--color-primary)' }}>{Math.round(settings.quality * 100)}%</span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Sliders size={16} color="var(--color-text-secondary)" />
                        <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.05"
                            value={settings.quality}
                            onChange={(e) => updateSettings('quality', parseFloat(e.target.value))}
                            disabled={disabled}
                            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                        />
                    </div>
                </div>

                {/* Max Width */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                        Max Width (px)
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Maximize size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                        <input
                            type="number"
                            value={settings.maxWidthOrHeight}
                            onChange={(e) => updateSettings('maxWidthOrHeight', parseInt(e.target.value) || 1920)}
                            disabled={disabled}
                            style={{
                                width: '100%',
                                padding: '0.5rem 1rem 0.5rem 2.5rem',
                                borderRadius: 'var(--radius-md)',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--glass-border)',
                                color: 'white',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                        Maintains aspect ratio
                    </p>
                </div>

                {/* Max Size */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                        Max Size (MB)
                    </label>
                    <div style={{ position: 'relative' }}>
                        <FileDigit size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                        <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={settings.maxSizeMB}
                            onChange={(e) => updateSettings('maxSizeMB', parseFloat(e.target.value) || 1)}
                            disabled={disabled}
                            style={{
                                width: '100%',
                                padding: '0.5rem 1rem 0.5rem 2.5rem',
                                borderRadius: 'var(--radius-md)',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--glass-border)',
                                color: 'white',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                        Target compression size
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
