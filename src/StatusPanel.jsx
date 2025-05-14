import React from 'react';
import './StatusPanel.css';

function getCarbonColor(value) {
    if (value < 30) return '#22c55e';   // 초록
    if (value < 70) return '#facc15';   // 노랑
    return '#ef4444';                   // 빨강
}

function getHappinessColor(value) {
    if (value < 3) return '#ef4444';    // 빨강
    if (value < 7) return '#60a5fa';    // 중간 파랑
    return '#3b82f6';                   // 진한 파랑
}

function getBudgetColor(value) {
    if (value < 3) return '#d4a373';    // 주황/갈색
    if (value < 7) return '#facc15';    // 노랑
    return '#84cc16';                   // 연녹색
}

function StatusBar({ label, value, max, getColor, icon, delta }) {
    const displayValue = Math.max(0, Math.min(value, max)); // 0~max 사이로 보정
    const ratio = displayValue / max;
    const color = getColor(displayValue);

    return (
        <div className="status-item">
            <div className="status-label">{icon} {label}</div>

            <div className="status-bar-track">
                <div
                    className="status-bar-fill"
                    style={{
                        width: `${ratio * 100}%`,
                        backgroundColor: color
                    }}
                ></div>
            </div>

            <div className="status-value">
                {icon} {value} / {max}
                {delta !== 0 && (
                    <span className="status-delta" style={{ color: delta > 0 ? '#22c55e' : '#ef4444' }}>
                        {delta > 0 ? `+${delta}` : delta}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function StatusPanel({ carbon, happiness, budget, delta, researchYesCards }) {
    return (
        <div className="status-panel">
            <h3>📊 상태창</h3>
            <StatusBar
                label="탄소량"
                value={carbon}
                max={100}
                getColor={getCarbonColor}
                icon="🔥"
                delta={delta?.carbon || 0}
            />
            <StatusBar
                label="예산"
                value={budget}
                max={10}
                getColor={getBudgetColor}
                icon="💰"
                delta={delta?.budget || 0}
            />
            <StatusBar
                label="행복도"
                value={happiness}
                max={10}
                getColor={getHappinessColor}
                icon="😊"
                delta={delta?.happiness || 0}
            />

            {/* ✅ 연구카드 상태 표시 */}
            <div style={{
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255,255,255,0.2)',
                fontSize: '15px',
                textAlign: 'center',
                fontWeight: '600',
                color: researchYesCards.length < 3 ? '#ff9800' : '#4caf50',
                animation: researchYesCards.length === 3 ? 'pulseGlow 1.2s infinite' : 'none',
            }}>
                {researchYesCards.length < 3
                    ? `🔬 연구 카드 ${researchYesCards.length} / 3`
                    : '✅ 연구 효과 발동 완료!'}
            </div>

            {/* ✅ 리스트 출력 */}
            {researchYesCards.length > 0 && (
                <ul style={{
                    listStyle: 'disc',
                    paddingLeft: '20px',
                    marginTop: '10px',
                    fontSize: '13px',
                    color: '#ffcc80',
                    textAlign: 'left'
                }}>
                    {researchYesCards.map((card, idx) => (
                        <li key={idx}>{card.title}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}