
import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from '@mui/icons-material';

const AuditStatsCard = ({ title, value, trend, icon, color = 'primary' }) => {
    const colorClasses = {
        primary: 'bg-blue-50 border-blue-100 text-blue-700',
        success: 'bg-green-50 border-green-100 text-green-700',
        warning: 'bg-yellow-50 border-yellow-100 text-yellow-700',
        danger: 'bg-red-50 border-red-100 text-red-700',
    };

    return (
        <div className={`audit-stat-card ${colorClasses[color]}`} style={{
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid',
            transition: 'all var(--transition-normal)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px'
                }}>
                    {icon}
                </div>
                <div>
                    <h4 style={{ margin: 0, fontSize: '14px', color: 'inherit' }}>{title}</h4>
                    <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '4px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{value}</span>
                        {trend && (
                            <span style={{
                                marginLeft: '8px',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                color: trend > 0 ? 'var(--success)' : 'var(--danger)'
                            }}>
                                {trend > 0 ? <TrendingUp /> : <TrendingDown />}
                                {Math.abs(trend)}%
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditStatsCard;