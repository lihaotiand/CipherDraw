import { useEffect, useMemo, useState } from 'react';
import { useAccount, usePublicClient, useReadContract } from 'wagmi';
import { Header } from './Header';
import { TicketPurchase } from './TicketPurchase';
import { PlayerPanel } from './PlayerPanel';
import { RoundsSection } from './RoundsSection';
import type { RoundData } from './RoundsSection';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/contracts';
import '../styles/LotteryApp.css';

export function LotteryApp() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [refreshKey, setRefreshKey] = useState(0);
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [loadingRounds, setLoadingRounds] = useState(false);
  const [encryptedScore, setEncryptedScore] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { data: ownerData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  });

  const { data: currentRoundData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'currentRoundId',
  });

  const currentRoundId = useMemo(() => Number(currentRoundData ?? 0n), [currentRoundData]);

  const isOwner = useMemo(() => {
    if (!address || !ownerData) {
      return false;
    }
    return address.toLowerCase() === (ownerData as string).toLowerCase();
  }, [address, ownerData]);

  useEffect(() => {
    if (!publicClient) {
      return;
    }

    let cancelled = false;

    const loadRounds = async () => {
      try {
        setLoadingRounds(true);
        setLoadError(null);
        const latestRound = Number(currentRoundData ?? 0n);
        const roundIds = Array.from({ length: latestRound + 1 }, (_, index) => index);

        const fetchedRounds: RoundData[] = [];

        for (const id of roundIds) {
          const roundInfo = (await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'getRoundInfo',
            args: [BigInt(id)],
          })) as unknown as {
            winningFirstNumber: string;
            winningSecondNumber: string;
            isDrawn: boolean;
            drawBlock: bigint;
            drawTimestamp: bigint;
          };

          let ticketData: {
            firstNumber: string;
            secondNumber: string;
            exists: boolean;
            claimed: boolean;
          } | null = null;

          if (address) {
            ticketData = (await publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'getTicket',
              args: [BigInt(id), address],
            })) as unknown as {
              firstNumber: string;
              secondNumber: string;
              exists: boolean;
              claimed: boolean;
            };
          }

          fetchedRounds.push({
            id,
            isDrawn: roundInfo.isDrawn,
            drawTimestamp: roundInfo.drawTimestamp ? Number(roundInfo.drawTimestamp) : null,
            drawBlock: roundInfo.drawBlock ?? null,
            winningFirstHandle: roundInfo.winningFirstNumber,
            winningSecondHandle: roundInfo.winningSecondNumber,
            ticket: ticketData
              ? {
                  exists: ticketData.exists,
                  claimed: ticketData.claimed,
                  firstHandle: ticketData.firstNumber,
                  secondHandle: ticketData.secondNumber,
                }
              : null,
          });
        }

        if (address) {
          const scoreHandle = (await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'getScore',
            args: [address],
          })) as string;
          if (!cancelled) {
            setEncryptedScore(scoreHandle);
          }
        } else if (!cancelled) {
          setEncryptedScore(null);
        }

        if (!cancelled) {
          setRounds(fetchedRounds);
        }
      } catch (error) {
        console.error('Failed to load rounds', error);
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Unable to load data');
        }
      } finally {
        if (!cancelled) {
          setLoadingRounds(false);
        }
      }
    };

    loadRounds();

    return () => {
      cancelled = true;
    };
  }, [publicClient, currentRoundData, address, refreshKey]);

  const triggerRefresh = () => {
    setRefreshKey((key) => key + 1);
  };

  const activeRound = useMemo(() => rounds.find((round) => round.id === currentRoundId) ?? null, [rounds, currentRoundId]);
  const drawnRounds = useMemo(() => rounds.filter((round) => round.isDrawn).length, [rounds]);

  return (
    <div className="lottery-app">
      <Header currentRoundId={currentRoundId} drawnRounds={drawnRounds} isOwner={isOwner} />
      <main className="lottery-main">
        {loadError ? <div className="warning-banner">{loadError}</div> : null}
        <div className="lottery-grid">
          <TicketPurchase roundId={currentRoundId} hasTicket={Boolean(activeRound?.ticket?.exists)} onPurchaseSuccess={triggerRefresh} />
          <PlayerPanel encryptedScore={encryptedScore} />
        </div>
        <RoundsSection
          rounds={rounds}
          isOwner={isOwner}
          currentRoundId={currentRoundId}
          loading={loadingRounds}
          onRefresh={triggerRefresh}
        />
      </main>
    </div>
  );
}
