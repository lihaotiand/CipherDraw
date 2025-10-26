import { ConnectButton } from '@rainbow-me/rainbowkit';
import '../styles/Header.css';

interface HeaderProps {
  currentRoundId: number;
  drawnRounds: number;
  isOwner: boolean;
}

export function Header({ currentRoundId, drawnRounds, isOwner }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <div>
            <h1 className="header-title">CipherDraw Lottery</h1>
            <p className="header-subtitle">
              Pick two numbers, keep them encrypted, and let the chain decide the winners. Each perfect match grants you
              fully homomorphic reward points only you can decrypt.
            </p>
          </div>
          <ConnectButton />
        </div>

        <div className="header-stats">
          <div className="header-stat-card">
            <div className="header-stat-label">Active Round</div>
            <div className="header-stat-value">#{currentRoundId}</div>
          </div>
          <div className="header-stat-card">
            <div className="header-stat-label">Completed Rounds</div>
            <div className="header-stat-value">{drawnRounds}</div>
          </div>
          <div className="header-stat-card">
            <div className="header-stat-label">Role</div>
            <div className="header-stat-value">{isOwner ? 'Admin' : 'Player'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
