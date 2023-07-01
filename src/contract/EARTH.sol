// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "./openzeppelin-contracts/contracts/access/Ownable.sol";

contract EARTH is ERC721, Ownable {
    string constant NAME = "Earth";
    string constant SYMBOL = "EARTH";
    string constant BASE_URI = "ipfs://QmYjJDkjUG94JcYnk5TJ46qg5KjPaFfe6DAxD6iwRRHR2X/";

    uint256 _maxSupply;
    mapping(uint256 => bytes) _customData;

    constructor(uint256 maxSupply) ERC721(NAME, SYMBOL) {
        _maxSupply = maxSupply;
    }

    function owners() external view returns (address[] memory _owners) {
        _owners = new address[](_maxSupply);
        for (uint i=0; i<_owners.length; i++) {
            _owners[i] = ownerOf(i);
        }
    }

    /**
     * @dev See {IERC721-balanceOf}.
     */
    function balanceOf(address addr) public view virtual override returns (uint256) {
        if (addr == owner()) {
            uint256 count = 0;
            for (uint i=0; i<_maxSupply; i++) {
                if (ownerOf(i) == addr) {
                    count += 1;
                }
            }
            return count;
        }
        return ERC721.balanceOf(addr);
    }

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        require(_exists(tokenId), "ERC721: owner query for nonexistent token");
        if (!ERC721._exists(tokenId)) {
            return owner();
        }
        address owner = ERC721.ownerOf(tokenId);
        return owner;
    }

    function _exists(uint256 tokenId) internal view virtual override returns (bool) {
        return 0 <= tokenId && tokenId < _maxSupply;
    }

    function _baseURI() internal pure override returns (string memory) {
        return BASE_URI;
    }

    function setCustomData(uint256 index, bytes calldata data) public {
        require(ownerOf(index) == msg.sender, "not owner");
        _customData[index] = data;
    }

    function customData(uint256 index) public view returns (bytes memory) {
        return _customData[index];
    }
}
