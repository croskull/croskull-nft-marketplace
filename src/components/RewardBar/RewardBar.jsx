import React from "react";

/**
 * 
 * @param {
      totalRewardPool: 0,
      currentRewardFee: 0,
      currentReward: 0,
      isRewardable: 0} param0 
 * @returns 
 */
const RewardBar = ( { totalRewardPool, currentRewardFee, currentReward, isWithdraw, handleWithdraw } ) => {
    const fireWithdraw = () => {
        handleWithdraw()
    }
    return (
    <nav className="navbar navbar-expand-sm navbar-dark border-shadow header">
        <div id="navbarNav" className="collapse navbar-collapse">
          <ul
            style={{ fontSize: "0.8rem", letterSpacing: "0.2rem" }}
            className="navbar-nav ml-auto"
          >
            <li key="1" className="nav-item">
                Total Reward Pool: {totalRewardPool}
            </li>
            <li key="2" className="nav-item">
                Reward Fee: {currentRewardFee}
            </li>
            <li key="3" className="nav-item">
                Current Reward: {currentReward}
            </li>
          </ul>
          <button
            onClick={ 
                fireWithdraw
                //doing qualcosa
            }
            disabled={! isWithdraw ? 'disabled' :'' }
          >
              Withdraw
          </button>
        </div>
    </nav>
  );
};

export default RewardBar;
