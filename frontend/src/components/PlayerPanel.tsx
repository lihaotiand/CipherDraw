import { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { CONTRACT_ADDRESS } from '../config/contracts';
import '../styles/PlayerPanel.css';

interface PlayerPanelProps {
  encryptedScore: string | null;
}

export function PlayerPanel({ encryptedScore }: PlayerPanelProps) {
  const { address } = useAccount();
  const { instance, isLoading: isZamaLoading, error: zamaError } = useZamaInstance();
  const signerPromise = useEthersSigner();

  const [decryptedScore, setDecryptedScore] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const encryptedScoreDisplay = useMemo(() => {
    if (!encryptedScore || encryptedScore === ethers.ZeroHash) {
      return '0x00';
    }
    return encryptedScore;
  }, [encryptedScore]);

  const clearScoreDisplay = useMemo(() => {
    if (decryptedScore) {
      return decryptedScore;
    }
    if (!encryptedScore || encryptedScore === ethers.ZeroHash) {
      return '0';
    }
    return 'Hidden';
  }, [decryptedScore, encryptedScore]);

  const canDecrypt = instance && signerPromise && address && encryptedScore && encryptedScore !== ethers.ZeroHash;

  const handleDecryptScore = async () => {
    if (!instance || !signerPromise || !address || !encryptedScore || encryptedScore === ethers.ZeroHash) {
      setDecryptedScore('0');
      return;
    }

    try {
      setIsDecrypting(true);
      setError(null);

      const keypair = instance.generateKeypair();
      const contractAddresses = [CONTRACT_ADDRESS];
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';

      const eip712 = instance.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);
      const signer = await signerPromise;
      const signature = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message,
      );

      const result = await instance.userDecrypt(
        [{ handle: encryptedScore, contractAddress: CONTRACT_ADDRESS }],
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        address,
        startTimeStamp,
        durationDays,
      );

      const decrypted = result[encryptedScore] ?? '0';
      setDecryptedScore(decrypted.toString());
    } catch (decryptError) {
      console.error('Decrypt score failed', decryptError);
      setError(decryptError instanceof Error ? decryptError.message : 'Unable to decrypt score');
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="panel-card player-card">
      <div>
        <h2 className="panel-title">Player Dashboard</h2>
        <p className="panel-subtitle">Review your encrypted balance and decrypt it whenever you need a sneak peek.</p>
      </div>

      <div className="player-stat">
        <span className="player-stat-label">Encrypted score handle</span>
        <span className="player-message">{encryptedScoreDisplay}</span>
      </div>

      <div className="player-stat">
        <span className="player-stat-label">Visible score</span>
        <span className="player-stat-value">{clearScoreDisplay}</span>
      </div>

      <div className="player-actions">
        {!address ? <div className="player-message">Connect your wallet to decrypt your score.</div> : null}
        {error ? <div className="player-message" style={{ color: '#dc2626' }}>{error}</div> : null}
        {zamaError ? <div className="player-message" style={{ color: '#b45309' }}>{zamaError}</div> : null}

        <button className="secondary-button" onClick={handleDecryptScore} disabled={!canDecrypt || isDecrypting || isZamaLoading}>
          {isZamaLoading ? 'Loading encryption' : isDecrypting ? 'Decrypting...' : 'Decrypt My Score'}
        </button>
      </div>
    </div>
  );
}
