// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

/**
 * @title JNToken (JNTo) — plain BEP20, no tax.
 * Total supply: 100,000 JNTo (18 decimals), minted to deployer.
 */
contract JNTo {
    string public constant name = "JNToken";
    string public constant symbol = "JNTo";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() public {
        uint256 supply = 100_000 * 10**uint256(decimals);
        totalSupply = supply;
        balanceOf[msg.sender] = supply;
        emit Transfer(address(0), msg.sender, supply);
    }

    function transfer(address recipient, uint256 amount) external returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool) {
        uint256 current = allowance[sender][msg.sender];
        require(current >= amount, "JNTo: insufficient allowance");
        if (current != uint256(-1)) {
            allowance[sender][msg.sender] = current - amount;
        }
        _transfer(sender, recipient, amount);
        return true;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "JNTo: transfer from zero");
        require(recipient != address(0), "JNTo: transfer to zero");
        require(balanceOf[sender] >= amount, "JNTo: transfer exceeds balance");
        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }
}
