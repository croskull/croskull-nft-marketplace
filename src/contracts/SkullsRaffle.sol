// SPDX-License-Identifier: GPL-3.0
import "./interface/IERC20Burnable.sol";
pragma solidity <=0.8.12;
pragma abicoder v2;
/** 
 * @title Raffle
 * @dev 
 */

contract SkullsRaffle {
    address public owner;
    IERC20Burnable public GRAVE;
    uint public raffleCounter;
    uint public fastRafflePercent = 200;
    uint public maxWinners = 10;
    bool private locked;

    mapping(address => bool) public managers;

    mapping(uint => bytes32) public rafflesHash;// raffle id => tokenAddress,raffleId
    mapping(bytes32 => Raffle) public raffles;// tokenAddress,raffleId => Raffle

    mapping(bytes32 => address) public participants;//raffleHash,playersCount => address
    mapping(bytes32 => bool) public players;//raffleHash,
    mapping(bytes32 => address[]) public winners;

    struct Raffle {
        uint playersCount;
        uint winnersCount;
        uint claimedAmount;
        uint cost;
        uint fastRaffle;
        uint endTimestamp;
        uint createdAt;
        uint maxParticipants;
        address createdBy;
        address tokenAddress;
        string ipfsHash;
    }

    //EVENTS
    event RaffleCreation(bytes32 indexed raffleHash, address _token, uint _raffleCounter, uint _cost, uint _winnersCount, uint _endTimestamp, string _ipfsHash);
    event RaffleEnd(bytes32 indexed raffleHash, uint raffleId, uint winnersCount );
    //MODIFIERS
    modifier isOwner {
        require(
            owner == msg.sender,
            "ERR_NOT_OWNER"
        );
        _;
    }

    modifier isManager {
        if( msg.sender != owner ){
            require(
                managers[msg.sender],
                "ERR_NOT_MANAGER"
            );
        }
        _;
    }

    modifier notReentrant {
        require( ! locked, "ERR_NOT_REENTRANT");

        _;
    }

    //CONSTRUCTOR
    constructor (
       IERC20Burnable _grave
    ) {
        owner = msg.sender;
        GRAVE = _grave;
    }

    //ADMIN FUNCTIONS
    function addManager(address _newManager) public isOwner {
        require(
            _newManager != address(0),
            "ERR_ADDR_NOT_ZERO"
        );
        require(
            ! managers[_newManager],
            "ERR_ADDR_ALREADY_MANAGER"
        );
        if( ! managers[_newManager] ) {
            managers[_newManager] = true;
        }
    }

    function removeManager(address _oldManager) public isOwner {
        require(
            managers[_oldManager],
            "ERR_MANAGER_NOT_EXISTING"
        );
        managers[_oldManager] = false;
    }

    //MANAGER FUNCTIONS
    function addRaffle(uint _winnersCount, address _token , uint _cost, uint _endTimestamp, string memory _ipfsHash, uint _fastRaffle, uint _maxParticipants) public isManager {
        if( _maxParticipants > 0 )
            require( _winnersCount <= _maxParticipants, "ERR_WINNER_MIN_MAX_PART" );
        require( _winnersCount > 0 && _winnersCount <= maxWinners, "ERR_MAX_PARTICIPANTS" );
        require( _cost > 0 );
        require( _endTimestamp > 0 );
        require( _fastRaffle == 0 || _fastRaffle > 49, "ERR_FAST_0_OR_>49" );
        bytes32 raffleHash = keccak256(
            abi.encodePacked(
                _token,
                raffleCounter
            )
        );
        Raffle memory newRaffle;
        newRaffle.tokenAddress = _token;
        newRaffle.playersCount = 0;
        newRaffle.winnersCount = _winnersCount;
        newRaffle.claimedAmount = _winnersCount;
        newRaffle.cost = _cost;
        newRaffle.endTimestamp = _endTimestamp;
        newRaffle.createdAt = block.timestamp;
        newRaffle.createdBy = msg.sender;
        newRaffle.fastRaffle = _fastRaffle;
        newRaffle.ipfsHash = _ipfsHash;
        newRaffle.maxParticipants = _maxParticipants;
        rafflesHash[raffleCounter] = raffleHash;
        raffles[raffleHash] = newRaffle;
        emit RaffleCreation(raffleHash, _token, raffleCounter, _cost, _winnersCount, _endTimestamp, _ipfsHash);
        raffleCounter++;
    }

    function getWinners(uint _raffleId) public view returns(address[] memory ) {
        require( _raffleId >= 0 );
        bytes32 raffleHash = rafflesHash[_raffleId];
        address[] memory winnersList = winners[raffleHash];
        return winnersList;
    }

    function generateWinners(uint _raffleId) public isManager {
        require( _raffleId >= 0 );
        bytes32 raffleHash = rafflesHash[_raffleId];
        Raffle memory _raffle = raffles[raffleHash];
        require( 
            _raffle.endTimestamp < block.timestamp,
            "ERR_RAFFLE_NOT_ENDED"
        );
        require(
            _raffle.claimedAmount > 0, 
            "ERR_WINNERS_GENERATED"
        );
        _generateWinners(_raffle, raffleHash, _raffleId);
    }

    function _generateWinners(Raffle memory _raffle, bytes32 _raffleHash, uint _raffleId) internal {
        uint i = 1;
        while( raffles[_raffleHash].claimedAmount > 0 ){
            uint rgnPlayer = random() % ( _raffle.playersCount + i );
            bytes32 partecipationHash = keccak256(
                abi.encodePacked(
                    _raffleHash,
                    rgnPlayer
                )
            );
            address maybeWinner = participants[partecipationHash];
            if( address(0) != maybeWinner ) {
                winners[_raffleHash].push(maybeWinner);
                participants[partecipationHash] = address(0);
                raffles[_raffleHash].claimedAmount--;
            }
            i++;
        }
        emit RaffleEnd(_raffleHash, _raffleId, _raffle.winnersCount );
    }

    //PUBLIC FUNCTIONS
    function participateRaffle(uint _raffleId) public {
        require( _raffleId >= 0 );
        bytes32 raffleHash = rafflesHash[_raffleId];
        Raffle memory _raffle = raffles[raffleHash];
        require( 
            _raffle.createdAt > 0,
            "ERR_RAFFLE_NOT_EXIST" 
        );
        bytes32 playerHash = keccak256(
            abi.encodePacked(
                raffleHash,
                msg.sender
            )
        );
        require( 
            ! players[playerHash],
            "ERR_ALREADY_PARTICIPATED"
        );
        if( _raffle.maxParticipants > 0 ){
            require(
                _raffle.maxParticipants > _raffle.playersCount,
                "ERR_LIMIT_PARTICIPANTS"
            );
        }
        require( 
            GRAVE.allowance(msg.sender, address(this)) >= _raffle.cost,
            "ERR_INCREASE_ALLOWANCE"
        );
        GRAVE.burnFrom( msg.sender, _raffle.cost );
        require( 
            block.timestamp < _raffle.endTimestamp,
            "ERR_RAFFLE_END"
        );
        
        if( _raffle.fastRaffle > 0 ){
            uint endDiff = _raffle.endTimestamp - block.timestamp;
            raffles[raffleHash].endTimestamp = _raffle.endTimestamp - ( endDiff * _raffle.fastRaffle / 10000 );
        }
        bytes32 partecipationHash = keccak256(
            abi.encodePacked(
                raffleHash,
                _raffle.playersCount
            )
        );
        participants[partecipationHash] = msg.sender;
        players[playerHash] = true;
        raffles[raffleHash].playersCount++;
        if( raffles[raffleHash].playersCount == _raffle.maxParticipants )
            _generateWinners(_raffle, raffleHash, _raffleId);

    }

    function isParticipant(uint _raffleId) public view returns(bool) {
        bytes32 raffleHash = rafflesHash[_raffleId];
        bytes32 playerHash = keccak256(
            abi.encodePacked(
                raffleHash,
                msg.sender
            )
        );
        return players[playerHash];
    }

    function getRaffle(uint _raffleId) public view returns(Raffle memory){
        bytes32 raffleHash = rafflesHash[_raffleId];
        Raffle memory _raffle = raffles[raffleHash];
        return _raffle;
    }

    //INTERNAL FUNCTIONS
    function random() internal view returns (uint) {
        uint randomNumber = uint(keccak256(
            abi.encode(
                block.number, 
                block.timestamp,
                msg.sender,
                raffleCounter
            ) 
        ));
        return randomNumber;
    }
}