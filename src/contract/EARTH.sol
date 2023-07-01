// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "./LAND.sol";

contract EARTH is ERC721 {
    //TODO insert hash

    event OwnershipTaken(uint256 indexed index);

    string constant _name = "Earth Land";
    string constant _symbol = "ELND";

    address _token;
    uint256 _maxSupply;

    constructor(address token) ERC721(_name, _symbol) {
        _token = token;
        _maxSupply = LAND(_token).maxSupply();
    }

    function takeOwnership(uint256 index) public {
        address buyer = msg.sender;
        require(index < _maxSupply, "out of bounds");
        require(!_exists(index), "taken");
        require(LAND(_token).transferFrom(buyer, address(this), 1), "transaction failed");

        _safeMint(buyer, index);

        emit OwnershipTaken(index);
    }

    function owners() external view returns (address[] memory _owners) {
        _owners = new address[](_maxSupply);
        for (uint i=0; i<_owners.length; i++) {
            _owners[i] = ownership(i);
        }
    }

    // ownership returns the owner of item `index` or zero if not owned.
    function ownership(uint256 index) public view returns (address owner) {
        return _exists(index) ? ownerOf(index) : address(0);
    }
}
