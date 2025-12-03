// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract ShadowDiplomacy is ZamaEthereumConfig {
    enum ActionType {
        Unknown,
        Alliance,
        Attack,
        CancelAlliance
    }

    struct Player {
        uint256 id;
        string name;
        bool registered;
    }

    struct PlayerInfo {
        uint256 id;
        string name;
        address account;
    }

    uint256 private _nextPlayerId = 1;
    mapping(address => Player) private _players;
    mapping(string => bool) private _nameTaken;
    address[] private _playerIndex;

    mapping(address => mapping(address => bool)) private _alliances;
    mapping(address => mapping(address => euint8)) private _lastEncryptedAction;

    event PlayerRegistered(address indexed player, uint256 indexed playerId, string name);
    event AllianceStatusChanged(address indexed player, address indexed counterparty, bool allied);
    event AttackRecorded(address indexed attacker, address indexed defender);
    event ActionStored(address indexed actor, address indexed target);

    error EmptyName();
    error NameTaken();
    error AlreadyRegistered();
    error PlayerNotFound();
    error InvalidAction();
    error CannotTargetSelf();
    error AlliedPlayersCannotAttack();

    function register(string calldata name) external returns (uint256) {
        if (_players[msg.sender].registered) {
            revert AlreadyRegistered();
        }
        if (bytes(name).length == 0) {
            revert EmptyName();
        }
        if (_nameTaken[name]) {
            revert NameTaken();
        }

        uint256 newId = _nextPlayerId;
        _nextPlayerId += 1;

        _players[msg.sender] = Player({id: newId, name: name, registered: true});
        _nameTaken[name] = true;
        _playerIndex.push(msg.sender);

        emit PlayerRegistered(msg.sender, newId, name);
        return newId;
    }

    function getPlayer(address account) public view returns (PlayerInfo memory) {
        Player memory player = _players[account];
        if (!player.registered) {
            revert PlayerNotFound();
        }
        return PlayerInfo({id: player.id, name: player.name, account: account});
    }

    function getPlayers() external view returns (PlayerInfo[] memory players_) {
        uint256 count = _playerIndex.length;
        players_ = new PlayerInfo[](count);
        for (uint256 i = 0; i < count; i++) {
            address account = _playerIndex[i];
            Player memory player = _players[account];
            players_[i] = PlayerInfo({id: player.id, name: player.name, account: account});
        }
    }

    function getPlayerNames() external view returns (string[] memory names) {
        uint256 count = _playerIndex.length;
        names = new string[](count);
        for (uint256 i = 0; i < count; i++) {
            names[i] = _players[_playerIndex[i]].name;
        }
    }

    function isRegistered(address account) external view returns (bool) {
        return _players[account].registered;
    }

    function nextPlayerId() external view returns (uint256) {
        return _nextPlayerId;
    }

    function isAllied(address actor, address target) external view returns (bool) {
        return _alliances[actor][target];
    }

    function getEncryptedAction(address actor, address target) external view returns (euint8) {
        return _lastEncryptedAction[actor][target];
    }

    function submitAction(
        address target,
        uint8 actionValue,
        externalEuint8 encryptedAction,
        bytes calldata inputProof
    ) external {
        Player memory actor = _players[msg.sender];
        if (!actor.registered) {
            revert PlayerNotFound();
        }
        Player memory targetPlayer = _players[target];
        if (!targetPlayer.registered) {
            revert PlayerNotFound();
        }
        if (msg.sender == target) {
            revert CannotTargetSelf();
        }
        if (actionValue < uint8(ActionType.Alliance) || actionValue > uint8(ActionType.CancelAlliance)) {
            revert InvalidAction();
        }
        if (actionValue == uint8(ActionType.Attack) && _alliances[msg.sender][target]) {
            revert AlliedPlayersCannotAttack();
        }

        euint8 storedAction = FHE.fromExternal(encryptedAction, inputProof);
        _lastEncryptedAction[msg.sender][target] = storedAction;

        FHE.allowThis(storedAction);
        FHE.allow(storedAction, msg.sender);
        FHE.allow(storedAction, target);

        if (actionValue == uint8(ActionType.Alliance)) {
            _setAlliance(msg.sender, target, true);
        } else if (actionValue == uint8(ActionType.CancelAlliance)) {
            _setAlliance(msg.sender, target, false);
        } else {
            emit AttackRecorded(msg.sender, target);
        }

        emit ActionStored(msg.sender, target);
    }

    function _setAlliance(address actor, address counterparty, bool allied) private {
        if (_alliances[actor][counterparty] == allied) {
            return;
        }

        _alliances[actor][counterparty] = allied;
        _alliances[counterparty][actor] = allied;

        emit AllianceStatusChanged(actor, counterparty, allied);
    }
}
