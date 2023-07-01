// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Consecutive.sol";
import "./openzeppelin-contracts/contracts/access/Ownable.sol";

contract EARTH is ERC721Consecutive, Ownable {
    string constant NAME = "Earth";
    string constant SYMBOL = "EARTH";
    string constant BASE_URI = "ipfs://QmYjJDkjUG94JcYnk5TJ46qg5KjPaFfe6DAxD6iwRRHR2X/";

    uint256 _maxSupply;
    mapping(uint256 => bytes) _customData;
    mapping(uint256 => bool) private _transferred;

    constructor(uint256 maxSupply) ERC721(NAME, SYMBOL) {
        require(maxSupply < _maxBatchSize(), "supply exceeds limit");
        _maxSupply = maxSupply;
        address contractOwner = owner();
        _mintConsecutive(contractOwner, uint96(_maxSupply));
    }

    function transferred(uint256 tokenId) public view returns (bool) {
        return _transferred[tokenId];
    }

    function transferredAll() external view returns (bool[] memory _transferredAll) {
        _transferredAll = new bool[](_maxSupply);
        for (uint i=0; i<_transferredAll.length; i++) {
            _transferredAll[i] = transferred(i);
        }
    }

    /**
     * @dev Hook that is called after any token transfer. See contract ERC721
     * for more information.
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override {
        super._afterTokenTransfer(from, to, firstTokenId, batchSize);

        // If this is a minting operation, return.
        if (from == address(0)) {
            return;
        }

        for (uint i=firstTokenId; i<firstTokenId+batchSize; i++) {
            _transferred[i] = true;
        }
    }

    function _baseURI() internal pure override returns (string memory) {
        return BASE_URI;
    }

    function setCustomData(uint256 index, bytes calldata data) public {
        require(transferred(index), "not transferred");
        require(ownerOf(index) == msg.sender, "not owner");
        _customData[index] = data;
    }

    function customData(uint256 index) public view returns (bytes memory) {
        return _customData[index];
    }
}
