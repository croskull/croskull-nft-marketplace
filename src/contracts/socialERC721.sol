pragma solidity >8.0.11;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract socialERC721 {
    using SafeMath for uint;
    address owner;

    IERC721 public collection;
    IERC20 public token;

    //profile
    mapping ( uint => bytes32 ) public profiles;
    //stories
    mapping ( bytes32 => string ) internal stories; // abi.encode(uint skullId,address ownerOf,uint timestamp,int8 type);
    //mapping (uint => bytes32) public stories;
    uint[] public durations = [86400,259200,604800];//0 - 1d, 1 - 3d, 1 - 7d
    uint[] internal costs = [10,8,17];
    
    constructor (){
        owner = msg.sender;
    }

    function postStory( uint _tokenId, uint _duration ) public isSkullOwner {
        require(_duration <= durations.length );
        _postStory( _tokenId, msg.sender, block.timestamp, _duration);
    }

    function _postStory( uint _tokenId, address _ownerOf, uint _timestamp, uint _duration ) {
        uint duration = durations[_duration];
        uint cost = costs[_duration];
        require( token.balanceOf(_ownerOf) >= cost, "ERR_INSUFFICIENT_TOKEN");
        require( token.allowance(_ownerOf, address(this)) => cost , "ERR_INCREASE_ALLOWANCE");
        require( token.transferFrom( _ownerOf, address(this), cost ), "ERR_TRANSFER_PROBLEM" );
        bytes32 storyHash = keccak256( abi.encode(
            _tokenId,
            _ownerOf,
            _timestamp,
            _duration
        ) );
        emit StoryPost(_tokenId, _ownerOf, _timestamp, _duration);
    }

    function getStory( uint _tokenId, address _ownerOf, uint _timestamp, uint _duration ) public view returns(string memory){
        uint storyDuration = durations[_duration];
        require( _timestamp.add(storyDuration) <= block.timestamp, "ERR_STORY_EXPIRED");
        bytes32 storyHash = keccak256( abi.encode(
            _tokenId,
            _ownerOf,
            _timestamp,
            _duration
        ) );

        string memory storyIpfsHash = stories[storyHash];
        return storyIpfsHash;
    }

    /* Events */
    event ProfileUpdate( address ownerOf, uint indexed tokenId, string ipfsHash );
    event StoryPost( uint tokenId, address ownerOf, uint timestamp, uint duration );

    /* Modifiers */
    modifier isOwner() {
        require(
            owner == msg.sender,
            "ERR_NOT_OWNER"
        );
        _;
    }

    modifier isApprovedCRO( ) {
        require( 
            _getCostInCRO() == msg.value,
            "ERR_INSUFFICIENT_CRO" 
        );
        _;
    }

    modifier isApprovedGrave( ) {
        require( 
            _getCostInGrave() <= paymentToken.allowance( msg.sender, address(this) ),
            "ERR_INCREASE_GRAVES_ALLOWANCE"
        );
        _;
    }

    modifier isSkullOwner( uint tokenId ) {
        require( 
            nftToken.ownerOf( tokenId ) == msg.sender,
            "ERR_NOT_OWNER_OF_TOKEN"
        );
        _;
    }
}