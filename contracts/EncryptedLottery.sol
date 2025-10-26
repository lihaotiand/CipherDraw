// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, ebool, euint8, euint32, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract EncryptedLottery is SepoliaConfig {
    uint256 public constant TICKET_PRICE = 0.0001 ether;
    uint32 public constant REWARD_POINTS = 10;
    uint8 public constant MIN_NUMBER = 1;
    uint8 public constant MAX_NUMBER = 10;

    struct Ticket {
        euint8 firstNumber;
        euint8 secondNumber;
        bool exists;
        bool claimed;
    }

    struct RoundInfo {
        euint8 winningFirstNumber;
        euint8 winningSecondNumber;
        bool isDrawn;
        uint256 drawBlock;
        uint256 drawTimestamp;
    }

    error NotOwner();
    error RoundClosed();
    error TicketAlreadyPurchased();
    error InvalidPayment();
    error RoundNotDrawn();
    error TicketMissing();
    error RewardAlreadyClaimed();
    error NoAuthorization();
    error InvalidRecipient();
    error InvalidNumbers();

    event TicketPurchased(uint256 indexed roundId, address indexed player);
    event RoundDrawn(uint256 indexed roundId, euint8 winningFirstNumber, euint8 winningSecondNumber);
    event RewardClaimed(uint256 indexed roundId, address indexed player, euint32 newEncryptedScore);
    event WinningNumbersAccessGranted(uint256 indexed roundId, address indexed player);

    mapping(uint256 => RoundInfo) private _rounds;
    mapping(uint256 => mapping(address => Ticket)) private _tickets;
    mapping(address => euint32) private _scores;
    mapping(uint256 => mapping(address => bool)) private _winningAccess;

    uint256 private _currentRoundId;
    address private _owner;

    modifier onlyOwner() {
        if (msg.sender != _owner) {
            revert NotOwner();
        }
        _;
    }

    constructor() {
        _owner = msg.sender;
    }

    function owner() external view returns (address) {
        return _owner;
    }

    function currentRoundId() external view returns (uint256) {
        return _currentRoundId;
    }

    function getRoundInfo(uint256 roundId)
        external
        view
        returns (euint8 winningFirstNumber, euint8 winningSecondNumber, bool isDrawn, uint256 drawBlock, uint256 drawTimestamp)
    {
        RoundInfo storage round = _rounds[roundId];
        return (round.winningFirstNumber, round.winningSecondNumber, round.isDrawn, round.drawBlock, round.drawTimestamp);
    }

    function getTicket(uint256 roundId, address player)
        external
        view
        returns (euint8 firstNumber, euint8 secondNumber, bool exists, bool claimed)
    {
        Ticket storage ticket = _tickets[roundId][player];
        return (ticket.firstNumber, ticket.secondNumber, ticket.exists, ticket.claimed);
    }

    function getScore(address player) external view returns (euint32) {
        return _scores[player];
    }

    function buyTicket(externalEuint8 encryptedFirst, externalEuint8 encryptedSecond, bytes calldata inputProof) external payable {
        if (msg.value != TICKET_PRICE) {
            revert InvalidPayment();
        }

        uint256 roundId = _currentRoundId;
        RoundInfo storage round = _rounds[roundId];
        if (round.isDrawn) {
            revert RoundClosed();
        }

        Ticket storage ticket = _tickets[roundId][msg.sender];
        if (ticket.exists) {
            revert TicketAlreadyPurchased();
        }

        euint8 firstNumber = FHE.fromExternal(encryptedFirst, inputProof);
        euint8 secondNumber = FHE.fromExternal(encryptedSecond, inputProof);

        firstNumber = FHE.allowThis(firstNumber);
        secondNumber = FHE.allowThis(secondNumber);

        firstNumber = FHE.allow(firstNumber, msg.sender);
        secondNumber = FHE.allow(secondNumber, msg.sender);

        ticket.firstNumber = firstNumber;
        ticket.secondNumber = secondNumber;
        ticket.exists = true;
        ticket.claimed = false;

        emit TicketPurchased(roundId, msg.sender);
    }

    function drawWinningNumbers() external onlyOwner {
        uint256 roundId = _currentRoundId;
        RoundInfo storage round = _rounds[roundId];
        if (round.isDrawn) {
            revert RoundClosed();
        }

        uint256 randomness = uint256(keccak256(abi.encode(blockhash(block.number - 1), block.timestamp, roundId, address(this))));

        uint8 firstPlain = uint8(randomness % MAX_NUMBER) + MIN_NUMBER;
        uint8 secondPlain = uint8((randomness / MAX_NUMBER) % MAX_NUMBER) + MIN_NUMBER;

        euint8 winningFirst = FHE.asEuint8(firstPlain);
        euint8 winningSecond = FHE.asEuint8(secondPlain);

        winningFirst = FHE.allowThis(winningFirst);
        winningSecond = FHE.allowThis(winningSecond);

        round.winningFirstNumber = winningFirst;
        round.winningSecondNumber = winningSecond;
        round.isDrawn = true;
        round.drawBlock = block.number;
        round.drawTimestamp = block.timestamp;

        emit RoundDrawn(roundId, winningFirst, winningSecond);

        unchecked {
            _currentRoundId = roundId + 1;
        }
    }

    function setMockWinningNumbers(uint8 firstPlain, uint8 secondPlain) external onlyOwner {
        if (block.chainid != 31337) {
            revert NoAuthorization();
        }
        if (firstPlain < MIN_NUMBER || firstPlain > MAX_NUMBER || secondPlain < MIN_NUMBER || secondPlain > MAX_NUMBER) {
            revert InvalidNumbers();
        }

        uint256 roundId = _currentRoundId;
        RoundInfo storage round = _rounds[roundId];
        if (round.isDrawn) {
            revert RoundClosed();
        }

        euint8 winningFirst = FHE.asEuint8(firstPlain);
        euint8 winningSecond = FHE.asEuint8(secondPlain);

        winningFirst = FHE.allowThis(winningFirst);
        winningSecond = FHE.allowThis(winningSecond);

        round.winningFirstNumber = winningFirst;
        round.winningSecondNumber = winningSecond;
        round.isDrawn = true;
        round.drawBlock = block.number;
        round.drawTimestamp = block.timestamp;

        emit RoundDrawn(roundId, winningFirst, winningSecond);

        unchecked {
            _currentRoundId = roundId + 1;
        }
    }

    function claimReward(uint256 roundId) external {
        RoundInfo storage round = _rounds[roundId];
        if (!round.isDrawn) {
            revert RoundNotDrawn();
        }

        Ticket storage ticket = _tickets[roundId][msg.sender];
        if (!ticket.exists) {
            revert TicketMissing();
        }
        if (ticket.claimed) {
            revert RewardAlreadyClaimed();
        }

        ebool firstMatch = FHE.eq(ticket.firstNumber, round.winningFirstNumber);
        ebool secondMatch = FHE.eq(ticket.secondNumber, round.winningSecondNumber);
        ebool matches = FHE.and(firstMatch, secondMatch);

        euint32 currentScore = _scores[msg.sender];
        if (!FHE.isInitialized(currentScore)) {
            currentScore = FHE.asEuint32(0);
        }

        euint32 reward = FHE.asEuint32(REWARD_POINTS);
        euint32 updatedScore = FHE.select(matches, FHE.add(currentScore, reward), currentScore);

        updatedScore = FHE.allowThis(updatedScore);
        updatedScore = FHE.allow(updatedScore, msg.sender);

        _scores[msg.sender] = updatedScore;
        ticket.claimed = true;

        emit RewardClaimed(roundId, msg.sender, updatedScore);
    }

    function requestWinningNumberAccess(uint256 roundId) external {
        RoundInfo storage round = _rounds[roundId];
        if (!round.isDrawn) {
            revert RoundNotDrawn();
        }

        Ticket storage ticket = _tickets[roundId][msg.sender];
        if (!ticket.exists) {
            revert NoAuthorization();
        }

        if (_winningAccess[roundId][msg.sender]) {
            return;
        }

        round.winningFirstNumber = FHE.allow(round.winningFirstNumber, msg.sender);
        round.winningSecondNumber = FHE.allow(round.winningSecondNumber, msg.sender);
        _winningAccess[roundId][msg.sender] = true;

        emit WinningNumbersAccessGranted(roundId, msg.sender);
    }

    function refreshTicketAccess(uint256 roundId) external {
        Ticket storage ticket = _tickets[roundId][msg.sender];
        if (!ticket.exists) {
            revert TicketMissing();
        }

        ticket.firstNumber = FHE.allow(ticket.firstNumber, msg.sender);
        ticket.secondNumber = FHE.allow(ticket.secondNumber, msg.sender);
    }

    function withdraw(address payable recipient) external onlyOwner {
        if (recipient == address(0)) {
            revert InvalidRecipient();
        }
        recipient.transfer(address(this).balance);
    }
}
