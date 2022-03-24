pragma solidity <=0.9.0;
pragma abicoder v2;

import "./interface/IERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract BonesvilleBank is ERC20, ERC20Burnable, AccessControl, ERC20Permit {
    IERC20Burnable Grave;

    bool locked;
    address owner;
    uint contractCounter;
    uint graveSupply;

    struct BankContract {
        IERC20Burnable token;
        uint rewardAmount;
        uint startingTotalSupply;
        uint stakedAmount;
        uint duration;
        uint multiplier;
        uint withdrawAmount;
    }

    struct UserStake {
        uint contractId;
        uint amount;
        uint lastUnstakeTime;
        uint lastStakeTime;
        uint availableRewards;
    }

    mapping( uint => BankContract ) public BankContracts;
    mapping( bytes32 => UserStake ) public UserStakes;
    mapping( address => uint ) public UserContractsCount;

    /**
        @dev: modifiers
     */

    modifier updateRewards ( address customer ) {
        //logic
        _;
    }

    modifier isOwner {
        require(
            owner == msg.sender,
            "ERR_NOT_OWNER"
        );
        _;
    }

    modifier notReentrant {
        require(
            ! locked,
            "ERR_NOT_REENTRANT"
        );
        locked = true;
        _;
        locked = false;
    }

    modifier notZero ( uint _value ) {
        require(
            _value > 0,
            "ERR_NOT_ZERO"
        );
        _;
    }


    /**
        @dev: events
     */
    event BankContractCreation( 
        uint contractId, 
        IERC20Burnable tokenAddress,
        uint rewardAmount,
        uint duration
    );

    
    /**
        @dev: admin methods
     */
    function addNewContract(
        IERC20Burnable _token, 
        uint _rewardAmount, 
        uint _duration,
        uint _multiplier
    ) 
        public
        isOwner()
        notZero( _rewardAmount )
        notZero( _duration )
        notZero( _multiplier)
    {
        require( _token != IERC20Burnable(address(0)) );
        require( 
            _token.allowance( msg.sender, address(this) ) >= _amount,
            "ERR_INCREASE_ALLOWANCE"
        );
        BankContract memory newContract;

        newContract.token = _token;
        newContract.duration = _duration;
        newContract.multiplier = _multiplier;
        newContract.stakedAmount = 0;
        newContract.withdrawAmount = 0;

        BankContracts[contractCounter] = newContract;

        emit BankContractCreation(
            contractCounter, 
            _token,
            _amount,
            _duration
        );
        contractCounter++;
    }


    function getTotalSupply( IERC20Burnable _token ) internal returns( uint ) {
        uint supply = _token.totalSupply().div(10**18);
        return supply;
    }



    function addStake( 
        uint _contractId, 
        uint _amount
    ) 
        public 
        notReentrant
        notZero(_amout)
        notZero(_contractId)
    {
        BankContract memory currentContract = BankContracts[_contractId];
        if( currentContract.startingTotalSupply > 0 ) {
            require(
                _amount >= currentContract.token.allowance(msg.sender, address(this)),
                "ERR_INCREASE_ALLOWANCE"
            );
            require(
                currentContract.token.transferFrom(msg.sender, address(this), _amount),
                "ERR_TX_FAILED"
            );
            uint currentTimestamp = block.timestamp;
            bytes32 contractHash = keccak256(
                abi.encodePacked(
                    msg.sender,
                    UserContractsCount[msg.sender]
                )
            );
            //update Contract Amount
            currentContract.stakedAmount += _amount;
            //update current user contract counter
            UserContractsCount[msg.sender]++;
            uint unlockDate = currentTimestamp.add(currentContract.duration);
            //update user stakes struct data
            UserStakes[contractHash].contractId = _contractId;
            UserStakes[contractHash].amount = _amount;
            UserStakes[contractHash].availableRewards = 0;
            UserStakes[contractHash].unlockDate;
            UserStakes[contractHash].lastTotalSupply = getTotalSupply(currentContract.token);
        }
    }

    
    /**
        @dev: public methods
     */

    /**
        @dev: internal methods
     */

}