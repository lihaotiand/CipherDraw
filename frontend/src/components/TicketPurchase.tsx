import { useState, type FormEvent } from 'react';
import { useAccount } from 'wagmi';
import { Contract, parseEther } from 'ethers';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/contracts';
import '../styles/TicketPurchase.css';

interface TicketPurchaseProps {
  roundId: number;
  hasTicket: boolean;
  onPurchaseSuccess: () => void;
}

const TICKET_PRICE = '0.0001';

export function TicketPurchase({ roundId, hasTicket, onPurchaseSuccess }: TicketPurchaseProps) {
  const { address } = useAccount();
  const { instance, isLoading: isZamaLoading, error: zamaError } = useZamaInstance();
  const signerPromise = useEthersSigner();

  const [firstNumber, setFirstNumber] = useState<number>(1);
  const [secondNumber, setSecondNumber] = useState<number>(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!address) {
      setError('Please connect your wallet to purchase a ticket.');
      return false;
    }
    if (!instance) {
      setError('Encryption service is still preparing, please try again shortly.');
      return false;
    }
    if (!signerPromise) {
      setError('Wallet signer is unavailable.');
      return false;
    }
    if (firstNumber < 1 || firstNumber > 10 || secondNumber < 1 || secondNumber > 10) {
      setError('Numbers must be between 1 and 10.');
      return false;
    }
    return true;
  };

  const resetMessages = () => {
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();

    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const encryptedInput = await instance!
        .createEncryptedInput(CONTRACT_ADDRESS, address!)
        .add8(firstNumber)
        .add8(secondNumber)
        .encrypt();

      const signer = await signerPromise!;
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.buyTicket(
        encryptedInput.handles[0],
        encryptedInput.handles[1],
        encryptedInput.inputProof,
        { value: parseEther(TICKET_PRICE) },
      );

      await tx.wait();
      setMessage(`Ticket secured for round #${roundId}`);
      onPurchaseSuccess();
    } catch (purchaseError) {
      console.error('Failed to buy ticket', purchaseError);
      setError(purchaseError instanceof Error ? purchaseError.message : 'Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = hasTicket || isSubmitting || isZamaLoading;

  return (
    <div className="panel-card purchase-card">
      <div>
        <h2 className="panel-title">Buy Ticket</h2>
        <p className="panel-subtitle">
          Choose two numbers between 1 and 10. They will be encrypted locally before being sent on-chain. Matching both
          winning numbers awards encrypted points that only you can reveal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="purchase-card">
        <div className="number-grid">
          <label>
            <div className="input-label">First number</div>
            <input
              type="number"
              min={1}
              max={10}
              value={firstNumber}
              onChange={(event) => setFirstNumber(Number(event.target.value))}
              className="ticket-input"
              disabled={isDisabled}
              required
            />
          </label>
          <label>
            <div className="input-label">Second number</div>
            <input
              type="number"
              min={1}
              max={10}
              value={secondNumber}
              onChange={(event) => setSecondNumber(Number(event.target.value))}
              className="ticket-input"
              disabled={isDisabled}
              required
            />
          </label>
        </div>

        <div className="purchase-actions">
          <span className="price-note">Ticket price: {TICKET_PRICE} ether</span>
          {hasTicket ? (
            <div className="warning-banner">You already purchased a ticket for this round.</div>
          ) : null}
          {message ? <div className="success-banner">{message}</div> : null}
          {error ? <div className="warning-banner">{error}</div> : null}
          {zamaError ? <div className="warning-banner">{zamaError}</div> : null}

          <button type="submit" className="primary-button" disabled={isDisabled}>
            {isZamaLoading ? 'Loading encryption' : isSubmitting ? 'Processing...' : 'Purchase Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}
