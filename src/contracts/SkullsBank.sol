// SPDX-License-Identifier: Unlicensed
/**
    CroSkull Bank System
    Powered by: @hiutaky 
 */
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interface/IERC20Mintable.sol";
import "./interface/IERC20Burnable.sol";

contract SkullsBank {
    using SafeMath for uint;
    //immutable
    uint internal mathOperator = 10 ** 5;
    uint internal decimals = 10 ** 18;
    address public owner;

    //reentrancy
    bool public locked = false;

    //mutable
    uint public maxApy = 333 * mathOperator;
    uint public rate = 6000 * mathOperator;

    IERC20Burnable public GRAVE;
    IERC20Mintable public RUDE;

    uint public totalGraveVolume = 0;
    uint public totalWishbonesVolume = 0;
    uint public totalContractsVolume = 0;

    uint public depositedGrave = 0;
    uint public activeWishbones = 6666;

    uint public activeContracts = 0;

    uint public wishboneCost = 30;//0,3 * 100
    uint public bankFee = 30; // 0,3 * 100

    struct UserContract{
        address owner;
        uint amount;
        uint startTimestamp;
        uint unlockTimestamp;
        uint usedWishbones;
        uint duration;
    }

    mapping( bytes32 => UserContract ) public userContracts;
    mapping( address => uint ) public userContractCount;

    //EVENTS
    event ContractCreated( bytes32 contractHash, address account, uint contractId, uint amount, uint creationTimestamp, uint unlockTimestamp );
    event ContractClaimed( bytes32 contractHash, address account, uint contractId, uint amount, uint rewardsAmount, uint creationTimestamp, uint unlockTimestamp );

    //MODIFIERS
    modifier isOwner {
        require(
            msg.sender == owner,
            "ERR_NOT_OWNER"
        );
        _;
    }

    modifier notReentrant {
        require( ! locked, "NOT_REENTRANT" );
        locked = true;
        _;
        locked = false;
    }

    //INIT
    constructor () {
        owner = msg.sender;
    }

    /** 
        ADMIN FUNCTIONS
    */
    function increaseWishbone(uint _wishbonesToAdd ) public isOwner {
        activeWishbones += _wishbonesToAdd;
    }
    function toggleLock() public isOwner {
        locked = ! locked;
    }
    function updateAPY(uint _newApy) public isOwner {
        require(_newApy >= 1 * mathOperator, "ERR_APY_MORE_0");
        maxApy = _newApy;
    }
    function updateRate(uint _newRate) public isOwner {
        require(_newRate >= 1 * mathOperator,  "ERR_RATE_MORE_0");
        rate = _newRate;
    }
    function updateWishboneCost(uint _newCost) public isOwner {
        require(_newCost >= 1 * decimals / 100,  "ERR_WISHCOST_MORE_0");
        wishboneCost = _newCost;
    }
    function updateGraveAddress(IERC20Burnable _GRAVE) public isOwner {
        require( _GRAVE != IERC20Burnable(address(0)), "ERR_GRAVE_ADDRESS_NOT_0");
        GRAVE = _GRAVE;
    }
    function updateRudeAddress(IERC20Mintable _RUDE) public isOwner {
        require( _RUDE != IERC20Mintable(address(0)), "ERR_RUDE_ADDRESS_NOT_0");
        RUDE = _RUDE;
    }
    function updateBankFee(uint _newFee) public isOwner {
        require( _newFee > 0, "ERR_FEE_MORE_0");
        bankFee = _newFee;
    }
    /** 
        PUBLIC FUNCTIONS 
    */
    function createContract(uint _amount, uint _duration, uint _wishbones) public notReentrant {
        require( _duration >= 1 days, "ERR_DURATION_ZERO" );
        require( _amount > 0, "ERR_AMOUNT_ZERO");
        bytes32 contractHash = keccak256(
                abi.encodePacked(
                    msg.sender,
                    userContractCount[msg.sender]
                )
            );
        uint wishboneFinalCost = _wishbones.mul(wishboneCost).mul(decimals.div(100));
        uint amountPWishbone = _amount.add( wishboneFinalCost );

        require( userContracts[contractHash].amount == 0 , "ERR_CONTRACT_ALREADY_INIT");
        require( GRAVE.balanceOf(msg.sender) >= amountPWishbone, "ERR_INSUFFICIENT_GRAVE" );
        require( GRAVE.allowance(msg.sender, address(this)) >= amountPWishbone, "ERR_INCREASE_ALLOWANCE");
        require( GRAVE.transferFrom(msg.sender, address(this), amountPWishbone), "ERR_TX_ERROR");

        UserContract memory currentContract;
        currentContract.owner = msg.sender;
        currentContract.amount = _amount;
        currentContract.startTimestamp = block.timestamp;
        currentContract.unlockTimestamp = block.timestamp.add(_duration);
        currentContract.usedWishbones = _wishbones;
        currentContract.duration = _duration;
        userContracts[contractHash] = currentContract;

        activeContracts++;
        totalContractsVolume++;
        totalGraveVolume += amountPWishbone;
        totalWishbonesVolume += _wishbones;

        activeWishbones += _wishbones;
        depositedGrave += _amount;

        emit ContractCreated(contractHash, msg.sender, userContractCount[msg.sender], _amount, block.timestamp, currentContract.unlockTimestamp);
        userContractCount[msg.sender]++;
    }

    function getActiveContracts() public view returns(uint[] memory) {
        uint contractCount = userContractCount[msg.sender];
        uint[] memory rActiveContracts = new uint[](contractCount);
        uint validCounter = 0;
        for(uint i = 0; i < contractCount; i++){
            bytes32 contractHash = keccak256(
                abi.encodePacked(
                    msg.sender,
                    i
                )
            );
            uint active = userContracts[contractHash].amount; 
            if( active > 0 ){
                rActiveContracts[validCounter] = i;
                validCounter++;
            }
        }
        return rActiveContracts;
    }

    function getPassedDays(uint contractId) public view returns(uint) {
        bytes32 contractHash = keccak256(
                abi.encodePacked(
                    msg.sender,
                    contractId
                )
            );
        return _getPassedDays(contractHash);
    }

    function claimRewards(uint _contractId) public notReentrant {
        bytes32 contractHash = keccak256(
                abi.encodePacked(
                    msg.sender,
                    _contractId
                )
            );
        UserContract memory currentContract = userContracts[contractHash];
        require( currentContract.amount > 0, "ERR_CONTRACT_CLAIMED" );
        require( currentContract.unlockTimestamp <= block.timestamp, "ERR_CONTRACT_NOT_ENDED");
        (uint rewards,,) = currentRewards(_contractId);
        uint graveAmount = userContracts[contractHash].amount;
        uint feeAmount = graveAmount.mul(bankFee).div(10000);
        graveAmount -= feeAmount;
        userContracts[contractHash].amount = 0;//disable contract
        activeContracts--;
        depositedGrave -= graveAmount;
        activeWishbones -= currentContract.usedWishbones;
        RUDE.mint( msg.sender, rewards );
        GRAVE.burn( feeAmount );
        require( GRAVE.transfer(msg.sender, graveAmount), "ERR_TX_FAILED");
        emit ContractClaimed( contractHash, msg.sender, _contractId, graveAmount, rewards, userContracts[contractHash].startTimestamp, block.timestamp );
    }

    function panicWithdraw(uint _contractId) public notReentrant {
        bytes32 contractHash = keccak256(
                abi.encodePacked(
                    msg.sender,
                    _contractId
                )
            );
        uint graveAmount = userContracts[contractHash].amount;
        userContracts[contractHash].amount = 0;
        activeContracts--;
        depositedGrave -= graveAmount;
        activeWishbones -= userContracts[contractHash].usedWishbones;
        require( GRAVE.transfer(msg.sender, graveAmount), "ERR_TX_FAILED");
        emit ContractClaimed( contractHash, msg.sender, _contractId, graveAmount, 0, userContracts[contractHash].startTimestamp, block.timestamp );
    }

    function currentRewards(uint _contractId) public view returns(uint, uint, bool) {
        bytes32 contractHash = keccak256(
                abi.encodePacked(
                    msg.sender,
                    _contractId
                )
            );
        uint amount = userContracts[contractHash].amount;
        if(amount > 0 ){
            (uint userApy, uint daysPassed, bool finished) = _getAPY(contractHash);
            uint percentOperator = 10 ** 5;
            uint rawRewards = amount.mul(userApy);
            rawRewards = rawRewards.div(100).div(percentOperator);
            uint durationPercent = percentOperator.mul( daysPassed ).div(365).div( percentOperator.div(100) );
            uint rewards = rawRewards.mul(durationPercent).div(100).div(percentOperator);
            return (rewards, userApy, finished);
        }else{
            return (0, 0, true);
        }
    }

    function getAPY(uint contractId) public view returns(uint, uint, bool) {
        bytes32 contractHash = keccak256(
                abi.encodePacked(
                    msg.sender,
                    contractId
                )
            );
        return _getAPY(contractHash);
    }

    function simulateAPY( uint _amount, uint _duration, uint _wishbones ) public view returns(uint, uint){
        uint daysPassed = _duration.mul( 10 ** 18 ).div( 1 days);
        uint depositPower = _sigmoid(_amount.div(10 ** 9), rate.div(4), _amount );
        uint stonesPower = _sigmoid(_wishbones, rate.div(2), (1 + ( activeWishbones.sub(activeContracts).sub(_wishbones) ) ).mul( 10 ** 2 ).div( activeContracts ) );
        uint durationPower = _sigmoid(daysPassed.div(10 ** 9), rate.div(4) , daysPassed);
        uint userRate = rate.sub(stonesPower).sub(durationPower).sub(depositPower);
        uint finalApy = _sigmoid(daysPassed.div( 10 ** 11), maxApy, userRate.mul(10 ** 10) );
        uint percentOperator = 10 ** 5;
        uint rawRewards = _amount.mul(finalApy);
        daysPassed = daysPassed.div( 10 ** 13);
        rawRewards = rawRewards.div(100).div(percentOperator);
        uint durationPercent = percentOperator.mul( daysPassed ).div(365).div( percentOperator.div(100) );
        uint rewards = rawRewards.mul(durationPercent).div(100).div(percentOperator);
        return (rewards, finalApy);
    }

    /** 
        INTERNAL FUNCTIONS 
    */
    function _contractTimestamp(bytes32 contractHash) internal view returns(uint) {
        uint unlockTimestamp = userContracts[contractHash].unlockTimestamp;
        if( unlockTimestamp > block.timestamp ){
            return block.timestamp;
        }else{
            return unlockTimestamp;
        }
    }

    function _getPassedDays(bytes32 contractHash) internal view returns(uint) {
        uint start = userContracts[contractHash].startTimestamp;
        uint currentContractTimestamp = _contractTimestamp(contractHash);
        uint diff = currentContractTimestamp.sub(start).mul( 10 ** 18);
        uint daysP = diff.div( 1 days );
        return daysP;
    }

    function _getAPY(bytes32 contractHash) internal view returns(uint, uint, bool){
        uint daysPassed = _getPassedDays(contractHash);
        UserContract memory currentContract = userContracts[contractHash];
        uint depositPower;
        bool finished = false;
        if( daysPassed == currentContract.duration.mul( 10 ** 18 ).div( 1 days ) ) {
            finished = true;
            depositPower = _sigmoid(currentContract.amount.div(10 ** 9), rate.div(4), currentContract.amount );
        }else{
            depositPower = _sigmoid(currentContract.amount.div(10 ** 9), rate.div(4), depositedGrave.div(activeContracts) );
        }
        uint stonesPower = _sigmoid(currentContract.usedWishbones, rate.div(2), (1 + activeWishbones.sub(currentContract.usedWishbones) ).mul( 10 ** 2 ).div(activeContracts) );
        uint durationPower = _sigmoid(daysPassed.div(10 ** 9), rate.div(4), currentContract.duration.mul( 10 ** 18 ).div( 1 days ) );
        uint userRate = rate.sub(stonesPower).sub(durationPower).sub(depositPower);
        uint finalApy = _sigmoid(daysPassed.div( 10 ** 11 ), maxApy, userRate.mul( 10 ** 10 ) );
        return (finalApy, daysPassed.div(10 ** 13), finished);
    }

    //MATH FUNCTIONS
    function _sigmoid(uint x, uint a, uint b) internal pure returns(uint) {
        uint j = x.mul(x);
        uint z = sqrt( b.add(j) );
        uint _x = x.mul(10 ** 9);
        uint sig = a.mul(_x).div(z);
        return sig.div( 10 ** 9 );
    }

    function sqrt(uint x) internal pure returns (uint y) {
        uint z = x.add(1).div(2);
        y = x;
        while (z < y) {
            y = z;
            z = x.div(z).add(z).div(2);
        }
        return y;
    }
}