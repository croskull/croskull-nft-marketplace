// SPDX-License-Identifier: MIT
pragma solidity <=0.8.2;

import "./interface/IERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Locker {
    address public owner;

    uint public lockCount;

    mapping( uint => Lock ) public locks;

    struct Lock {
        uint unlockTimestamp;
        uint amount;
        address tokenAddress;
        address owner;
        string name;
    }

    modifier onlyOwner {
        require( 
            msg.sender == owner,
            "ERR_NOT_OWNER"
        );
        _;
    }

    modifier isApproved( address _token, uint _amount ) {
        require(
            IERC20(_token).allowance( msg.sender, address(this) ) >= _amount,
            "ERR_INCREASE_ALLOWANCE"
        );
        _;
    }

    event LockerCreated( uint lockerId, address tokenAddress, string name, uint amount, address owner, uint unlockTimestamp );
    event Withdraw( uint lockerId, address tokenAddress, string name, uint amount, address owner, uint withdrawTimestamp );

    constructor () {
        owner = msg.sender;
        lockCount = 0;
    }

    function createLocker( address _tokenAddress, uint _amount, uint _unlockTimestamp, string memory _name ) public onlyOwner isApproved( _tokenAddress, _amount ) {
        require( 
            _unlockTimestamp > block.timestamp,
            "ERR_UNLOCK_HIGHER_CURRENT_DATE"
        );
        require(
            _amount > 0,
            "ERR_AMOUNT_NOT_0"
        );
        require( 
            IERC20(_tokenAddress).transferFrom( msg.sender, address(this), _amount ),
            "ERR_TX_FAIL"
        );
        locks[lockCount].tokenAddress = _tokenAddress;
        locks[lockCount].unlockTimestamp = _unlockTimestamp;
        locks[lockCount].amount = _amount;
        locks[lockCount].owner = msg.sender;
        locks[lockCount].name = _name;
        emit LockerCreated( lockCount, _tokenAddress, _name, _amount, msg.sender, _unlockTimestamp );
        lockCount++;
    }

    function withdraw( uint _lockId ) public onlyOwner {
        require(
            locks[_lockId].owner == msg.sender,
            "ERR_NOT_LOCK_OWNER"
        );
        require( 
            locks[_lockId].amount > 0,
            "ERR_LOCK_WITHDRAWED"
        );
        require(
            getTimestamp() > locks[_lockId].unlockTimestamp,
            "ERR_NOT_UNLOCK_DATE"
        );
        uint amount = locks[_lockId].amount;
        require(
            IERC20(
                locks[_lockId].tokenAddress
            ).transfer( 
                msg.sender, 
                amount 
            ),
            "ERR_TX_FAIL"
        );
        locks[_lockId].amount = 0;
        emit Withdraw( _lockId, locks[_lockId].tokenAddress,  locks[_lockId].name, amount, locks[_lockId].owner, getTimestamp() );
    }

    function getTimestamp() public view returns( uint ) {
        uint timestamp = block.timestamp;
        return timestamp;
    }

    function getRemainingTime( uint _lockId ) public view returns( uint ) {
        if( locks[_lockId].unlockTimestamp > getTimestamp() ) {
            uint diff = locks[_lockId].unlockTimestamp - getTimestamp();
            return diff;
        }else{
            return 0;
        }
    }

}