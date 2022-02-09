// SPDX-License-Identifier: MITev
pragma solidity <=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ERC721.sol";

contract petEggs is ERC721 {
    using SafeMath for uint;

    address owner;

    IERC20Burnable public GRAVE;

    uint public eggCost = 500000000000000000000;
    uint public eggsCounter = 0;
    uint public eggsLimit = 2200;
    uint public eggsPerAddress = 2;

    mapping( address => uint ) public minterList;

    constructor (
        IERC20Burnable _grave
    ) ERC721( "CroSkulls Pet Eggs", "CRPE") {
        owner = msg.sender;
        GRAVE = _grave;
    }

    function purchaseEgg( address _to ) public hasBalance hasAllowance {
        require( eggsCounter < eggsLimit, "ERR_MAX_CAP_REACH" );
        require( minterList[msg.sender] < eggsPerAddress, "ERR_LIMIT_PER_ADDRESS_REACH" );
        GRAVE.burnFrom( msg.sender, eggCost );
        eggsCounter++;
        minterList[msg.sender]++;
        _mint(
            _to, 
            eggsCounter
        );
    }


    /**
        internal functions
     */

    

    /**
        admin functions 
     */
    
    function setBaseURI( string memory baseURI ) public onlyOwner {
        _setBaseURI(baseURI);
    }

    function adminMintEgg( address _to, uint amount ) public onlyOwner {
        require( eggsCounter + amount <= eggsLimit, "ERR_MAX_CAP_REACH" );
        for( uint i = 0; i < amount; i++ ){
            eggsCounter++;
            _mint(
                _to, 
                eggsCounter
            );
        }
    }

    function adminSetCost( uint _cost ) public onlyOwner {
        require( eggCost != _cost, "ERR_SAME_COST");
        require( _cost > 0, "ERR_COST_MORE_THAN_0");
        eggCost = _cost;
    }

    function adminSetToken( IERC20Burnable _contractAddress ) public onlyOwner {
        require( _contractAddress != IERC20Burnable(address(0)), "ERR_CONTRACT_NOT_0");
        GRAVE = _contractAddress;
    }

    function adminSetMaxCap( uint _newCap ) public onlyOwner {
        require( _newCap > 0, "ERR_CAP_MORE_0");
        eggsLimit = _newCap;
    }

    function adminSetMaxLimitPerAddress( uint _newLimit ) public onlyOwner {
        require( _newLimit > 0, "ERR_CAP_MORE_0" );
        eggsPerAddress = _newLimit;
    }

    /**
         modifier functions
     */

    modifier onlyOwner() {
        require( 
            owner == msg.sender,
            "ERR_NOT_OWNER"
        );
        _;
    }

    modifier hasBalance() {
        require( 
            GRAVE.balanceOf(msg.sender) >= eggCost,
            "ERR_INSUFFICIENT_BALANCE"
        );
        _;
    }

    modifier hasAllowance() {
        require(
            GRAVE.allowance(msg.sender, address(this)) >= eggCost,
            "ERR_INCREASE_ALLOWANCE"
        );
        _;
    }
}

interface IERC20Burnable is IERC20 {
    function burnFrom(address account, uint256 amount) external;
    function burn(uint256 amount) external;
}
