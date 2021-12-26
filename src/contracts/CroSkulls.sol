// SPDX-License-Identifier: MIT
pragma solidity <0.8.0;
pragma abicoder v2;

// import ERC721 iterface
import "./ERC721.sol";

// CroSkulls smart contract inherits ERC721 interface
contract CroSkulls is ERC721 {
  using SafeMath for uint256;

  string public collectionName;
  string public collectionNameSymbol;
  uint256 public croSkullCounter;
  uint256 public cost = 1 ether;
  uint256 public maxSupply = 6666;
  uint256 public maxMintAmount = 5;
  uint256 public nftPerAddressLimit = 100;
  uint256 public rewardPoolsCounter;
  uint256 public totalRewardPercent;
  address public owner;
  address public manager;
  uint256 public marketplaceFee = 4;
  //diego

  mapping(uint256 => CroSkull) public allCroSkulls;
  mapping(address => uint256) public addressMintedBalance;
  mapping(string => bool) public tokenURIExists;
  mapping(string => bool) public settings;
  mapping(address => bool) public whitelist;
  mapping(address => uint256) public rewardableUsers; //keep track of rewardable users
  mapping(address => uint256) public userClaimedRewards; // keep track of withdrawed amount
  uint256 public totalCROVolume = 0;//keep track of total rewardable CRO volume, used to calculate rewards

  struct CroSkull {
    uint256 tokenId;
    address payable mintedBy;
    address payable currentOwner;
    address payable previousOwner;
    uint256 price;
    uint256 numberOfTransfers;
    bool forSale;
  }


  modifier isWithdrable() {
    require(settings['isWithdraw'], "Withdraw disabled");
    _;
  }

  modifier onlyManager() {
    if( msg.sender != owner ){
      require(msg.sender == manager, "not a manager");
    }
    _;
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  modifier isWhitelisted() {
    if( settings['isWhitelist'] ){
      require( whitelist[msg.sender], " not whitelisted" );
    }
    _;
  }

  modifier marketplaceEnabled() {
    require( settings['isMarketplace'], "Marketplace disabled.");
    _;
  }

  // initialize contract while deployment with contract's collection name and token
  constructor( bool _isMarketplace, bool _isWhitelist, bool _isWithdraw ) ERC721("CROSkull", "CRS") {
    owner = msg.sender;
    collectionName = name();
    collectionNameSymbol = symbol();
    settings['isMarketplace'] = _isMarketplace;
    settings['isWhitelist'] = _isWhitelist;
    settings['isWithdraw'] = _isWithdraw;
  }

  function setBaseURI( string memory baseURI ) public onlyOwner {
    _setBaseURI(baseURI);
  }

  //retunr allowed max supply
  function getMaxSupply( ) public view returns(uint256){
    return maxSupply;
  }

  function getCost() public view returns(uint256){
    return cost;
  }

  function addToWhitelist( address _address ) public onlyManager {
    require( settings['isWhitelist'] );
    require( ! whitelist[_address]);
    whitelist[_address] = true; 
  }

  function setMarketplaceFee( uint _fee) public onlyManager {
    require(marketplaceFee != _fee);
    marketplaceFee = _fee;
  }

  // mint a new crypto boy
  function mintCroSkull(uint256 _mintAmount ) isWhitelisted payable external {
    require(msg.sender != address(0));
    require(_mintAmount > 0);
    require(_mintAmount <= maxMintAmount);
    require(msg.value >= cost * _mintAmount);


    uint256 supply = totalSupply();
    require(supply + _mintAmount <= maxSupply);
    
    for (uint256 i = 1; i <= _mintAmount; i++) {
      croSkullCounter++;
      require(!_exists(croSkullCounter));

      addressMintedBalance[msg.sender]++;
      _mint(msg.sender, croSkullCounter);
      CroSkull memory newCroSkull = CroSkull(
        croSkullCounter,
        msg.sender,
        msg.sender,
        address(0),
        cost,
        0,
        false
      );
      allCroSkulls[croSkullCounter] = newCroSkull;
    }
    totalCROVolume = totalCROVolume.add( msg.value );
  }

  function getOwner() public view returns(address) {
    return owner;
  }

  function getManager() public view returns(address) {
    return manager;
  }

  function setManager(address _manager) public onlyOwner() {
    require(_manager != address(0));
    require(_manager != manager);
    manager = _manager;
  }
  function getTokenOwner(uint256 _tokenId) public view returns(address) {
    address _tokenOwner = ownerOf(_tokenId);
    return _tokenOwner;
  }

  function getTokenMetaData(uint _tokenId) public view returns(string memory) {
    string memory tokenMetaData = tokenURI(_tokenId);
    return tokenMetaData;
  }

  function getNumberOfTokensMinted() public view returns(uint256) {
    uint256 totalNumberOfTokensMinted = totalSupply();
    return totalNumberOfTokensMinted;
  }

  function getTotalNumberOfTokensOwnedByAnAddress(address _owner) public view returns(uint256) {
    uint256 totalNumberOfTokensOwned = balanceOf(_owner);
    return totalNumberOfTokensOwned;
  }
  function getTokenExists(uint256 _tokenId) public view returns(bool) {
    bool tokenExists = _exists(_tokenId);
    return tokenExists;
  }
  function buyToken(uint256 _tokenId) public marketplaceEnabled payable {
    require( settings['isMarketplace']);
    require(msg.sender != address(0));
    require(_exists(_tokenId));

    address tokenOwner = ownerOf(_tokenId);

    require(tokenOwner != address(0));
    require(tokenOwner != msg.sender);

    CroSkull memory croskull = allCroSkulls[_tokenId];

    require(msg.value >= croskull.price);
    require(croskull.forSale);

    _transfer(tokenOwner, msg.sender, _tokenId);
    address payable sendTo = croskull.currentOwner;
    uint256 sellerAmout = msg.value
      .mul( 100 - marketplaceFee )
      .div(100);
    sendTo.transfer(sellerAmout);
    croskull.previousOwner = croskull.currentOwner;
    croskull.currentOwner = msg.sender;
    croskull.numberOfTransfers += 1;
    croskull.forSale = false;
    allCroSkulls[_tokenId] = croskull;
    
    totalCROVolume = totalCROVolume.add( msg.value.sub(sellerAmout) );
  }

  function changeTokenPrice(uint256 _tokenId, uint256 _newPrice) public marketplaceEnabled {
    require(msg.sender != address(0));
    require(_exists(_tokenId));
    address tokenOwner = ownerOf(_tokenId);
    require(tokenOwner == msg.sender);
    CroSkull memory croskull = allCroSkulls[_tokenId];
    croskull.price = _newPrice;
    allCroSkulls[_tokenId] = croskull;
  }

  function toggleForSale(uint256 _tokenId) public marketplaceEnabled {
    require(msg.sender != address(0));
    require(_exists(_tokenId));
    address tokenOwner = ownerOf(_tokenId);
    require(tokenOwner == msg.sender);
    CroSkull memory croskull = allCroSkulls[_tokenId];
    if(croskull.forSale) {
      croskull.forSale = false;
    } else {
      croskull.forSale = true;
    }
    allCroSkulls[_tokenId] = croskull;
  }

  function toggleSetting( string calldata _settings) public onlyManager {
    settings[_settings] = !settings[_settings];
  }

  function setNftPerAddressLimit(uint256 _limit) public onlyManager {
    nftPerAddressLimit = _limit;
  }
  
  function setCost(uint256 _newCost) public onlyManager {
    cost = _newCost;
  }

  function setmaxMintAmount(uint256 _newmaxMintAmount) public onlyManager {
    maxMintAmount = _newmaxMintAmount;
  }

  function addRewardable(address _rewardableAddress, uint256 percent) public onlyOwner {
    require( rewardableUsers[_rewardableAddress] <= 0 );
    require( totalRewardPercent + percent <= 1000 );
    require( percent < 231);
    rewardableUsers[_rewardableAddress] = percent;
    userClaimedRewards[_rewardableAddress] = 0;
  }

  function withdrawReward() public payable isWithdrable {
    uint256 calculatedReward = getRewardValue();
    require( calculatedReward <= totalCROVolume );
    userClaimedRewards[msg.sender] = userClaimedRewards[msg.sender].add(calculatedReward);
    (bool os, ) = payable(msg.sender).call{value: calculatedReward}("");
    require(os);
  }

  function getRewardValue() public view returns(uint256){
    uint256 fee = rewardableUsers[msg.sender];
    require( fee > 0);
    //check already recived rewards
    uint256 rawRewards = totalCROVolume
      .div(1000)
      .mul(fee);

    uint256 alreadyClaimed = userClaimedRewards[msg.sender];
    uint256 claimableRewards = rawRewards.sub(alreadyClaimed);
    assert(rawRewards >= claimableRewards);
    assert(address(this).balance >= claimableRewards);
    return claimableRewards;
  }

  function getRewardFee() public view returns(uint256){
    return rewardableUsers[msg.sender];
  }
}