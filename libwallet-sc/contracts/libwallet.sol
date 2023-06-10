//SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

contract libwallet  {

    mapping(address => address) private _ledger;
    mapping(address => address) private _senderledger;
    mapping(address => string) private _dataStore;


    mapping(address => address) private _deviceChain;

    mapping(address => uint16) private _maxDevices;
    
    function isSenderRegistered() public view returns (bool) {
        return _ledger[msg.sender] != address(0);
    }


    function assignAddressToSender(address assignee) public {
       if(_deviceChain[msg.sender] == assignee) return;

        //later enable possibility to change via secret, for now its a 1 time assignment
        _ledger[assignee] = msg.sender;

        uint16 md = _maxDevices[msg.sender] + 1;

        _maxDevices[msg.sender]=md;
        
        if(_deviceChain[msg.sender]!=address(0))
        {
            address previous = _deviceChain[msg.sender];
            _deviceChain[msg.sender]=assignee;
            _deviceChain[assignee] = previous; 
        }
        else 
        {
        _deviceChain[msg.sender] = assignee;
        }
        
    }


function getRelatedDevices() public view returns (address[] memory) {
    // Get the max device count for the owner
    uint16 maxDevices = _maxDevices[msg.sender];
    
    // Initialize an array of addresses with size maxDevices
    address[] memory relatedDevices = new address[](maxDevices);
    
    // If the owner has no devices, return the empty array
    if(maxDevices == 0) {
        return relatedDevices;
    }

    // Start with the first device in the chain
    address currentDevice = _deviceChain[msg.sender];

    // Traverse the linked devices
    for (uint16 i = 0; i < maxDevices; i++) {
        // Add the current device to the relatedDevices array
        relatedDevices[i] = currentDevice;

        // Move to the next device in the chain
        currentDevice = _deviceChain[currentDevice];
    }
    
    return relatedDevices;
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