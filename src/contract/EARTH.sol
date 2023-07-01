// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Consecutive.sol";
import "./openzeppelin-contracts/contracts/access/Ownable.sol";
import "./openzeppelin-contracts/contracts/utils/Strings.sol";
import "./openzeppelin-contracts/contracts/utils/Base64.sol";

contract EARTH is ERC721Consecutive, Ownable {
    using Strings for uint256;

    string constant NAME = "Earth";
    string constant SYMBOL = "EARTH";
    string constant IMAGE_BASE_URI = "ipfs://QmckZx54qkufApdV499BJSyTDZTw6bxGGtJdgRNvk8iaM7";
    uint constant NUM_PENTAGONS = 12;

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

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        bytes memory dataURI = abi.encodePacked(
            '{',
                '"name": "Tile ', tokenId.toString(), '",',
                '"description": "This is one of ', _maxSupply.toString(), ' EARTH tiles.",',
                '"image": "', IMAGE_BASE_URI, "/tile", tokenId.toString(), '.jpeg"',
                '"attributes": ', '[',
                    '{',
                        '"trait_type": "Shape",',
                        '"value": "', _shape(tokenId), '",',
                    '}',
                    '{',
                        '"trait_type": "Message",',
                        '"value": "', customData(tokenId), '",',
                    '}',
                ']',
            '}'
        );
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }

    function _shape(uint256 tokenId) internal pure returns (string memory) {
        if (tokenId < NUM_PENTAGONS) {
            return "Pentagon";
        }
        return "Hexagon";
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
