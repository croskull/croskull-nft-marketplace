// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interface/IERC20Burnable.sol";

contract PurplePotions is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using SafeMath for uint;
    IERC721 public blue;
    IERC721 public red;
    IERC20Burnable public  grave;
    uint public tokenCount = 0;
    uint public maxSupply = 333;
    uint public graveCost = 20 * 10**18;
    address private thisAddress = address(this);

    constructor(
        IERC721 _blue,
        IERC721 _red,
        IERC20Burnable _grave
    ) ERC721("CroSkull Purple Potion", "CSPP") {
        blue = _blue;
        red = _red;
        grave = _grave;
    }

    event PurpleBurn(uint256 potionId, address owner);

    function mergePotions(uint blueId, uint redId, string memory ipfsUri) public {
        require( tokenCount < maxSupply, "ERR_MAX_SUPPLY" );
        address user = msg.sender;
        //grave check
        uint preGraveBal = grave.balanceOf(user);
        require( grave.allowance(user, thisAddress) >= graveCost, "ERR_INCREASE_ALLOWANCE");
        require( preGraveBal >= graveCost, "ERR_BUY_GRAVE");
        grave.burnFrom(user, graveCost);
        require( grave.balanceOf(user) == preGraveBal.sub(graveCost), "GRAVE_BURN_ERROR" );
        //blue check
        require( blue.isApprovedForAll(user, thisAddress), "ERR_BLUE_APPROVAL" );
        require( blue.ownerOf(blueId) == user, "NOT_BLUE_OWNER" );
        blue.transferFrom(user, thisAddress, blueId);
        //red check
        require( red.isApprovedForAll(user, thisAddress), "ERR_RED_APPROVAL");
        require( red.ownerOf(redId) == user, "NOT_RED_OWNER" );
        red.transferFrom(user, thisAddress, redId);
        //minting
        tokenCount++;
        _safeMint(user, tokenCount);
        _setTokenURI(tokenCount, ipfsUri);
    }

    function safeMint(address to)
        public
        onlyOwner
    {
        require( tokenCount < maxSupply, "ERR_MAX_SUPPLY" );
        tokenCount++;
        _safeMint(to, tokenCount);
        _setTokenURI(tokenCount, "");
    }

    function burn(uint256 tokenId) public {
        _burn(tokenId);
        emit PurpleBurn(tokenId, msg.sender);
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    //ERC721
    function onERC721Received(address, address, uint256, bytes memory) public virtual returns (bytes4) {
        return this.onERC721Received.selector;
    }
}