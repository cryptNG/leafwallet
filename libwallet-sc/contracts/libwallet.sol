//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract libwallet  {

    mapping(address => address) private _ledger;
    mapping(address => string) private _dataStore;
    
    function isSenderRegistered() public view returns (bool) {
        return _ledger[msg.sender] != address(0);
    }


    function assignAddressToSender(address assignee) public {
        //later enable possibility to change via secret, for now its a 1 time assignment
        _ledger[assignee] = msg.sender;
        
    }

    function assignData(string calldata data) public {
        require(_ledger[msg.sender] != address(0));
        _dataStore[_ledger[msg.sender]] = data;
    }

    function getData() public view returns (string memory) {
        require(_ledger[msg.sender] != address(0));
      return  _dataStore[_ledger[msg.sender]];
    }
}