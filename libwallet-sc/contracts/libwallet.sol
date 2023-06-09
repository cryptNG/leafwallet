//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract LibWallet  {

    mapping(address => address) private _ledger;
    
    function isSenderRegistered() public view returns (bool) {
        return _ledger[_msgSender()] != address(0);
    }


    function assignAddressToSender(address assignee) public {
        //later enable possibility to change via secret, for now its a 1 time assignment
        _ledger[assignee] = _msgSender();
        
    }

}