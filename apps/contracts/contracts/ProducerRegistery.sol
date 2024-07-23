// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract ProducerRegistry {
    struct Producer {
        string name;
        string location;
        string h3Index;
    }

    mapping(address => Producer) public producers;

    event ProducerRegistered(address indexed producerAddress, string name, string location, string h3Index);

    function registerProducer(string memory _name, string memory _location, string memory _h3Index) public {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_location).length > 0, "Location cannot be empty");
        require(bytes(_h3Index).length > 0, "H3 index cannot be empty");

        producers[msg.sender] = Producer(_name, _location, _h3Index);
        emit ProducerRegistered(msg.sender, _name, _location, _h3Index);
    }

    function getProducer(address _producerAddress) public view returns (Producer memory) {
        return producers[_producerAddress];
    }
}
