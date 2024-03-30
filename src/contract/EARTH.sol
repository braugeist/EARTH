// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "./openzeppelin-contracts/contracts/access/Ownable.sol";
import "./openzeppelin-contracts/contracts/utils/Strings.sol";
import "./openzeppelin-contracts/contracts/utils/Base64.sol";

contract EARTH is ERC721, Ownable {
    using Strings for uint256;

    string constant NAME = "EARTH";
    string constant SYMBOL = "EARTH";
    string constant IMAGE_BASE_URI = "ipfs://QmckZx54qkufApdV499BJSyTDZTw6bxGGtJdgRNvk8iaM7";
    uint constant NUM_TILES = 812;
    uint constant NUM_PENTAGONS = 12;

    event CustomDataChanged(uint256 indexed tokenId);

    uint256 _maxSupply;
    mapping(uint256 => bytes) _customData;

    constructor() ERC721(NAME, SYMBOL) {
        _maxSupply = NUM_TILES;
    }

    function mint(uint256 index) payable public {
        address minter = msg.sender;
        require(index < _maxSupply, "out of bounds");
        require(msg.value >= 0.08 ether, "not enough ETH (0.08)");

        _safeMint(minter, index);
    }

    /**
     * Return owner of tile or zero address if not minted.
     */
    function ownerOfOrZero(uint256 tokenId) public view returns (address) {
        if (!_exists(tokenId)) {
            return address(0);
        }
        return ownerOf(tokenId);
    }

    /**
     * Return an array with all tile owners. If tile is not minted, address is zero.
     */
    function owners() external view returns (address[] memory _owners) {
        _owners = new address[](_maxSupply);
        for (uint i=0; i<_owners.length; i++) {
            _owners[i] = ownerOfOrZero(i);
        }
    }

    /**
     * Transfer contract funds to owner.
     */
    function withdraw() public onlyOwner {
        address owner = owner();
        uint256 balance = address(this).balance;
        payable(owner).transfer(balance);
    }

    /**
     * Meta data
     */

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        bytes memory dataURI = abi.encodePacked(
            '{',
                '"name": "Tile #', tokenId.toString(), '",',
                '"image": "', IMAGE_BASE_URI, "/tile", tokenId.toString(), '.jpeg",',
                '"attributes": ', '[',
                    '{',
                        '"trait_type": "Shape",',
                        '"value": "', _shape(tokenId), '"',
                    '},',
                    '{',
                        '"trait_type": "Message",',
                        '"value": "', customData(tokenId), '"',
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

    /**
     * Custom data
     */

    function setCustomData(uint256 index, bytes calldata data) public {
        require(ownerOf(index) == msg.sender, "not owner");
        _customData[index] = data;
        emit CustomDataChanged(index);
    }

    function customData(uint256 index) public view returns (bytes memory) {
        return _customData[index];
    }

    function customDataAll() external view returns (bytes[] memory _customDataAll) {
        _customDataAll = new bytes[](_maxSupply);
        for (uint i=0; i<_customDataAll.length; i++) {
            _customDataAll[i] = customData(i);
        }
    }
}
