// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "./openzeppelin-contracts/contracts/access/Ownable.sol";

contract LAND is ERC20, Ownable {
    event Bid();
    event Concluded(address indexed to);

    string constant _name = "Earth Land";
    string constant _symbol = "ELND";
    uint8 constant _decimals = 0;
    uint256 _maxSupply;
    uint256 _duration;
    
    uint256 _start;
    uint256 _index;
    uint256 _bid;
    address _bidder;

    constructor(uint256 maxSupply_, uint256 duration) ERC20(_name, _symbol) {
        _maxSupply = maxSupply_;
        _duration = duration;
        _start = block.timestamp;
        _index = 0;
    }

    function bid() public payable {
        // Check index.
        require(_index < _maxSupply, "exhausted");

        // Check value.
        uint256 value = msg.value;
        require(value > _bid, "insufficient");

        // Refund bid.
        payable(_bidder).transfer(_bid);

        // Set bid.
        _bid = value;
        _bidder = msg.sender;

        emit Bid();
    }

    function conclude() public {
        // Check if conclude time.
        require(block.timestamp - _start >= _duration, "not ready");

        // Check bidder.
        require(_bidder != address(0), "no bidder");

        // Payout.
        _mint(_bidder, 1);
        emit Concluded(_bidder);

        // Reset.
        _start = block.timestamp;
        _bid = 0;
        _bidder = address(0);
        _index += 1;
    }

    function withdraw() public onlyOwner {
        uint256 bal = address(this).balance;
        payable(msg.sender).transfer(bal);
    }

    function index() public view returns (uint256) {
        return _index;
    }

    function concludeDate() public view returns (uint256) {
        return _start + _duration;
    }

    function getBid() public view returns (uint256) {
        return _bid;
    }

    function bidder() public view returns (address) {
        return _bidder;
    }

    function decimals() public pure override returns (uint8) {
        return _decimals;
    }

    function maxSupply() public view returns (uint256) {
        return _maxSupply;
    }
}
