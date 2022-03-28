// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./interface/IERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/** 
    A simple and powerful layer 2 smartcontract for ERC721 NFT.
    Use this contract to assign a specific IPFS Hash to NFT Tokens, this ipfs file can
    include NFT story, Race, Birth Date and other info that can be updated by the Token's owner.
    Contract support both IERC721 and IERC20 interfaces, this mean that user can update their
    NFT hash using both ERC20 Tokens and Governance Token ( ETH, CRO ecc )
*/
contract nftDescription {
    using SafeMath for uint;

    address public owner;
    mapping (uint => string) public descriptionHashes;

    IERC20Burnable public IGrave;
    IERC721 public ICroSkull;

    uint private graveCost = 10;
    uint private decimals = 10 ** 18;

    modifier isOwner() {
        require(
            owner == msg.sender,
            "ERR_NOT_OWNER"
        );
        _;
    }

    modifier isApprovedGrave( ) {
        require( 
            _getCostInGrave() <= IGrave.allowance( msg.sender, address(this) ),
            "ERR_INCREASE_GRAVES_ALLOWANCE"
        );
        _;
    }

    modifier isSkullOwner( uint tokenId ) {
        require( 
            ICroSkull.ownerOf( tokenId ) == msg.sender,
            "ERR_NOT_OWNER_OF_TOKEN"
        );
        _;
    }

    event DescriptionUpdate( address ownerOf, uint indexed tokenId, string ipfsHash );

    constructor ( ) {
        owner = msg.sender;
    }

    /** 
        public functions
    */

    function updateUsingGrave( uint skullId, string memory ipfsHash ) public isSkullOwner( skullId ) isApprovedGrave( ) {
        IGrave.burnFrom( msg.sender, _getCostInGrave() );
        _updateSkullDescription( msg.sender, skullId, ipfsHash );
    }

    function _getCostInGrave() public view returns( uint ) {
        return graveCost
            .mul(decimals);
    }

    /**
        admin functions
    */
    
    function AdminUpdateDescription( address ownerOf, uint tokenId, string memory ipfsHash ) public isOwner() {
        _updateSkullDescription( ownerOf, tokenId, ipfsHash );
    }

    function AdminUpdateCost( uint GraveCost ) public isOwner() {

        if( GraveCost > 0 ){
            graveCost = GraveCost;
        }
    }

    function AdminSetContracts( IERC20Burnable graveContract, IERC721 croSkullContract ) public isOwner() {
        if( IERC20Burnable(address(0)) != graveContract ){
            IGrave = graveContract;
        }

        if( IERC721(address(0)) != croSkullContract ){
            ICroSkull = croSkullContract;
        }
    }

    /** 
        internal functions
    */

    function _updateSkullDescription( address sender, uint skullId, string memory ipfsHash ) internal {
        descriptionHashes[skullId] = ipfsHash;
        emit DescriptionUpdate( sender, skullId, ipfsHash );
    }
}