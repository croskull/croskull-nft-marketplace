pragma solidity >=0.8.0;


import "./interface/IERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
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

    mapping ( address => Profile ) public profiles;
    mapping ( uint => Story ) public stories;
    mapping ( bytes32 => bool ) private followedHash;
    mapping ( bytes32 => bool ) private likedHash;
    mapping ( bytes32 => bool ) private storiesHash;


    IERC20Burnable public IGrave;
    IERC721 public ICroSkull;

    uint public CreateProfile = 20;
    uint public UpdateProfile = 5;
    uint public CreateStory = 10;
    uint private decimals = 10 ** 18;

    struct Profile {
        uint likeCount;
        uint[] liked;//Story Ids
        address[] followers;
        address[] following;
        string ipfsHash;
        bool init;
    }

    struct Story {
        address owner;
        address[] likes;
        uint likeCount;
        string ipfsHash;
    }


    modifier isUser {
        require( 
            profiles[msg.sender].init,
            "ERR_NOT_USER"
        );
        _;
    }

    modifier isOwner() {
        require(
            owner == msg.sender,
            "ERR_NOT_OWNER"
        );
        _;
    }

    modifier burnGrave( uint graveAmount ) {
        require( msg.sender != address(0) );
        require( 
            graveAmount.mul(decimals) <= IGrave.allowance( msg.sender, address(this) ),
            "ERR_INCREASE_GRAVE_ALLOWANCE"
        );
        _;
        IGrave.burnFrom(msg.sender, graveAmount.mul(decimals) );
    }

    modifier isTokenOwner( uint tokenId ) {
        require( 
            ICroSkull.ownerOf( tokenId ) == msg.sender,
            "ERR_NOT_OWNER_OF_TOKEN"
        );
        _;
    }

    event Profiles( address user, string ipfsHash );
    event Stories( address ownerOf, uint indexed tokenId, string ipfsHash );
    event Liked( address ownerOf, uint tokenId );
    event Follow( address follower, address followed );

    constructor ( ) {
        owner = msg.sender;
    }

    /** 
        public functions
    */
    function createProfile( string memory ipfsHash ) public burnGrave( CreateProfile ) {
        require( 
            ! profiles[msg.sender].init,
            "ERR_ALREADY_USER" 
        );
        profiles[msg.sender].init = true;
        _updateProfile( msg.sender, ipfsHash );
        emit Profiles( msg.sender, ipfsHash );
    }



    function updateProfile( string memory ipfsHash ) public isUser burnGrave( UpdateProfile ) {
        _updateProfile( msg.sender, ipfsHash );
        emit Profiles( msg.sender, ipfsHash );
    }



    function _updateProfile( address user, string memory ipfsHash ) internal {
        profiles[user].ipfsHash = ipfsHash;
    }



    function follow( address userToFollow ) public {
        bytes32 followHash = keccak256(
                abi.encodePacked(
                    msg.sender,
                    userToFollow
                )
            );
        if( profiles[userToFollow].init && ! followedHash[followHash] ) {
            profiles[userToFollow].followers.push(msg.sender);
            profiles[msg.sender].following.push(userToFollow);
            emit Follow( msg.sender, userToFollow );
        }
    }

    function getFollowers( address user ) public view returns(uint, address[] memory ) {
        address[] memory followerList = profiles[user].followers;

        return (followerList.length, followerList);
    }

    function getFollowing( address user ) public view returns(uint, address[] memory ) {
        address[] memory followingList = profiles[user].following;

        return (followingList.length, followingList);
    }

    function isFollowerOf( address follower, address followed ) public view returns(bool, bytes32) {
        bytes32 followHash = keccak256(
                abi.encodePacked(
                    follower,
                    followed
                )
            );
        if(  followedHash[followHash]  ){
            return ( true, followHash );
        }else{
            return( false, followHash);
        }
    }


    function createStory(uint tokenId, string memory ipfsHash ) public burnGrave( CreateStory ) isTokenOwner( tokenId ) {
        bytes32 storyHash = keccak256(
                abi.encodePacked(
                    msg.sender,
                    tokenId
                )
            );
        if( stories[tokenId].owner  != msg.sender )
            stories[tokenId].owner = msg.sender;

        stories[tokenId].ipfsHash = ipfsHash;
        storiesHash[storyHash] = true;
        emit Stories( owner, tokenId, ipfsHash );
    }

    function like( uint tokenId ) public {
        if( stories[tokenId].owner != address(0) ){
            address ownerOf = stories[tokenId].owner;
            bytes32 currentHash = keccak256(
                abi.encodePacked(
                    msg.sender,
                    ownerOf,
                    tokenId
                )
            );
            if( ! likedHash[currentHash] ) {
                profiles[ownerOf].likeCount++;
                stories[tokenId].likeCount++;
                stories[tokenId].likes.push(msg.sender);
                emit Liked( msg.sender, tokenId );
            }
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
}