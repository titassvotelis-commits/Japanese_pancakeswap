// SPDX-License-Identifier: MIT
pragma solidity =0.6.6;

library TransferHelper {
    function safeApprove(address token, address to, uint value) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x095ea7b3, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: APPROVE_FAILED');
    }

    function safeTransferFrom(address token, address from, address to, uint value) internal {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FROM_FAILED');
    }
}

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

interface IExternalV2Router {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

interface ILocalRouter {
    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
}

/**
 * @title HybridSwapExecutor
 * @notice PancakeSwap (or other V2 router) hop + MetakeySwap local router hop in one transaction.
 */
contract HybridSwapExecutor {
    /// @notice externalRouter (e.g. Pancake V2) then localRouter (MetakeySwap).
    function swapExactTokensForTokensHybrid(
        address externalRouter,
        address localRouter,
        uint amountIn,
        uint amountOutMinExternal,
        address[] calldata pathExternal,
        uint amountOutMinLocal,
        address[] calldata pathLocal,
        address to,
        uint deadline
    ) external returns (uint256 amountOut) {
        require(pathExternal.length >= 2, 'HybridSwap: INVALID_EXTERNAL_PATH');
        require(pathLocal.length >= 2, 'HybridSwap: INVALID_LOCAL_PATH');
        require(pathExternal[pathExternal.length - 1] == pathLocal[0], 'HybridSwap: PATH_MISMATCH');
        require(deadline >= block.timestamp, 'HybridSwap: EXPIRED');

        TransferHelper.safeTransferFrom(pathExternal[0], msg.sender, address(this), amountIn);
        TransferHelper.safeApprove(pathExternal[0], externalRouter, amountIn);

        uint[] memory amountsExternal = IExternalV2Router(externalRouter).swapExactTokensForTokens(
            amountIn,
            amountOutMinExternal,
            pathExternal,
            address(this),
            deadline
        );
        uint256 intermediate = amountsExternal[amountsExternal.length - 1];

        uint256 balanceBefore = IERC20(pathLocal[pathLocal.length - 1]).balanceOf(to);
        TransferHelper.safeApprove(pathLocal[0], localRouter, intermediate);
        ILocalRouter(localRouter).swapExactTokensForTokensSupportingFeeOnTransferTokens(
            intermediate,
            amountOutMinLocal,
            pathLocal,
            to,
            deadline
        );
        uint256 balanceAfter = IERC20(pathLocal[pathLocal.length - 1]).balanceOf(to);
        require(balanceAfter >= balanceBefore, 'HybridSwap: INSUFFICIENT_OUTPUT_AMOUNT');
        amountOut = balanceAfter - balanceBefore;
        require(amountOut >= amountOutMinLocal, 'HybridSwap: INSUFFICIENT_OUTPUT_AMOUNT');
    }

    /// @notice MetakeySwap local router hop first, then external (e.g. Pancake V2) — e.g. JNTo→WBNB (local) then WBNB→TKO (Pancake).
    function swapExactTokensForTokensLocalFirst(
        address localRouter,
        address externalRouter,
        uint amountIn,
        uint amountOutMinLocal,
        address[] calldata pathLocal,
        uint amountOutMinExternal,
        address[] calldata pathExternal,
        address to,
        uint deadline
    ) external returns (uint256 amountOut) {
        require(pathLocal.length >= 2, 'HybridSwap: INVALID_LOCAL_PATH');
        require(pathExternal.length >= 2, 'HybridSwap: INVALID_EXTERNAL_PATH');
        require(pathLocal[pathLocal.length - 1] == pathExternal[0], 'HybridSwap: PATH_MISMATCH');
        require(deadline >= block.timestamp, 'HybridSwap: EXPIRED');

        TransferHelper.safeTransferFrom(pathLocal[0], msg.sender, address(this), amountIn);
        TransferHelper.safeApprove(pathLocal[0], localRouter, amountIn);

        uint256 balanceBeforeIntermediate = IERC20(pathLocal[pathLocal.length - 1]).balanceOf(address(this));
        ILocalRouter(localRouter).swapExactTokensForTokensSupportingFeeOnTransferTokens(
            amountIn,
            amountOutMinLocal,
            pathLocal,
            address(this),
            deadline
        );
        uint256 intermediate = IERC20(pathLocal[pathLocal.length - 1]).balanceOf(address(this)) - balanceBeforeIntermediate;
        require(intermediate > 0, 'HybridSwap: ZERO_INTERMEDIATE');

        uint256 balanceBefore = IERC20(pathExternal[pathExternal.length - 1]).balanceOf(to);
        TransferHelper.safeApprove(pathExternal[0], externalRouter, intermediate);

        IExternalV2Router(externalRouter).swapExactTokensForTokens(
            intermediate,
            amountOutMinExternal,
            pathExternal,
            to,
            deadline
        );

        uint256 balanceAfter = IERC20(pathExternal[pathExternal.length - 1]).balanceOf(to);
        require(balanceAfter >= balanceBefore, 'HybridSwap: INSUFFICIENT_OUTPUT_AMOUNT');
        amountOut = balanceAfter - balanceBefore;
        require(amountOut >= amountOutMinExternal, 'HybridSwap: INSUFFICIENT_OUTPUT_AMOUNT');
    }
}
