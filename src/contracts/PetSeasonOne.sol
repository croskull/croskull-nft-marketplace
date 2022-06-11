// SPDX-License-Identifier: MIT
pragma solidity >=0.8.1;
/**
    Powered by Alessandro De Cristofaro ( @hiutaky ) - CroSkull NFT
 */
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IERC20Mintable.sol";
import "./interfaces/IERC20Burnable.sol";


contract PetSeasonOne is ERC721, ERC721Enumerable, AccessControl {
    using Counters for Counters.Counter;
    using SafeMath for uint;
    using SafeMath for uint8;
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant PVP_ROLE = keccak256("PVP_ROLE");
    bytes32 public constant HEALER_ROLE = keccak256("HEALER_ROLE");

    uint private decimals = 10 ** 18;

    IERC721 public baseNft;
    IERC20Burnable public experienceToken;
    IERC20Burnable public levelerToken;
    IERC20Mintable public rewardToken;

    Counters.Counter private _tokenIdCounter;

    bool private locked = false;
    string public baseURI;

    uint public maxSupply = 2200;
    //Mutable Vars
    uint public maxLevel = 10;
    uint public healInterval = 1200;//1200; // 2 hours
    uint public freezeInterval = 2400 * 4;
    uint public baseStamina = 10;

    uint public rewardPerDay = 1;
    uint public maxRewardsCompound = 7; // 1 week in days

    mapping(uint => uint) public lastClaimTimestamps;
    mapping(uint => EvoToken) private evoTokens;
    
    struct EvoToken {
        //malus
        bool sad;
        bool hungry;
        uint unfreezeBlock;
        //counters
        uint stamina;
        uint level;
        uint experience;
        uint influence;
        uint win;
        uint lose;
        //power
        uint power;//sum of all stats
        //stats
        uint strength;
        uint dexterity;
        uint constitution;
        uint intelligence;
        uint wisdom;
        //other
        uint lastActionBlock;
    }

     /**
        Modifiers
     */
    modifier ERC721App(IERC721 _ERC721Token) {
        require( 
            _ERC721Token.isApprovedForAll(msg.sender, address(this)),
            "721NA"
        );
        _;
    }

    modifier nonReentrant() {
        require( ! locked, "REENTRANT");
        locked = true;
        _;
        locked = false;
    }

    /**
        EVENTS
     */
    event Evocation( uint indexed tokenId, uint power, address owner, uint timestamp );
    event EvoOutOfStamina( uint indexed tokenId, uint timestamp );
    event EvoLevelUp( uint indexed tokenId, uint level, uint timestamp );
    event EvoBattle( uint indexed tokenWinner, uint indexed tokenLoser);
    event EvoSadMalus( uint indexed tokenId, uint power );
    event EvoFreezeMalus( uint indexed tokenId, uint unfreezeTimestamp );
    event EvoHungryMalus( uint indexed tokenId, uint stamina );
    event EvoClaim( address user, uint rewardsAmount );
    /** INIT */
    constructor(
        IERC721 _baseNft,
        IERC20Burnable _experienceToken,
        IERC20Burnable _levelerToken,
        IERC20Mintable _rewardToken,
        string memory _tokenName,
        string memory _tokenSymbol,
        string memory _ipfsURI
    ) ERC721(_tokenName, _tokenSymbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        baseNft = _baseNft;
        experienceToken = _experienceToken;
        levelerToken = _levelerToken;
        rewardToken = _rewardToken;
        baseURI = _ipfsURI;
    }


    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    /**
        DEFAULT_ADMIN_ROLE Functions
     */
    function setMaxLevel(uint _maxLevel) public onlyRole( DEFAULT_ADMIN_ROLE ) {
        require( _maxLevel > maxLevel, "LGTE");
        maxLevel = _maxLevel;
    }

    function setHealInterval(uint _healInterval) public onlyRole( DEFAULT_ADMIN_ROLE ) {
        require( healInterval != _healInterval, "HNS");
        healInterval = _healInterval;
    }
    
    function setFreezeInterval(uint _freezeInterval) public onlyRole( DEFAULT_ADMIN_ROLE ) { 
        require( freezeInterval != _freezeInterval, "FINS");
        freezeInterval = _freezeInterval;
    }

    function setBaseStamina(uint _baseStamina) public onlyRole( DEFAULT_ADMIN_ROLE ) {
        require( baseStamina != _baseStamina, "BSNS");
        baseStamina = _baseStamina;
    }
    function setBaseURI(string memory _ipfsURI) public onlyRole( DEFAULT_ADMIN_ROLE ) {
        baseURI = _ipfsURI;
    }

    /** PUBLIC VIEW FUNCTIONS */
    function getToken(uint _tokenId) 
        public 
        view 
        returns(
            EvoToken memory currentToken, 
            string memory tokenIPFS,
            bool isLevelable,
            uint nextLvlExp, 
            bool isUsable,
            bool isClaimable
        ) {
        currentToken = _getToken(_tokenId);
        tokenIPFS = tokenURI(_tokenId);
        isLevelable = _isLevelable(_tokenId);
        isUsable = _isFreeze(_tokenId) || currentToken.stamina == 0 ? false : true;
        uint nextLevel = currentToken.level < maxLevel ? currentToken.level : 0;
        nextLvlExp =
            getLevelExperience(nextLevel) >= currentToken.experience ? 
                getLevelExperience(nextLevel).sub(currentToken.experience) : 
            0;
        isClaimable = _tokenRewards(_tokenId) > 0;
    }

    function _getToken(uint _tokenId)
        internal
        view
        returns(
            EvoToken memory currentToken
        ) {
        currentToken = evoTokens[_tokenId];
        currentToken.stamina = _getStamina(_tokenId);
        currentToken.power = _getPower(_tokenId);
    }

    /** UPGRADER_ROLE FUNCTIONS  */
    function upgraderAddExperience(uint _tokenId, uint _amount) public onlyRole( UPGRADER_ROLE ) {
        require( _getStamina(_tokenId) > 1, "TOSU");
        require( ! _isFreeze(_tokenId), "TIF");
        _addExperience(_tokenId, _amount);
        evoTokens[_tokenId].lastActionBlock = block.number;
        evoTokens[_tokenId].stamina--;
    }
    /** PVP_ROLE FUNCTIONS  */
    function pvpAssignWin(uint _tokenId) public onlyRole( PVP_ROLE ) {
        require( _getStamina(_tokenId) > 1, "TOSU");
        require( ! _isFreeze(_tokenId), "TIF");
        _assignWin(_tokenId);
    }

    function pvpAssignLose(uint _tokenId) public onlyRole( PVP_ROLE ) {
        require( _getStamina(_tokenId) > 1, "TOSU");
        require( ! _isFreeze(_tokenId), "TIF");
        _assignLose(_tokenId);
    }

    function pvpHandleBattle(uint _tokenIdWin, uint _tokenIdLose, bool _isMalus) public onlyRole( PVP_ROLE ) {
        _handleBattle(_tokenIdWin, _tokenIdLose, _isMalus);
    }

    function pvpAssignFreeze(uint _tokenId) public onlyRole( PVP_ROLE ) {
        _assignFreeze(_tokenId);
    }

    function pvpAssignHungry(uint _tokenId) public onlyRole( PVP_ROLE ) {
        _assignHungry(_tokenId);
    }

    function pvpAssignSad(uint _tokenId) public onlyRole( PVP_ROLE ) {
        _assignSad(_tokenId);
    }
    /** 
        HEALER_ROLE FUNCTIONS  
    */
    function healerRestoreStamina(uint _tokenId) public onlyRole( HEALER_ROLE ) {
        _restoreStamina(_tokenId, _getMaxStamina(_tokenId));
    }
    function healerRemoveHungry(uint _tokenId) public onlyRole( HEALER_ROLE ) {
        evoTokens[_tokenId].hungry = false;
        _maybeRestoreStamina(_tokenId);
    }
    function healerRemoveSad(uint _tokenId) public onlyRole( HEALER_ROLE ) {
        evoTokens[_tokenId].sad = false;
        _maybeRestoreStamina(_tokenId);
    }
    function healerRemoveFreeze(uint _tokenId) public onlyRole( HEALER_ROLE ) {
        evoTokens[_tokenId].unfreezeBlock = 0;
        _maybeRestoreStamina(_tokenId);
    }
    /** 
        PUBLIC SET FUNCTIONS
    */
    function claimRewards( ) public nonReentrant {
        bool isRewardable = false;
        uint rewards = 0;
        uint balance = balanceOf(msg.sender);
        require( balance > 0, "ERR_NO_PET");
        for( uint i = 0; i < balance; i++){
            uint tokenId = tokenOfOwnerByIndex(msg.sender, i);
            uint lastClaim = lastClaimTimestamps[tokenId];
            if( lastClaim > 0 ){
                uint delta = block.timestamp.sub(lastClaim);
                uint passedDays = delta.div(1 days);
                rewards += passedDays > 0 ? 
                    passedDays > maxRewardsCompound ?
                        maxRewardsCompound :
                        passedDays
                    : 0;
                if( passedDays > 0 ){
                    lastClaimTimestamps[tokenId] = block.timestamp; 
                    isRewardable = passedDays > 0;
                }
            }
        }
        if( rewards > 0 ){
            rewardToken.mint(msg.sender, rewards);
            emit EvoClaim(msg.sender, rewards);
        }
    }

    function hasRewards(address user) public view returns(bool isRewardable, uint rewards) {
        isRewardable = false;
        rewards = 0;
        for( uint i = 0; i < balanceOf(user); i++){
            uint tokenId = tokenOfOwnerByIndex(user, i);
            rewards += _tokenRewards(tokenId);
        }
        if( rewards > 0 )
            isRewardable = true;
    }

    function _tokenRewards(uint tokenId) public view returns( uint rewards ) {
        uint lastClaim = lastClaimTimestamps[tokenId];
        if( lastClaim > 0 ){
            uint delta = block.timestamp.sub(lastClaim);
            uint passedDays = delta.div(1 days);
            rewards += passedDays > 0 ? 
                passedDays > maxRewardsCompound ?
                    maxRewardsCompound :
                    passedDays
                : 0;
        }
    }

    function addExperience(uint _tokenId, uint _amount) public nonReentrant {
        require( this.ownerOf(_tokenId) == msg.sender, "NOWN" );
        require( experienceToken.allowance(msg.sender, address(this)) >= _amount, "ETA");
        experienceToken.burnFrom(msg.sender, _amount);
        _addExperience(_tokenId, _amount);
    }

    function levelUp(uint _tokenId) public nonReentrant {
        require( this.ownerOf(_tokenId) == msg.sender, "NOWN" );
        uint upgradeCost = getUpgradeCost(_tokenId);
        require( levelerToken.allowance(msg.sender, address(this)) >= upgradeCost, "LTA");
        levelerToken.burnFrom(msg.sender, upgradeCost);
        _levelUp(_tokenId);
    }

    function getUpgradeCost(uint _tokenId) public view returns(uint upgradeCost) {
        upgradeCost = evoTokens[_tokenId].level.add(1).mul(10).add(40).mul(decimals);
    }

    function batchEvocation(uint[] memory ids) public ERC721App(baseNft) nonReentrant {
        require( ids.length > 0, "SELECT_>_0_TOKENID");
        require( ids.length <= 15, "SAFE_MAX_MINT" ); // safe limit
        for( uint i = 0; i < ids.length; i++ ){
            uint tokenId = _tokenIdCounter.current();
            if( tokenId < maxSupply ){ // not max supply
                if( baseNft.ownerOf(ids[i]) == msg.sender ){ // is owner of
                    baseNft.transferFrom(msg.sender, address(this), ids[i]);
                    require( baseNft.ownerOf(ids[i]) == address(this), "ERR_TX");
                    _tokenIdCounter.increment();
                    uint currentToken = _tokenIdCounter.current();
                    _safeMint( msg.sender, currentToken );
                    EvoToken memory newEvo;
                    uint baseStat = 4;
                    if( isLegendary(currentToken) ){
                        baseStat = 5;
                    }
                    newEvo.level = 0;
                    newEvo.experience = 0;
                    newEvo.stamina = baseStamina;
                    newEvo.strength = baseStat;
                    newEvo.dexterity = baseStat;
                    newEvo.constitution = baseStat;
                    newEvo.intelligence = baseStat;
                    newEvo.wisdom = baseStat;
                    newEvo.lastActionBlock = block.number;
                    newEvo.power = baseStat.mul(5);
                    evoTokens[currentToken] = newEvo;
                    lastClaimTimestamps[currentToken] = block.timestamp;
                    emit Evocation(currentToken, newEvo.power, msg.sender, block.timestamp);
                }
            }
        }
    }

    function isLegendary(uint id) internal view returns(bool isLegend){
        if( id == 59 || id == 492 || id == 931 || id == 1204 || id == 1648 || id == 2145 ){
            return true;
        }else{
            return false;
        }
    }

    /** 
        INTERNAL PVP FUNCTIONS
     */

    function _maybeRestoreStamina( uint _tokenId ) internal {
        uint farmedStamina = _getFarmed(_tokenId);
        if( farmedStamina > 0){
            _restoreStamina(_tokenId, farmedStamina );
            evoTokens[_tokenId].lastActionBlock = block.number;
        }
    }

    function _handleBattle(uint _tokenIdWin, uint _tokenIdLose, bool _isMalus) internal {
        require( ! _isFreeze(_tokenIdWin), "TKF0" );
        require( _getStamina(_tokenIdWin) > 0, "TOS0" );
        require( ! _isFreeze(_tokenIdLose), "TKF1" );
        require( _getStamina(_tokenIdLose) > 0, "TOS1" );
        _assignWin(_tokenIdWin);
        _assignLose(_tokenIdLose);
        if( _isMalus ){
            //assign malus
            uint[2] memory players = [_tokenIdWin, _tokenIdLose];
            _assignMalus( 
                players, 
                evoTokens[_tokenIdLose].lose
                    .add( evoTokens[_tokenIdWin].influence.add(1) ) 
            );
        }
        emit EvoBattle(_tokenIdWin, _tokenIdLose);
    }

    function _assignWin(uint _tokenId) internal {
        _maybeRestoreStamina(_tokenId);
        evoTokens[_tokenId].stamina--;
        evoTokens[_tokenId].win++;
        evoTokens[_tokenId].influence++;
    }

    function _assignLose(uint _tokenId) internal {
        _maybeRestoreStamina(_tokenId);
        evoTokens[_tokenId].stamina--;
        evoTokens[_tokenId].lose++;
        evoTokens[_tokenId].influence = evoTokens[_tokenId].influence > 0 ? evoTokens[_tokenId].influence-- : 0;
    }

    function _assignMalus(uint[2] memory _players, uint randCoeff) internal {
        uint randBase = 1000;
        uint isMalus = random(
            randCoeff.mul(
                levelerToken.totalSupply()
            )
        ) % randBase;
        if( isMalus > 800 ) {
             // even : malus to winner | odd : malus to loser 
            uint _malusTokenId = isMalus.div(2).mul(2) == isMalus ? _players[0] : _players[1];
            uint subDiff = randBase.sub(isMalus);
            if( subDiff >= 66 && subDiff < 132 ){
                _assignSad(_malusTokenId);
            }else if( subDiff >= 132 ){
                _assignHungry(_malusTokenId);
            }else{
                _assignFreeze(_malusTokenId);
            }
        }
    }

    function _assignFreeze(uint _tokenId) internal {
        evoTokens[_tokenId].unfreezeBlock = block.number.add(freezeInterval);
        emit EvoFreezeMalus(_tokenId, evoTokens[_tokenId].unfreezeBlock);
    }

    function _assignHungry(uint _tokenId) internal {
        evoTokens[_tokenId].hungry = true;
        emit EvoHungryMalus(_tokenId, _getStamina(_tokenId) );
    }

    function _assignSad(uint _tokenId) internal {
        evoTokens[_tokenId].sad = true;
        emit EvoSadMalus(_tokenId, _getPower(_tokenId) );
    }

    /** 
        INTERNAL STMAINA FUNCTIONS
     */
    function _restoreStamina( uint _tokenId, uint _amount ) internal {
        if( evoTokens[_tokenId].stamina.add(_amount) <= _getMaxStamina(_tokenId) ){
            evoTokens[_tokenId].stamina += _amount;
        }else{
            evoTokens[_tokenId].stamina = _getMaxStamina(_tokenId);
        }
    }

    function _getPower(uint _tokenId) internal view returns(uint) {
        uint cPower = evoTokens[_tokenId].power;
        bool isSad = evoTokens[_tokenId].sad;
        cPower = isSad ? cPower.sub(5) : cPower;
        return cPower;
    }

    function _getMaxStamina(uint _tokenId) internal view returns(uint maxStamina) {
        maxStamina = baseStamina.add(evoTokens[_tokenId].level);
    }
    
    function _getStamina(uint _tokenId) internal view returns(uint) {
        uint cStamina = evoTokens[_tokenId].stamina;
        uint hungryMalus = evoTokens[_tokenId].hungry ? cStamina >= 5 ? 5 : cStamina : 0;
        uint farmedStamina = _getFarmed(_tokenId);
        uint evoMaxStamina = _getMaxStamina(_tokenId);
        cStamina = 
            cStamina.add(farmedStamina) <= evoMaxStamina ? 
                cStamina.add(farmedStamina).sub(hungryMalus) : 
                evoMaxStamina.sub(hungryMalus);
        return cStamina;
    }

    function _getFarmed(uint _tokenId) internal view returns(uint farmedStamina) {
        uint cLastBlock = evoTokens[_tokenId].lastActionBlock;
        uint blockDiff = block.number >= cLastBlock ? block.number.sub(cLastBlock) : 0;
        farmedStamina = blockDiff >= healInterval ? blockDiff.div(healInterval) : 0;
    }

    function _isFreeze(uint _tokenId) internal view returns(bool isFreeze) {
        isFreeze = evoTokens[_tokenId].unfreezeBlock > block.number;
    }

    function _isLevelable( uint _tokenId ) internal view returns(bool isLevelable){
        isLevelable = 
            evoTokens[_tokenId].level < maxLevel &&
            evoTokens[_tokenId].experience >= getLevelExperience(evoTokens[_tokenId].level) ? 
                true : 
            false;
    }

    function getLevelExperience( uint _level ) internal pure returns(uint experience) {
        experience = (2 ** _level).mul(10);
    } 
    /** 
        INTERNAL UPGRADER FUNCTIONS
     */
    function _levelUp( uint _tokenId ) internal {
        EvoToken memory currentToken = evoTokens[_tokenId];
        require( _isLevelable(_tokenId), "TNL");
        currentToken.level++;
        currentToken.strength++;
        currentToken.dexterity++;
        currentToken.constitution++;
        currentToken.intelligence++;
        currentToken.wisdom++;
        currentToken.power += 5;
        currentToken.stamina = baseStamina.add(currentToken.level);
        evoTokens[_tokenId] = currentToken;
        emit EvoLevelUp(_tokenId, currentToken.level, block.timestamp);
    }


    function _addExperience( uint _tokenId, uint _amount ) internal {
        evoTokens[_tokenId].experience += _amount;
        _maybeRestoreStamina(_tokenId);
    }

    /** Math Internal Functions */
    function random(uint nonce) internal view returns (uint) {
        uint randomNumber = uint(keccak256(
            abi.encode(
                block.number, 
                block.timestamp,
                msg.sender,
                nonce
            ) 
        ));
        return randomNumber;
    }

    //ERC721
    function onERC721Received(address, address, uint256, bytes memory) public virtual returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata");
        string memory baseExt = ".json";
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), baseExt)) : "";
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721) {
        super._burn(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}