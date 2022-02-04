// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
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

  mapping(uint256 => CroSkull) public allCroSkulls;
  mapping(address => uint256) public addressMintedBalance;

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
  constructor( ) ERC721("CROSkullAmbassador", "CRA") {
    owner = msg.sender;
    collectionName = name();
    collectionNameSymbol = symbol();
  }

  function setBaseURI( string memory baseURI ) public onlyOwner {
    _setBaseURI(baseURI);
  }

  // mint a new crypto boy
  function adminMintCroSkull(uint256 _mintAmount, address _to ) onlyOwner external {
    require(_to != address(0));
    require(_mintAmount > 0);

    uint256 supply = totalSupply();
    
    for (uint256 i = 1; i <= _mintAmount; i++) {
      croSkullCounter++;
      require(!_exists(croSkullCounter));

      addressMintedBalance[_to]++;
      _mint(_to, croSkullCounter);
      CroSkull memory newCroSkull = CroSkull(
        croSkullCounter,
        msg.sender,
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