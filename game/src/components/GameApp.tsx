import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Contract } from 'ethers';

import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import '../styles/GameApp.css';

type PlayerInfo = {
  id: bigint;
  name: string;
  account: `0x${string}`;
};

type ActionOption = 'alliance' | 'attack' | 'cancel';

const ACTION_VALUE_MAP: Record<ActionOption, number> = {
  alliance: 1,
  attack: 2,
  cancel: 3,
};

export function GameApp() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const signerPromise = useEthersSigner();
  const { instance, isLoading: isZamaLoading, error: zamaError } = useZamaInstance();
  const queryClient = useQueryClient();

  const [nameInput, setNameInput] = useState('');
  const [registerMessage, setRegisterMessage] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<ActionOption>('alliance');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const {
    data: players,
    isFetching: isLoadingPlayers,
    refetch: refetchPlayers,
  } = useQuery<PlayerInfo[]>({
    queryKey: ['players'],
    queryFn: async () => {
      if (!publicClient) {
        return [];
      }
      const result = (await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getPlayers',
      })) as PlayerInfo[];
      return result;
    },
    refetchInterval: 15000,
  });

  const {
    data: playerRecord,
    refetch: refetchPlayerRecord,
  } = useQuery<{ registered: boolean; player?: PlayerInfo }>({
    queryKey: ['player-record', address ?? ''],
    enabled: Boolean(publicClient && address),
    queryFn: async () => {
      if (!publicClient || !address) {
        return { registered: false };
      }
      const registered = (await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'isRegistered',
        args: [address],
      })) as boolean;
      if (!registered) {
        return { registered: false };
      }
      const player = (await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getPlayer',
        args: [address],
      })) as PlayerInfo;
      return { registered: true, player };
    },
  });

  const sortedPlayers = useMemo(() => {
    if (!players) {
      return [] as PlayerInfo[];
    }
    return [...players].sort((first, second) => {
      if (first.id === second.id) {
        return 0;
      }
      return first.id < second.id ? -1 : 1;
    });
  }, [players]);

  const allianceQueryKey = useMemo(() => ['alliance', address ?? '', selectedTarget], [address, selectedTarget]);
  const { data: allianceState } = useQuery<boolean>({
    queryKey: allianceQueryKey,
    enabled: Boolean(publicClient && address && selectedTarget),
    queryFn: async () => {
      if (!publicClient || !address || !selectedTarget) {
        return false;
      }
      return (await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'isAllied',
        args: [address, selectedTarget as `0x${string}`],
      })) as boolean;
    },
  });

  const targetOptions = useMemo(
    () => sortedPlayers.filter((player) => player.account.toLowerCase() !== (address ?? '').toLowerCase()),
    [sortedPlayers, address],
  );

  useEffect(() => {
    if (!selectedTarget) {
      return;
    }
    const stillAvailable = targetOptions.some((player) => player.account.toLowerCase() === selectedTarget.toLowerCase());
    if (!stillAvailable) {
      setSelectedTarget('');
    }
  }, [targetOptions, selectedTarget]);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegisterMessage(null);

    if (!address) {
      setRegisterMessage('Connect a wallet to register.');
      return;
    }
    if (!nameInput.trim()) {
      setRegisterMessage('Player name cannot be empty.');
      return;
    }
    const signer = await signerPromise;
    if (!signer) {
      setRegisterMessage('Wallet signer is not available.');
      return;
    }

    try {
      setIsRegistering(true);
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.register(nameInput.trim());
      await tx.wait();
      setRegisterMessage('Registration completed successfully.');
      setNameInput('');
      await Promise.all([refetchPlayers(), refetchPlayerRecord()]);
    } catch (error) {
      console.error('Registration failed', error);
      setRegisterMessage('Registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  }

  async function handleSubmitAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionMessage(null);

    if (!address) {
      setActionMessage('Connect a wallet to perform actions.');
      return;
    }
    if (!playerRecord?.registered) {
      setActionMessage('Register before submitting actions.');
      return;
    }
    if (!selectedTarget) {
      setActionMessage('Select a target player.');
      return;
    }
    if (!instance) {
      setActionMessage('Encryption service is not ready.');
      return;
    }

    const signer = await signerPromise;
    if (!signer) {
      setActionMessage('Wallet signer is not available.');
      return;
    }

    try {
      setIsSubmittingAction(true);
      const actionValue = ACTION_VALUE_MAP[selectedAction];
      const buffer = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      buffer.add8(BigInt(actionValue));
      const encrypted = await buffer.encrypt();

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.submitAction(
        selectedTarget,
        actionValue,
        encrypted.handles[0],
        encrypted.inputProof,
      );
      await tx.wait();
      setActionMessage('Action submitted successfully.');
      await queryClient.invalidateQueries({ queryKey: ['players'] });
      await queryClient.invalidateQueries({ queryKey: ['alliance', address ?? '', selectedTarget] });
    } catch (error) {
      console.error('Action submission failed', error);
      setActionMessage('Action failed. Verify your selection and try again.');
    } finally {
      setIsSubmittingAction(false);
    }
  }

  return (
    <div className="game-app">
      <section className="panel">
        <h2 className="panel-title">Player Registration</h2>
        {address ? (
          playerRecord?.registered ? (
            <div className="info-card">
              <p className="info-line">
                <span className="info-label">Name:</span>
                <span>{playerRecord.player?.name}</span>
              </p>
              <p className="info-line">
                <span className="info-label">Player ID:</span>
                <span>{playerRecord.player?.id.toString()}</span>
              </p>
              <p className="info-line">
                <span className="info-label">Address:</span>
                <span className="info-address">{playerRecord.player?.account}</span>
              </p>
            </div>
          ) : (
            <form className="form" onSubmit={handleRegister}>
              <label className="form-label" htmlFor="player-name">
                Choose a unique name
              </label>
              <input
                id="player-name"
                className="form-input"
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                placeholder="Enter your diplomat name"
              />
              <button className="form-button" type="submit" disabled={isRegistering}>
                {isRegistering ? 'Registering...' : 'Register Player'}
              </button>
              {registerMessage && <p className="form-message">{registerMessage}</p>}
            </form>
          )
        ) : (
          <p className="form-message">Connect your wallet to join the game.</p>
        )}
      </section>

      <section className="panel">
        <h2 className="panel-title">Strategic Actions</h2>
        {playerRecord?.registered ? (
          <form className="form" onSubmit={handleSubmitAction}>
            <label className="form-label" htmlFor="target-player">
              Target player
            </label>
            <select
              id="target-player"
              className="form-select"
              value={selectedTarget}
              onChange={(event) => setSelectedTarget(event.target.value)}
            >
              <option value="">Select opponent</option>
              {targetOptions.map((player) => (
                <option key={player.account} value={player.account}>
                  #{player.id.toString()} {player.name}
                </option>
              ))}
            </select>

            <fieldset className="action-options">
              <legend className="form-label">Action</legend>
              <label className="radio-option">
                <input
                  type="radio"
                  name="action"
                  value="alliance"
                  checked={selectedAction === 'alliance'}
                  onChange={() => setSelectedAction('alliance')}
                />
                Forge Alliance
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="action"
                  value="attack"
                  checked={selectedAction === 'attack'}
                  onChange={() => setSelectedAction('attack')}
                />
                Launch Attack
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="action"
                  value="cancel"
                  checked={selectedAction === 'cancel'}
                  onChange={() => setSelectedAction('cancel')}
                />
                Cancel Alliance
              </label>
            </fieldset>

            {selectedTarget && (
              <p className="status-line">
                Current status with target: {allianceState ? 'Allied' : 'Neutral'}
              </p>
            )}

            <button className="form-button" type="submit" disabled={isSubmittingAction || isZamaLoading}>
              {isSubmittingAction ? 'Submitting...' : 'Submit Encrypted Action'}
            </button>
            {actionMessage && <p className="form-message">{actionMessage}</p>}
            {zamaError && <p className="form-message error">{zamaError}</p>}
          </form>
        ) : (
          <p className="form-message">Register to access action controls.</p>
        )}
      </section>

      <section className="panel">
        <h2 className="panel-title">Player Roster</h2>
        {isLoadingPlayers ? (
          <p className="form-message">Loading players...</p>
        ) : sortedPlayers.length > 0 ? (
          <ul className="player-list">
            {sortedPlayers.map((player) => (
              <li key={player.account} className="player-card">
                <div className="player-header">
                  <span className="player-id">#{player.id.toString()}</span>
                  <span className="player-name">{player.name}</span>
                </div>
                <p className="player-address">{player.account}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="form-message">No players registered yet.</p>
        )}
      </section>
    </div>
  );
}
