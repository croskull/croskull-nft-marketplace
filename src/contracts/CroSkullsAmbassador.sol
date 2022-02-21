// SPDX-License-Identifier: MIT
pragma solidity  <=0.8.0; //use 0.7.6 compiler
pragma abicoder v2;

// import ERC721 iterface
import "./ERC721.sol";

// CroSkulls smart contract inherits ERC721 interface
contract CroSkullsAmbassador is ERC721 {
  using SafeMath for uint256;

  string public collectionName;
  string public collectionNameSymbol;
  uint256 public croSkullCounter;
  address public owner;
  uint256 public waitDuration = 1 days;

  mapping(uint256 => CroSkull) public allCroSkulls;
  mapping(address => uint256) public addressMintedBalance;
  mapping(address => uint256) public lastMintTimestamps;

  struct CroSkull {
    uint256 tokenId;
    address mintedBy;
    address currentOwner;
    address previousOwner;
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  // initialize contract while deployment with contract's collection name and token
  constructor( ) ERC721("CroSkulls Test", "CST") {
    owner = msg.sender;
    collectionName = name();
    collectionNameSymbol = symbol();
  }

  function setBaseURI( string memory baseURI ) public onlyOwner {
    _setBaseURI(baseURI);
  }

  // mint a new crypto boy
  function mintCroSkulls() public {
    address _to = msg.sender;
    uint256 lastMint = lastMintTimestamps[_to];
    uint256 currentTimestamp = block.timestamp;
    uint256 timeDiff = currentTimestamp - lastMint;
    require(  timeDiff >= waitDuration, "ERR_LIMIT_REACHED" );
    lastMintTimestamps[_to] = currentTimestamp;
    for (uint256 i = 1; i <= 10; i++) {
      croSkullCounter++;
      require(!_exists(croSkullCounter));
      addressMintedBalance[_to]++;
      _mint(_to, croSkullCounter);
      CroSkull memory newCroSkull = CroSkull(
        croSkullCounter,
        _to,
        _to,
        address(0)
      );
      allCroSkulls[croSkullCounter] = newCroSkull;
    }
  }

  function getOwner() public view returns(address) {
    return owner;
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
}