pragma solidity >0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
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

    IERC20 public IGrave; // ERC20 token used to pay transaction
    IERC721 public ICroSkull; // ERC721 token used to check ownership

    uint private graveCost = 200; //cost for erc20 token
    uint private croCost = 50; //cost for current chain governance token, ex ethereum > ETH, avalance > AVAX, bsc > BNB, cronos > CRO
    uint private decimals = 1e18;//decimals of ERC20 token

    address public contractAddress = address(this);

    modifier isOwner() {
        require(
            owner == msg.sender,
            "ERR_NOT_OWNER"
        );
        _;
    }

    modifier isApprovedCRO( ) {
        require( 
            _getcostInCRO() == msg.value,
            "ERR_INSUFFICIENT_CRO" 
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

    constructor ( ) {
        owner = msg.sender;
    }

    /** 
        public functions
    */
    function updateUsingCRO( uint skullId, string memory ipfsHash ) public payable isSkullOwner( skullId ) isApprovedGrave {
        _updateSkullDescription( msg.sender, skullId, ipfsHash );
    }

    function updateUsingGrave( uint skullId, string memory ipfsHash ) public isSkullOwner( skullId ) isApprovedGrave( ) {
        uint cost = _getCostInGrave();
        require( 
            IGrave.transferFrom( msg.sender, address(this),  cost ),
            "ERR_GRAVE_PAYMENT_FAILED"
        );
        _updateSkullDescription( msg.sender, skullId, ipfsHash );
    }

    function _getCostInGrave() public view returns( uint ) {
        return graveCost
            .mul(decimals);
    }

    function _getcostInCRO() public view returns(uint) {
        return CROCost
            .mul(decimals);
    }

    /**
        admin functions
    */
    
    function AdminUpdateDescription( address ownerOf, uint tokenId, string memory ipfsHash ) public isOwner {
        _updateSkullDescription( ownerOf, tokenId, ipfsHash );
    }

    function AdminUpdateCost( uint CROCost, uint GraveCost ) public isOwner() {
        if( CROCost > 0 ){
            croCost = CROCost;
        }

        if( GraveCost > 0 ){
            graveCost = GraveCost;
        }
    }

    function AdminSetContracts( IERC20 graveContract, IERC721 croSkullContract ) public isOwner {
        if( IERC20(address(0)) != graveContract ){
            IGrave = graveContract;
        }

        if( IERC721(address(0)) != croSkullContract ){
            ICroSkull = croSkullContract;
        }
    }

    function AdminWithdraw( address payable _reciever ) public isOwner {
        AdminWithdrawCRO( _reciever );
        AdminWithdrawGraves( _reciever );
    }

    function AdminWithdrawCRO( address payable _reciever ) public isOwner {
        uint balance = contractAddress.balance;
        if( balance > 0 ) {
            _reciever.transfer( balance );
        }
    }

    function AdminWithdrawGraves( address _reciever ) public isOwner {
        uint balance = graveBalance;
        if( balance > 0 ){
            IGrave.transferFrom( 
                address(this), 
                _reciever,
                balance
            );
        }
    }

    function graveBalance( ) public isOwner view returns( uint ) {
        return IToken.balanceOf( contractAddress );
    }

    /** 
        internal functions
    */

    function _updateSkullDescription( address sender, uint skullId, string memory ipfsHash ) internal {
        descriptionHashes[skullId] = ipfsHash;
        emit DescriptionUpdate( sender, skullId, ipfsHash );
    }

    /**
        events
     */
    event DescriptionUpdate( address ownerOf, uint indexed tokenId, string ipfsHash );
}