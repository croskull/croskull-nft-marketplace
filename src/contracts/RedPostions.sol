// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
pragma abicoder v2;

// import ERC721 iterface
import "./ERC721.sol";

// CroSkulls smart contract inherits ERC721 interface
contract CroSkullsRedPotions is ERC721 {
  using SafeMath for uint256;

  string public collectionName;
  string public collectionNameSymbol;
  uint256 public potionsCounter;
  address public owner;

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  // initialize contract while deployment with contract's collection name and token
  constructor( ) ERC721("CroSkullsRedPotions", "CSRP") {
    owner = msg.sender;
    collectionName = name();
    collectionNameSymbol = symbol();
  }

  function setBaseURI( string memory baseURI ) public onlyOwner {
    _setBaseURI(baseURI);
  }

  // mint a new crypto boy
  function adminMintCroSkull(address[] memory  _to) onlyOwner external {
    for (uint256 i = 0; i <= _to.length - 1; i++) {
      potionsCounter++;
      require(!_exists(potionsCounter));
      _mint(_to[i], potionsCounter);
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