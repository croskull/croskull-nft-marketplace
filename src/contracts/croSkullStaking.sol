// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma abicoder v2;

import "./interface/IERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract croSkullStaking is IERC721Receiver {
    using SafeMath for uint;

    //Mutable Main settings
    address public owner;
    uint16 public stakedSkullsCount;
    bool public started;

    //Contracts
    IERC20Burnable public rewardToken;
    IERC20 public soulToken;
    IERC721 public croSkullContract;

    //NFT Supply
    uint16 croSkullContractMaxSupply = 6666;

    //Pool settings
    uint public percentOperator = 1000;
    uint public poolRewardSupply;
    uint public poolWithdrawedAmount;
    uint public poolWithdrawedSouls;
    uint public startStakeTimestamp;
    uint public endStakeTimestamp;
    uint public vestingDuration = 100 days;
    uint public cycleInterval = 10 seconds;
    uint public soulsDropInterval = 30 days;
    uint public stakeMalusDuration = 32 days;
    uint public stakeMalusFee = 80;
    uint public safeMaxUnstake = 50;

    bool internal locked;

    mapping( address => UserInfo ) public userDetails;

    struct UserInfo {
        uint16 tokenCount;
        uint16[] tokensIds;
        uint lastWithdrawTimestamp;
        uint startingStake;
        uint availableBalance;
        uint alreadyClaimed;
        bool enabled;
    }


    mapping( bytes32 => bool ) public skullsOwner;

    modifier onlyOwner() {
        require(
            msg.sender == owner, 
            "ERR_NOT_OWNER"
        );
        _;
    }

    modifier isApproved() {
        require( 
            approvalStatus(),
            "ERR_APPROVE_CONTRACT" 
        );
        _;
    }

    modifier isStake() {
        require( 
            startStakeTimestamp > 0,
            "ERR_STAKING_DISABLED" 
        );
        _;
    }

    modifier noReentrant() {
        require(
            !locked, 
            "ERR_NO_REENTRNACY"
        );
        locked = true;
        _;
        locked = false;
    }

    modifier isSafeStake( uint _length ) {
        require( 
            _length <= safeMaxUnstake,
            "ERR_50_STAKE_LIMIT" 
        );
        _;
    }

    modifier notEnded() {
        require(
            block.timestamp <= endStakeTimestamp,
            "ERR_STAKE_ENDED"
        );
        _;
    }
    event Stake(address indexed user, uint16 tokenId);
    event unStake(address indexed user, uint16 tokenId);
    event Withdraw(address indexed user, uint256 amout);

    constructor ( ) {
        owner = msg.sender;
        startStakeTimestamp = 0;
    }

    /* 
        Only owner methods
    */
    function adminUnlock () public onlyOwner {
        require( locked );
        locked = !locked;
    }

    function adminLock () public onlyOwner {
        require( !locked );
        locked = true;
    }

    function adminEndStake() public onlyOwner {
        endStakeTimestamp = block.timestamp;
    }

    function adminUnstake (uint16 _tokenId, address _ownerOf ) public onlyOwner {
        _unstakeSkull( _ownerOf, _tokenId );
    }

    function startRewards() public onlyOwner {
        require( startStakeTimestamp == 0, "ERR_SEASON_STARTED");
        startStakeTimestamp = block.timestamp;
        endStakeTimestamp = startStakeTimestamp.add( vestingDuration );
        started = true;
    }

    function fundRewardPool() public onlyOwner {
        poolRewardSupply = rewardToken.balanceOf( address(this) );
    }

    function adminBurnUnvested () public onlyOwner {
        require( startStakeTimestamp > 0 );
        uint contractBalance = rewardToken.balanceOf( address(this) );
        require( contractBalance > 0 );
        rewardToken.transfer( owner, contractBalance );
    }

    function setNFTAddress( IERC721 _nftContract ) public onlyOwner {
        croSkullContract = _nftContract;
    }

    function setTokenAddress( IERC20Burnable _tokenAddress ) public onlyOwner {
        rewardToken = _tokenAddress;
    }

    function setSoulToken( IERC20 _soulToken ) public onlyOwner {
        soulToken = _soulToken;
    }

    /* public view function */
    function _rewardPerCycles() public view returns(uint) { 
        uint rewardPerCycles = poolRewardSupply
            .div(vestingDuration)
            .mul(cycleInterval);
        return rewardPerCycles;
    }

    /**
       Modifier: isApproved || isWithdraw || isStake for stakeholders public methods 
     */

    function batchStakeSkulls( uint16[] memory _tokenIds ) public isApproved isStake notEnded isSafeStake( _tokenIds.length ) noReentrant {
        address _from = msg.sender;
        require( _tokenIds.length > 0 );
        for( uint i = 0; i < _tokenIds.length; i++ ){
            _stakeSkull(_from, _tokenIds[i]);
        }
    }

    function batchUnstakeSkulls( uint16[] memory _tokenIds ) public isApproved isStake isSafeStake( _tokenIds.length ) noReentrant {
        address _to = msg.sender;
        require( _tokenIds.length > 0, "ERR_SELECT_SOME_SKULLS" );
        for( uint i = 0; i < _tokenIds.length; i++ ){
            _unstakeSkull( _to , _tokenIds[i] );
        }
    }


    function stakeSkull ( uint16 _tokenId ) public isApproved isStake notEnded noReentrant {
        address _from = msg.sender;
        _stakeSkull(_from, _tokenId);
    }

    function unstakeSkull ( uint16 _tokenId ) public isApproved isStake noReentrant {
        address _to = msg.sender;
        UserInfo storage currentUser = userDetails[_to];
        uint skullsAmount = currentUser.tokenCount;
        require( skullsAmount > 0, "ERR_NO_SKULLS_STAKED" );
        if( currentUser.tokenCount > 0 ){
            _unstakeSkull(_to, _tokenId);
        }
    }

    function _stakeSkull(address _from, uint16 _tokenId  ) private {
        //[keccka256|address:owner][keccka256|uint16:tokenId]
        bytes32 tokenHash = keccak256(
            abi.encodePacked(
                _from,
                _tokenId
            )
        );
        if ( croSkullContract.ownerOf(_tokenId) != _from  ) // skull already staked || not owner
            return;

        UserInfo storage currentUser = userDetails[_from];
        if( currentUser.tokenCount == 0 && currentUser.lastWithdrawTimestamp == 0 ) {
            currentUser.lastWithdrawTimestamp = _currentTimestamp();
            currentUser.availableBalance = 0;
            currentUser.enabled = true;
        }else{
            uint userRewards = calculateRewards();
            currentUser.availableBalance = userRewards;
        }

        currentUser.startingStake = _currentTimestamp();
        currentUser.tokensIds.push(_tokenId);
        currentUser.tokenCount++;
        userDetails[_from] = currentUser;
        skullsOwner[tokenHash] = true;
        stakedSkullsCount++;
        croSkullContract.transferFrom( _from, address(this), _tokenId );
        
        emit Stake(_from, _tokenId);
    }

    function _currentTimestamp() internal view returns(uint) {
        if( block.timestamp <= endStakeTimestamp ) {
            return block.timestamp;
        }else{
            return endStakeTimestamp;
        }
    }

    function _unstakeSkull(address _to, uint16 _tokenId ) private {
        bytes32 tokenHash = keccak256(
            abi.encodePacked(
                _to,
                _tokenId
            )
        );
        if( skullsOwner[tokenHash] ) {
            uint userRewards = calculateRewards();
            userDetails[_to].availableBalance = userRewards;
            userDetails[_to].tokenCount--;
            userDetails[_to].startingStake = _currentTimestamp();
            croSkullContract.transferFrom(address(this), _to, _tokenId);
            skullsOwner[tokenHash] = false;
            stakedSkullsCount--;
            _removeTokenId(_tokenId, _to);
            emit unStake(_to, _tokenId);
        }
    }

    function withdraw () public isApproved noReentrant {
        address _to = msg.sender;
        require( userDetails[_to].startingStake > 0 );
        (uint userRewards, uint calculatedMalus ) = calculateRewardsPlusMalus();
        if( userRewards > 0 ){
            require( rewardToken.balanceOf( address(this) ) >= userRewards );
            require( rewardToken.transfer( _to, userRewards ) );
            rewardToken.burn( calculatedMalus );
            uint droppedSouls = calculateDroppedSouls();
            if( droppedSouls > 0 ){
                require( soulToken.balanceOf( address(this) ) >= droppedSouls );
                require( soulToken.transfer( _to, droppedSouls ) );
                poolWithdrawedSouls += droppedSouls;
            }
            poolWithdrawedAmount += userRewards;
            uint currentTimestamp = _currentTimestamp();
            userDetails[_to].lastWithdrawTimestamp = currentTimestamp;
            userDetails[_to].startingStake = currentTimestamp;
            userDetails[_to].alreadyClaimed += userRewards;
            userDetails[_to].availableBalance = 0;
        }
    }

    function _tenSecCyclesPassed () public view isApproved returns(uint) {
        require( startStakeTimestamp > 0 );
        uint currentTimestamp = _currentTimestamp();
        uint actualStakeMinutes = currentTimestamp
            .sub(userDetails[msg.sender].startingStake);

        if( actualStakeMinutes >= 10 ){
            actualStakeMinutes = actualStakeMinutes
                .div( 10 seconds );
        }else{
            actualStakeMinutes = 0;
        }
        //( _currentTimestamp() - userDetails[msg.sender].startingStake ) / 10 seconds;
        return actualStakeMinutes;
    }

    function _tenSecCyclesPassedLastWithdraw () public view isApproved returns(uint) {
        require( startStakeTimestamp > 0 );
        uint currentTimestamp = _currentTimestamp();
        uint actualStakeMinutes = currentTimestamp
            .sub(userDetails[msg.sender].lastWithdrawTimestamp);

        if( actualStakeMinutes >= 10 ){
            actualStakeMinutes = actualStakeMinutes
                .div( 10 seconds );
        }else{
            actualStakeMinutes = 0;
        }
        //( currentTimestamp - userDetails[msg.sender].lastWithdrawTimestamp ) / 10 seconds;
        return actualStakeMinutes;
    }

    function calculateDroppedSouls() public view isApproved isStake returns (uint) {
        UserInfo storage tempUser = userDetails[msg.sender];
        uint16 tokenCount = tempUser.tokenCount; // total staked nfts

        uint totalActiveSeconds = _tenSecCyclesPassedLastWithdraw() // 1200 s
            .mul(10);

        uint totalMinedSouls = totalActiveSeconds
            .div(soulsDropInterval)
            .mul(tokenCount);

        return totalMinedSouls;
    }

    function daysSinceLastWithdraw() public view isApproved isStake returns( uint, uint ) {
        uint userActiveCycles = _tenSecCyclesPassedLastWithdraw(); 
        uint totalSecondsPassed = userActiveCycles
            .mul(cycleInterval);

        uint nDaysPassed;
        
        if( 1 days > totalSecondsPassed ){
            nDaysPassed = 0;
        }else{
            nDaysPassed = totalSecondsPassed
                .div(1 days);
        }
        return (
            nDaysPassed,
            totalSecondsPassed
        );
    }

    function calculateMalusFee() public view isApproved isStake returns( uint ) {
        ( uint nDaysPassed, uint totalSecondsPassed ) = daysSinceLastWithdraw();
        uint MalusFee = 0;
        
        if( totalSecondsPassed < stakeMalusDuration ){
            uint stakeMalusInDays = stakeMalusDuration
                .div(1 days);

            uint malusDays = stakeMalusInDays // 32 - 1
                .sub(nDaysPassed); // 31

            uint malusCoef = malusDays
                .mul(percentOperator)
                .div(stakeMalusInDays)
                .mul(100)
                .div(percentOperator);

            MalusFee = stakeMalusFee // 80
                .mul(percentOperator) // 80 000
                .div(100)// 800
                .mul(malusCoef)//
                .div(percentOperator);
        }
        return MalusFee;
    }

    function calculateRewardsPlusMalus() public view isApproved isStake returns( uint, uint ) {
        uint calulcatedMalusFee = calculateMalusFee();
        uint rewardAmount = calculateRewards();
        uint calculatedMalus = rewardAmount
                .div(100)
                .mul(calulcatedMalusFee);

        uint userRewardsPlusMalus = rewardAmount
            .sub(calculatedMalus);

        return (userRewardsPlusMalus, calculatedMalus );
    }

    function calculateRewards() public view isApproved isStake returns(uint) {
        UserInfo storage tempUser = userDetails[msg.sender];
        uint16 tokenCount = tempUser.tokenCount;

        uint availableBalance = tempUser.availableBalance;
        uint userActiveCycles = _tenSecCyclesPassed();

        uint rewardPerCycles = _rewardPerCycles();
        uint rewardPerSkull = rewardPerCycles
            .div(croSkullContractMaxSupply);

        uint userRewardPerCycle = rewardPerSkull
            .mul(tokenCount);

        uint generatedRewards = userRewardPerCycle
            .mul(userActiveCycles);

        uint totalBalance = generatedRewards
            .add(availableBalance);

        return totalBalance;
    }

    /* Token utils */
    function getTokensIds() public view returns( uint16[] memory ) {
        UserInfo memory currentUser = userDetails[msg.sender];
        return currentUser.tokensIds;
    }

    function getUserTokensIds( address _ownerOf ) public view returns( uint16[] memory ) {
        UserInfo memory currentUser = userDetails[_ownerOf];
        return currentUser.tokensIds;
    }


    function checkOwnership( uint16 _tokenId ) public view returns( bool ) {
        bytes32 tokenHash = keccak256(
            abi.encodePacked(
                msg.sender,
                _tokenId
            )
        );
        bool isStaker  = ( skullsOwner[tokenHash] );
        return isStaker;
    }

    /* Internal utils functions */
    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function approvalStatus() public view returns (bool) {
        return croSkullContract.isApprovedForAll(msg.sender, address(this));
    }

    function _removeTokenId(uint16 _tokenId, address _from ) internal {
        uint16[] storage tokens = userDetails[_from].tokensIds;
        if( tokens.length == 1 && tokens[0] == _tokenId ){
            uint16[] memory emptyArray;
            userDetails[_from].tokensIds = emptyArray;
            return;
        }
        uint index = getTokenIndex(_tokenId, _from);
        //remove
        if( index < tokens.length ) {
            for (uint i = index; i < tokens.length - 1; i++) {
                tokens[i] = tokens[i + 1];
            }
            tokens.pop();
            userDetails[_from].tokensIds = tokens;
        }
    }

    function getTokenIndex ( uint16 _tokenId, address _from) public view returns( uint ) {
        uint index = 0;
        uint16[] memory tokens = userDetails[_from].tokensIds;
        for( uint i = 0; i < tokens.length; i++) {
            if( _tokenId == tokens[i]){
                return i;
            }
        }
        return index;
    }
}