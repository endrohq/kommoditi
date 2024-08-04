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
        string[] h3Indexes;
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

    function getParticipantTypeByAddress(address _participantAddress) internal view returns (ParticipantType) {
        if (bytes(producers[_participantAddress].name).length != 0) {
            return ParticipantType.Producer;
        } else if (bytes(ctfs[_participantAddress].name).length != 0) {
            return ParticipantType.CTF;
        } else if (bytes(consumers[_participantAddress].name).length != 0) {
            return ParticipantType.Consumer;
        }
        return ParticipantType.Producer;
    }

    function getParticipantByAddress(address _participantAddress) public view returns (ParticipantView memory) {
        ParticipantType participantType = getParticipantTypeByAddress(_participantAddress);
        if (participantType == ParticipantType.Producer) {
            return ParticipantView(producers[_participantAddress].overheadPercentage, producers[_participantAddress].name, producers[_participantAddress].locations, participantType);
        } else if (participantType == ParticipantType.CTF) {
            return ParticipantView(ctfs[_participantAddress].overheadPercentage, ctfs[_participantAddress].name, ctfs[_participantAddress].locations, participantType);
        } else if (participantType == ParticipantType.Consumer) {
            return ParticipantView(consumers[_participantAddress].overheadPercentage, consumers[_participantAddress].name, consumers[_participantAddress].locations, participantType);
        }
        return ParticipantView(0, "", new Location[](0), ParticipantType.Producer);
    }
}
