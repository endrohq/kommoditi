// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ParticipantRegistry {

    enum ParticipantType {
        Producer,
        CTF,
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
    }

    struct ParticipantView {
        uint256 overheadPercentage;
        string name;
        Location[] locations;
        ParticipantType participantType;
    }

    mapping(address => Participant) public ctfs;
    uint256 public ctfCount;

    mapping(address => Participant) public consumers;
    uint256 public consumerCount;

    mapping(address => Participant) public producers;
    uint256 public producerCount;

    event ParticipantRegistered(address indexed participantAddress, string name, ParticipantType participantType);

    function registerParticipant(string memory _name, uint256 _overheadPercentage, ParticipantType _participantType, Location[] memory _locations) public {

        if (_participantType == ParticipantType.Producer) {
            producers[msg.sender].overheadPercentage = _overheadPercentage;
            producers[msg.sender].name = _name;
            delete producers[msg.sender].locations;
            for (uint i = 0; i < _locations.length; i++) {
                producers[msg.sender].locations.push(_locations[i]);
            }
            producerCount++;
        } else if (_participantType == ParticipantType.CTF) {
            ctfs[msg.sender].overheadPercentage = _overheadPercentage;
            ctfs[msg.sender].name = _name;
            delete ctfs[msg.sender].locations;
            for (uint i = 0; i < _locations.length; i++) {
                ctfs[msg.sender].locations.push(_locations[i]);
            }
            ctfCount++;
        } else if (_participantType == ParticipantType.Consumer) {
            consumers[msg.sender].overheadPercentage = _overheadPercentage;
            consumers[msg.sender].name = _name;
            delete consumers[msg.sender].locations;
            for (uint i = 0; i < _locations.length; i++) {
                consumers[msg.sender].locations.push(_locations[i]);
            }
            consumerCount++;
        }

        emit ParticipantRegistered(msg.sender, _name, _participantType);
    }

    function getParticipantByAddress(address _participantAddress) public view returns (ParticipantView memory) {
        if (bytes(producers[_participantAddress].name).length != 0) {
            return ParticipantView(producers[_participantAddress].overheadPercentage, producers[_participantAddress].name, producers[_participantAddress].locations, ParticipantType.Producer);
        } else if (bytes(ctfs[_participantAddress].name).length != 0) {
            return ParticipantView(ctfs[_participantAddress].overheadPercentage, ctfs[_participantAddress].name, ctfs[_participantAddress].locations, ParticipantType.CTF);
        } else if (bytes(consumers[_participantAddress].name).length != 0) {
            return ParticipantView(consumers[_participantAddress].overheadPercentage, consumers[_participantAddress].name, consumers[_participantAddress].locations, ParticipantType.Consumer);
        }
        return ParticipantView(0, "", new Location[](0), ParticipantType.Producer);
    }

    function getParticipants() public view returns (ParticipantView[] memory) {
        ParticipantView[] memory participants = new ParticipantView[](producerCount + ctfCount + consumerCount);
        uint256 index = 0;
        for (uint i = 0; i < producerCount; i++) {
            participants[index] = ParticipantView(producers[address(uint160(i))].overheadPercentage, producers[address(uint160(i))].name, producers[address(uint160(i))].locations, ParticipantType.Producer);
            index++;
        }
        for (uint i = 0; i < ctfCount; i++) {
            participants[index] = ParticipantView(ctfs[address(uint160(i))].overheadPercentage, ctfs[address(uint160(i))].name, ctfs[address(uint160(i))].locations, ParticipantType.CTF);
            index++;
        }
        for (uint i = 0; i < consumerCount; i++) {
            participants[index] = ParticipantView(consumers[address(uint160(i))].overheadPercentage, consumers[address(uint160(i))].name, consumers[address(uint160(i))].locations, ParticipantType.Consumer);
            index++;
        }
        return participants;
    }
}
