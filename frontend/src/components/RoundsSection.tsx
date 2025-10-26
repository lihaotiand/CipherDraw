import { useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { Contract } from 'ethers';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/contracts';
import '../styles/RoundsSection.css';

export interface RoundData {
  id: number;
  isDrawn: boolean;
  drawTimestamp: number | null;
  drawBlock: bigint | null;
  winningFirstHandle: string;
  winningSecondHandle: string;
  ticket?: {
    exists: boolean;
    claimed: boolean;
    firstHandle: string;
    secondHandle: string;
  } | null;
}

interface RoundsSectionProps {
  rounds: RoundData[];
  isOwner: boolean;
  currentRoundId: number;
  loading: boolean;
  onRefresh: () => void;
}

type NumberMap = Record<number, [string, string]>;

export function RoundsSection({ rounds, isOwner, currentRoundId, loading, onRefresh }: RoundsSectionProps) {
  const { address } = useAccount();
  const { instance, isLoading: isZamaLoading, error: zamaError } = useZamaInstance();
  const signerPromise = useEthersSigner();

  const [ticketNumbers, setTicketNumbers] = useState<NumberMap>({});
  const [winningNumbers, setWinningNumbers] = useState<NumberMap>({});
  const [claimingRound, setClaimingRound] = useState<number | null>(null);
  const [decryptingTicket, setDecryptingTicket] = useState<number | null>(null);
  const [decryptingWinning, setDecryptingWinning] = useState<number | null>(null);
  const [ownerBusy, setOwnerBusy] = useState(false);
  const [ownerError, setOwnerError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [mockFirst, setMockFirst] = useState<number>(1);
  const [mockSecond, setMockSecond] = useState<number>(2);

  const contract = useMemo(() => {
    if (!signerPromise) {
      return null;
    }
    return signerPromise.then((signer) => new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer));
  }, [signerPromise]);

  const validateNumbers = (first: number, second: number) => {
    return [first, second].every((value) => Number.isInteger(value) && value >= 1 && value <= 10);
  };

  const handleDraw = async () => {
    if (!isOwner) {
      return;
    }
    try {
      setOwnerBusy(true);
      setOwnerError(null);
      const resolvedContract = await contract;
      if (!resolvedContract) {
        throw new Error('Signer unavailable');
      }
      const tx = await resolvedContract.drawWinningNumbers();
      await tx.wait();
      onRefresh();
    } catch (error) {
      console.error('Draw failed', error);
      setOwnerError(error instanceof Error ? error.message : 'Draw failed');
    } finally {
      setOwnerBusy(false);
    }
  };

  const handleMockDraw = async () => {
    if (!isOwner) {
      return;
    }
    if (!validateNumbers(mockFirst, mockSecond)) {
      setOwnerError('Mock numbers must be between 1 and 10.');
      return;
    }
    try {
      setOwnerBusy(true);
      setOwnerError(null);
      const resolvedContract = await contract;
      if (!resolvedContract) {
        throw new Error('Signer unavailable');
      }
      const tx = await resolvedContract.setMockWinningNumbers(mockFirst, mockSecond);
      await tx.wait();
      onRefresh();
    } catch (error) {
      console.error('Mock draw failed', error);
      setOwnerError(error instanceof Error ? error.message : 'Mock draw failed');
    } finally {
      setOwnerBusy(false);
    }
  };

  const handleClaim = async (roundId: number) => {
    if (!contract) {
      setActionError('Wallet signer unavailable');
      return;
    }
    try {
      setClaimingRound(roundId);
      setActionError(null);
      const resolvedContract = await contract;
      const tx = await resolvedContract.claimReward(roundId);
      await tx.wait();
      onRefresh();
    } catch (error) {
      console.error('Claim failed', error);
      setActionError(error instanceof Error ? error.message : 'Claim failed');
    } finally {
      setClaimingRound(null);
    }
  };

  const decryptHandles = async (handles: [string, string]) => {
    if (!instance || !signerPromise || !address) {
      throw new Error('Encryption helpers are not ready');
    }

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
      [
        { handle: handles[0], contractAddress: CONTRACT_ADDRESS },
        { handle: handles[1], contractAddress: CONTRACT_ADDRESS },
      ],
      keypair.privateKey,
      keypair.publicKey,
      signature.replace('0x', ''),
      contractAddresses,
      address,
      startTimeStamp,
      durationDays,
    );

    return [result[handles[0]] ?? '0', result[handles[1]] ?? '0'] as [string, string];
  };

  const handleDecryptTicket = async (round: RoundData) => {
    if (!round.ticket || !round.ticket.exists || !round.ticket.firstHandle || !round.ticket.secondHandle) {
      setActionError('No ticket to decrypt.');
      return;
    }
    try {
      setDecryptingTicket(round.id);
      setActionError(null);
      const resolvedContract = await contract;
      if (resolvedContract) {
        await resolvedContract.refreshTicketAccess(round.id);
      }
      const decrypted = await decryptHandles([round.ticket.firstHandle, round.ticket.secondHandle]);
      setTicketNumbers((prev) => ({ ...prev, [round.id]: decrypted }));
    } catch (error) {
      console.error('Ticket decrypt failed', error);
      setActionError(error instanceof Error ? error.message : 'Decrypt failed');
    } finally {
      setDecryptingTicket(null);
    }
  };

  const handleViewWinning = async (round: RoundData) => {
    if (!round.isDrawn || !round.winningFirstHandle || !round.winningSecondHandle) {
      setActionError('Winning numbers are not ready.');
      return;
    }
    try {
      setDecryptingWinning(round.id);
      setActionError(null);
      const resolvedContract = await contract;
      if (!resolvedContract) {
        throw new Error('Wallet signer unavailable');
      }
      await resolvedContract.requestWinningNumberAccess(round.id);
      const decrypted = await decryptHandles([round.winningFirstHandle, round.winningSecondHandle]);
      setWinningNumbers((prev) => ({ ...prev, [round.id]: decrypted }));
    } catch (error) {
      console.error('Winning decrypt failed', error);
      setActionError(error instanceof Error ? error.message : 'Decrypt failed');
    } finally {
      setDecryptingWinning(null);
    }
  };

  const renderOwnerControls = () => {
    if (!isOwner) {
      return null;
    }
    const isLastRoundDrawn = rounds.find((round) => round.id === currentRoundId)?.isDrawn;

    return (
      <div className="panel-card">
        <h2 className="panel-title">Owner Controls</h2>
        <p className="panel-subtitle">
          Trigger confidential draws directly on-chain. Mock draws are restricted to the local Hardhat network and help
          with end-to-end testing.
        </p>
        {ownerError ? <div className="warning-banner">{ownerError}</div> : null}
        <div className="owner-controls">
          <button className="primary-button" onClick={handleDraw} disabled={ownerBusy || Boolean(isLastRoundDrawn)}>
            {ownerBusy ? 'Working...' : 'Draw Winning Numbers'}
          </button>
          <div className="owner-inputs">
            <input
              type="number"
              min={1}
              max={10}
              value={mockFirst}
              onChange={(event) => setMockFirst(Number(event.target.value))}
              className="number-input"
              disabled={ownerBusy}
            />
            <input
              type="number"
              min={1}
              max={10}
              value={mockSecond}
              onChange={(event) => setMockSecond(Number(event.target.value))}
              className="number-input"
              disabled={ownerBusy}
            />
            <button className="ghost-button" onClick={handleMockDraw} disabled={ownerBusy}>
              Mock Draw (Local)
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounds-card">
      {renderOwnerControls()}
      <div className="panel-card">
        <h2 className="panel-title">Round Activity</h2>
        <p className="panel-subtitle">
          Track each round, claim rewards, and decrypt your numbers securely through Zama&rsquo;s relayer.
        </p>
        {zamaError ? <div className="warning-banner">{zamaError}</div> : null}
        {actionError ? <div className="warning-banner">{actionError}</div> : null}
        {loading ? (
          <div className="player-message">Loading rounds...</div>
        ) : rounds.length === 0 ? (
          <div className="empty-state">No rounds yet. Purchase a ticket to start the first draw.</div>
        ) : (
          <div className="rounds-list">
            {rounds.map((round) => {
              const ticket = round.ticket;
              const ticketDecrypted = ticketNumbers[round.id];
              const winningDecrypted = winningNumbers[round.id];
              const isCurrent = round.id === currentRoundId;

              return (
                <div key={round.id} className="round-card">
                  <div className="round-header">
                    <h3 className="round-title">Round #{round.id}</h3>
                    <span className={`status-pill ${round.isDrawn ? 'status-drawn' : 'status-open'}`}>
                      {round.isDrawn ? 'Drawn' : isCurrent ? 'Open for tickets' : 'Pending draw'}
                    </span>
                  </div>

                  <div className="round-body">
                    <div className="round-detail">
                      <span>Drawn at</span>
                      <span>
                        {round.isDrawn && round.drawTimestamp
                          ? new Date(round.drawTimestamp * 1000).toLocaleString()
                          : 'TBD'}
                      </span>
                    </div>
                    <div className="round-detail">
                      <span>Your ticket</span>
                      <span>
                        {ticket && ticket.exists
                          ? ticketDecrypted
                            ? `${ticketDecrypted[0]} • ${ticketDecrypted[1]}`
                            : ticket.claimed
                              ? 'Submitted (claimed)'
                              : 'Submitted (encrypted)'
                          : 'No ticket'}
                      </span>
                    </div>
                    {ticket && ticket.claimed ? <span className="claimed-chip">Reward claimed</span> : null}
                    {round.isDrawn && winningDecrypted ? (
                      <div className="decrypted-values">
                        <span className="value-chip">Winning: {winningDecrypted[0]} • {winningDecrypted[1]}</span>
                      </div>
                    ) : null}

                    <div className="round-actions">
                      {ticket && ticket.exists ? (
                        <button
                          className="ghost-button"
                          onClick={() => handleDecryptTicket(round)}
                          disabled={Boolean(decryptingTicket) || isZamaLoading}
                        >
                          {decryptingTicket === round.id ? 'Decrypting ticket...' : 'Decrypt My Ticket'}
                        </button>
                      ) : null}

                      {round.isDrawn && ticket && ticket.exists && !ticket.claimed ? (
                        <button
                          className="secondary-button"
                          onClick={() => handleClaim(round.id)}
                          disabled={claimingRound === round.id}
                        >
                          {claimingRound === round.id ? 'Claiming...' : 'Claim Reward'}
                        </button>
                      ) : null}

                      {round.isDrawn ? (
                        <button
                          className="ghost-button"
                          onClick={() => handleViewWinning(round)}
                          disabled={Boolean(decryptingWinning) || isZamaLoading}
                        >
                          {decryptingWinning === round.id ? 'Decrypting winnings...' : 'View Winning Numbers'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
