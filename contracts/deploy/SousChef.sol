// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

/**
 * @title SousChef — stake JNTo, earn JNTo (Pools page).
 */
contract SousChef {
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;

    address public owner;
    uint256 public rewardPerBlock;
    uint256 public lastRewardBlock;
    uint256 public accRewardPerShare;
    uint256 public totalStaked;

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
    }

    mapping(address => UserInfo) public userInfo;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Harvest(address indexed user, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event RewardPerBlockUpdated(uint256 rewardPerBlock);

    modifier onlyOwner() {
        require(msg.sender == owner, "SousChef: not owner");
        _;
    }

    constructor(IERC20 _stakingToken, uint256 _rewardPerBlock) public {
        owner = msg.sender;
        stakingToken = _stakingToken;
        rewardToken = _stakingToken;
        rewardPerBlock = _rewardPerBlock;
        lastRewardBlock = block.number;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "SousChef: zero owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function setRewardPerBlock(uint256 _rewardPerBlock) external onlyOwner {
        updatePool();
        rewardPerBlock = _rewardPerBlock;
        emit RewardPerBlockUpdated(_rewardPerBlock);
    }

    function pendingReward(address _user) external view returns (uint256) {
        UserInfo storage user = userInfo[_user];
        uint256 acc = accRewardPerShare;
        if (block.number > lastRewardBlock && totalStaked > 0) {
            uint256 multiplier = block.number - lastRewardBlock;
            uint256 reward = multiplier * rewardPerBlock;
            acc = acc + (reward * 1e18) / totalStaked;
        }
        return (user.amount * acc) / 1e18 - user.rewardDebt;
    }

    function updatePool() public {
        if (block.number <= lastRewardBlock || totalStaked == 0) {
            lastRewardBlock = block.number;
            return;
        }
        uint256 multiplier = block.number - lastRewardBlock;
        uint256 reward = multiplier * rewardPerBlock;
        accRewardPerShare = accRewardPerShare + (reward * 1e18) / totalStaked;
        lastRewardBlock = block.number;
    }

    function deposit(uint256 _amount) external {
        require(_amount > 0, "SousChef: zero amount");
        UserInfo storage user = userInfo[msg.sender];
        updatePool();
        if (user.amount > 0) {
            uint256 pending = (user.amount * accRewardPerShare) / 1e18 - user.rewardDebt;
            if (pending > 0) {
                _safeRewardTransfer(msg.sender, pending);
                emit Harvest(msg.sender, pending);
            }
        }
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        user.amount = user.amount + _amount;
        totalStaked = totalStaked + _amount;
        user.rewardDebt = (user.amount * accRewardPerShare) / 1e18;
        emit Deposit(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external {
        UserInfo storage user = userInfo[msg.sender];
        require(user.amount >= _amount, "SousChef: insufficient stake");
        updatePool();
        uint256 pending = (user.amount * accRewardPerShare) / 1e18 - user.rewardDebt;
        if (pending > 0) {
            _safeRewardTransfer(msg.sender, pending);
            emit Harvest(msg.sender, pending);
        }
        if (_amount > 0) {
            user.amount = user.amount - _amount;
            totalStaked = totalStaked - _amount;
            stakingToken.transfer(msg.sender, _amount);
        }
        user.rewardDebt = (user.amount * accRewardPerShare) / 1e18;
        emit Withdraw(msg.sender, _amount);
    }

    function emergencyWithdraw() external {
        UserInfo storage user = userInfo[msg.sender];
        uint256 amount = user.amount;
        user.amount = 0;
        user.rewardDebt = 0;
        totalStaked = totalStaked - amount;
        stakingToken.transfer(msg.sender, amount);
        emit Withdraw(msg.sender, amount);
    }

    function _safeRewardTransfer(address _to, uint256 _amount) internal {
        uint256 bal = rewardToken.balanceOf(address(this));
        if (_amount > bal) {
            rewardToken.transfer(_to, bal);
        } else {
            rewardToken.transfer(_to, _amount);
        }
    }
}
