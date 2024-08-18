// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ParticipantRegistry {

    enum ParticipantType {
        Producer,
        Distributor,
        Consumer
    }

    struct Location {
        string id;
        string name;
        string locationType;
        int256 centerLat;
        int256 centerLng;
    }

    struct Participant {
        uint256 overheadPercentage;
        string name;
        Location[] locations;
        address[] addressBook;
    }

    struct ParticipantView {
        uint256 overheadPercentage;
        string name;
        Location[] locations;
        ParticipantType participantType;
        address[] addressBook;
    }

    mapping(address => Participant) public participants;
    uint256 public participantCount;

    event ParticipantRegistered(address indexed participant, string name, ParticipantType participantType, uint256 overheadPercentage, Location[] locations);
    event AddressAdded(address indexed participant, address indexed addedAddress);

    function registerParticipant(string memory _name, uint256 _overheadPercentage, ParticipantType _participantType, Location[] memory _locations) public {
        require(bytes(participants[msg.sender].name).length == 0, "Participant already registered");

        participants[msg.sender].overheadPercentage = _overheadPercentage;
        participants[msg.sender].name = _name;
        for (uint i = 0; i < _locations.length; i++) {
            participants[msg.sender].locations.push(_locations[i]);
        }
        participantCount++;

        emit ParticipantRegistered(msg.sender, _name, _participantType, _overheadPercentage, _locations);
    }

    function addToAddressBook(address _address) public {
        require(bytes(participants[msg.sender].name).length != 0, "Participant not registered");
        require(_address != msg.sender, "Cannot add self to address book");
        require(bytes(participants[_address].name).length != 0, "Address to add is not a registered participant");

        for (uint i = 0; i < participants[msg.sender].addressBook.length; i++) {
            if (participants[msg.sender].addressBook[i] == _address) {
                revert("Address already in address book");
            }
        }

        participants[msg.sender].addressBook.push(_address);
        emit AddressAdded(msg.sender, _address);
    }

    function getAddressBook(address _participant) public view returns (address[] memory) {
        return participants[_participant].addressBook;
    }

    function isInAddressBook(address _participant, address _address) public view returns (bool) {
        for (uint i = 0; i < participants[_participant].addressBook.length; i++) {
            if (participants[_participant].addressBook[i] == _address) {
                return true;
            }
        }
        return false;
    }

    function getOverheadPercentage(address _participant) public view returns (uint256) {
        return participants[_participant].overheadPercentage;
    }

}
