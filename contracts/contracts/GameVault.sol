// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract GameVault {
    address public admin;
    IERC20 public token;
    
    mapping(address => uint256) public deposits;
    mapping(address => mapping(bytes32 => bool)) public sessionKeyUsed;
    
    uint256 public casinoFeePercent = 5; // 5% 수수료

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event BetPlaced(address indexed user, bytes32 sessionKey, uint256 amount);
    event BetSettled(address indexed user, bytes32 sessionKey, uint256 winAmount);

    constructor(address _tokenAddress) {
        admin = msg.sender;
        token = IERC20(_tokenAddress);
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        deposits[msg.sender] += amount;
        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(deposits[msg.sender] >= amount, "Insufficient balance");
        deposits[msg.sender] -= amount;
        require(token.transfer(msg.sender, amount), "Transfer failed");
        emit Withdraw(msg.sender, amount);
    }

    function placeBet(bytes32 sessionKey, uint256 amount) external {
        require(!sessionKeyUsed[msg.sender][sessionKey], "Session key already used");
        require(deposits[msg.sender] >= amount, "Insufficient balance");
        deposits[msg.sender] -= amount;
        sessionKeyUsed[msg.sender][sessionKey] = true;
        emit BetPlaced(msg.sender, sessionKey, amount);
    }

    function settleBet(address user, bytes32 sessionKey, uint256 winAmount) external onlyAdmin {
        require(sessionKeyUsed[user][sessionKey], "Bet not found");
        uint256 fee = (winAmount * casinoFeePercent) / 100;
        uint256 payout = winAmount - fee;
        deposits[user] += payout;
        emit BetSettled(user, sessionKey, payout);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
}
